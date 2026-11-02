"""Corta um áudio único (ex.: uma geração do ElevenLabs com várias falas) em uma fala por linha.

Uso:  python3 ferramentas/alinhar_voz.py AUDIO.mp3 FALAS.txt SAIDA.json [voz_kokoro]
  FALAS.txt  = uma fala por linha, na ordem em que foram faladas.
  voz_kokoro = pm_alex (narrador, padrão), pm_santa (Dudu), pf_dora (mãe).

Método: 1) programação dinâmica escolhe as pausas que melhor batem com o tamanho de cada fala;
2) alinhamento acústico (DTW de MFCC contra uma versão sintética das mesmas frases) confere cada corte
   e, quando os dois discordam (> 0,3 s), usa a pausa mais próxima do ponto do DTW.
"""
import json, os, re, subprocess, sys, warnings
import numpy as np
warnings.filterwarnings("ignore")
import librosa
from kokoro_onnx import Kokoro

AUDIO, TXT, OUT = sys.argv[1:4]
VOZ = sys.argv[4] if len(sys.argv) > 4 else "pm_alex"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
lines = [l.strip() for l in open(TXT, encoding="utf-8") if l.strip()]
n = len(lines)
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", AUDIO],
                           capture_output=True, text=True).stdout)


def silences(noise, d):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", AUDIO, "-af", f"silencedetect=noise={noise}dB:d={d}", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    return [(a, min([e for e in en if e > a], default=dur)) for a in st]


# pausas: começa exigente e afrouxa se não houver pausas suficientes
for noise, d in ((-40, .25), (-35, .12), (-30, .06), (-26, .04)):
    allsil = silences(noise, d)
    lead = allsil[0][1] if allsil and allsil[0][0] < .05 else 0.0
    tail = allsil[-1][0] if allsil and allsil[-1][1] >= dur - .05 else dur
    sil = [s for s in allsil if s[0] > lead + .15 and s[1] < tail - .05]
    if len(sil) >= n - 1:
        break


def w(l):
    return len(re.sub(r"[^\wÀ-ú]", "", l)) + 4 * l.count("...") + 1.5 * len(re.findall(r"[,.?!]", l))


W = [w(l) for l in lines]
m = len(sil)
rate = (tail - lead - sum(b - a for a, b in sil) * .5) / sum(W)
starts = [lead] + [b for a, b in sil]
ends = [a for a, b in sil] + [tail]
INF = 1e18
cost = lambda i, s, e: (e - s - rate * W[i]) ** 2 / (rate * W[i])
bonus = lambda j: .6 * (sil[j][1] - sil[j][0]) if j < m else 0
dp = [[INF] * (m + 1) for _ in range(n)]; bk = [[-1] * (m + 1) for _ in range(n)]
for j in range(m + 1):
    dp[0][j] = cost(0, starts[0], ends[j]) - bonus(j)
for i in range(1, n):
    for j in range(m + 1):
        for k in range(j):
            c = dp[i - 1][k] + cost(i, starts[k + 1], ends[j]) - bonus(j)
            if c < dp[i][j]:
                dp[i][j], bk[i][j] = c, k
j = m; seg = []
for i in range(n - 1, -1, -1):
    k = bk[i][j] if i > 0 else -1
    seg.append([starts[k + 1], ends[j]]); j = k
seg = seg[::-1]

# conferência acústica
SR, HOP = 16000, 320
kk = Kokoro(os.path.join(ROOT, "models", "kokoro-v1.0.onnx"), os.path.join(ROOT, "models", "voices-v1.0.bin"))
FON = {"streamer": "strímer", "setup": "setáp", "live": "láive", "ring light": "ríng láit"}
ref, b0 = [], []
for l in lines:
    t = l
    for a, b in FON.items():
        t = re.sub(a, b, t, flags=re.I)
    s, sr = kk.create(t, voice=VOZ, speed=1.0, lang="pt-br")
    s = librosa.resample(s.astype(np.float32), orig_sr=sr, target_sr=SR)
    s, _ = librosa.effects.trim(s, top_db=35)
    b0.append(sum(len(x) for x in ref)); ref += [s, np.zeros(int(.35 * SR), np.float32)]
ref = np.concatenate(ref)
y, _ = librosa.load(AUDIO, sr=SR)
feat = lambda x: (lambda q: (q - q.mean(1, keepdims=True)) / (q.std(1, keepdims=True) + 1e-6))(
    librosa.feature.mfcc(y=x, sr=SR, n_mfcc=20, hop_length=HOP, n_fft=1024)[1:])
_, wp = librosa.sequence.dtw(X=feat(ref), Y=feat(y), metric="cosine"); wp = wp[::-1]
def dtw_t(sample):
    idx = np.where(wp[:, 0] >= sample // HOP)[0]
    return wp[idx[0], 1] * HOP / SR if len(idx) else dur

fine = silences(-30, .05)
for i in range(1, n):
    td = dtw_t(b0[i])
    if abs(seg[i][0] - td) > .3:
        cand = [s for s in fine if abs(s[1] - td) < .5 and seg[i - 1][0] < s[0] and s[1] < seg[i][1]]
        if cand:
            a, b = min(cand, key=lambda s: abs(s[1] - td))
            print(f"  ajuste: fala {i + 1} começa em {b:.2f}s (pausas diziam {seg[i][0]:.2f}s, acústico {td:.2f}s)")
            seg[i - 1][1], seg[i][0] = a, b

for (s, e), l in zip(seg, lines):
    print(f"{s:6.2f}-{e:6.2f}  {l}")
json.dump([dict(text=l, s=round(s, 3), e=round(e, 3)) for (s, e), l in zip(seg, lines)],
          open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("salvo:", OUT)
