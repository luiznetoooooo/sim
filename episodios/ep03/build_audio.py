"""Episódio 1 (v2) – narração neural, legenda sincronizada, trilha e efeitos.
Gera: audio/master.wav e timeline.js (lido pela animação)."""
import json, os
import numpy as np, soundfile as sf
from scipy import signal
from kokoro_onnx import Kokoro

D = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(D, "..", "..", "models")
os.makedirs(os.path.join(D, "audio"), exist_ok=True)
SR = 44100
FPS = 30
rng = np.random.default_rng(11)

# ---------------------------------------------------------------- roteiro
# "|" separa os blocos da legenda, *amarelo*, _azul_. "say" = grafia para a voz.
SCRIPT = [
 dict(id="votaram",  spk="N", pause=0.35, text="Vocês votaram. | O *cabelo* | do Dudu | vai ser *cortado*."),
 dict(id="barbeiro", spk="N", pause=0.80, text="Barbeiro: | *trinta e cinco* | reais. | Orçamento do Dudu: | *cinquenta* | *centavos*."),
 dict(id="eu",       spk="D", pause=0.35, text="Eu mesmo | *corto*! | Ao *vivo*!"),
 dict(id="tesoura",  spk="N", pause=0.40, text="Quarenta e oito | espectadores. | Uma *tesoura* | de cozinha. | E um tutorial | em velocidade | *dois*."),
 dict(id="topete",   spk="N", pause=0.50, text="Primeiro corte: | o *topete*."),
 dict(id="voltou",   spk="N", pause=0.60, text="O topete | *voltou*."),
 dict(id="lados",    spk="N", pause=0.30, text="O lado esquerdo | ficou *curto*. | Pra igualar, | ele cortou | o *direito*."),
 dict(id="igualar",  spk="N", pause=0.50, text="Pra igualar | de novo... | cortou o *esquerdo*."),
 dict(id="cogumelo", spk="N", pause=0.40, text="O chat | já tinha | um apelido | pra ele: | *cogumelo*."),
 dict(id="mae",      spk="M", pause=0.40, text="*Dudu*! | Larga essa | *tesoura*!"),
 dict(id="maquina",  spk="N", pause=0.40, text="A mãe | chegou | com a *máquina*."),
 dict(id="consertou",spk="N", pause=0.40, text="Em *cinco minutos*, | ela consertou | o que ele levou | *meia hora* | pra estragar."),
 dict(id="rosto",    spk="N", pause=0.40, text="E de brinde, | *lavou o rosto* | dele."),
 dict(id="apresentavel", spk="N", pause=0.50, text="Pela primeira vez... | o Dudu | tá *apresentável*."),
 dict(id="duzentos", spk="N", pause=0.40, text="*Duzentos e trinta* | espectadores."),
 dict(id="desconhecido", spk="N", pause=0.40, text="E o desconhecido | voltou: | agora sim. | *Pena* | as piadas."),
 dict(id="engracado",spk="D", pause=0.40, text="Mas eu sou | *engraçado*!"),
 dict(id="naoe",     spk="N", pause=1.00, text="Ele | *não é*."),
 dict(id="topete2",  spk="N", pause=0.70, text="E o topete... | continua | *lá*."),
 dict(id="opcoes",   spk="N", pause=0.35, text="Agora: | aprender | a ser *engraçado*... | ou fazer live | com outro _streamer_?", say="Agora: aprender a ser engraçado... ou fazer láive com outro strímer?"),
 dict(id="comenta",  spk="N", pause=0.20, text="Comenta | *uma palavra* | aqui embaixo."),
 dict(id="ep4",      spk="N", pause=1.80, text="A mais | votada | vira o | *episódio quatro*."),
]

VOICE = dict(N=("pm_alex", 1.08), D=("pm_santa", 1.12), M=("pf_dora", 1.02))


def parse_chunks(text):
    chunks = []
    for raw in text.split("|"):
        words, state, cur, curc = [], None, "", None
        for ch in raw.strip():
            if ch in "*_":
                mark = "y" if ch == "*" else "b"
                state = None if state == mark else mark
                continue
            if ch == " ":
                if cur:
                    words.append(dict(w=cur, c=curc)); cur, curc = "", None
                continue
            if not cur:
                curc = state
            cur += ch
        if cur:
            words.append(dict(w=cur, c=curc))
        chunks.append(words)
    return chunks


def frame_rms(x, hop):
    n = len(x) // hop
    return np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="high", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="low", fs=SR, output="sos"), x)


# ---------------------------------------------------------------- vozes
kk = Kokoro(os.path.join(M, "kokoro-v1.0.onnx"), os.path.join(M, "voices-v1.0.bin"))
# vozes externas (ElevenLabs etc.): áudio único + cortes por fala
import librosa
EXT_SRC, EXT_I = {}, {}
for spk, (af, jf) in {"N": ("ext/narrador.mp3", "ext/narrador_align.json"),
                      "D": ("ext/dudu.mp3", "ext/dudu_align.json"),
                      "M": ("ext/mae.mp3", "ext/mae_align.json")}.items():
    af, jf = os.path.join(D, af), os.path.join(D, jf)
    if os.path.exists(af) and os.path.exists(jf):
        y, _ = librosa.load(af, sr=SR, mono=True)
        EXT_SRC[spk] = [y[int(max(0, a["s"] - .04) * SR):int((a["e"] + .10) * SR)].astype(np.float64) for a in json.load(open(jf))]
        n = sum(1 for it in SCRIPT if it["spk"] == spk)
        assert len(EXT_SRC[spk]) == n, (spk, len(EXT_SRC[spk]), n)
print("vozes externas:", {k: len(v) for k, v in EXT_SRC.items()})
segs, cursor = [], 0.35
for item in SCRIPT:
    chunks = parse_chunks(item["text"])
    plain = " ".join(w["w"] for c in chunks for w in c)
    ext = item["spk"] in EXT_SRC
    if ext:
        k = EXT_I.get(item["spk"], 0); EXT_I[item["spk"]] = k + 1
        x = EXT_SRC[item["spk"]][k]
    else:
        v, sp = VOICE[item["spk"]]
        s, sr = kk.create(item.get("say", plain), voice=v, speed=sp, lang="pt-br")
        x = signal.resample_poly(s.astype(np.float64), 147, 80)
    # recorte de silêncio
    env = frame_rms(x, 441)
    thr = env.max() * 0.035
    idx = np.where(env > thr)[0]
    a, b = max(0, idx[0] - 3) * 441, min(len(x), (idx[-1] + 4) * 441)
    x = x[a:b]
    # timbre por personagem
    if item["spk"] == "D" and not ext:
        x = hp(x, 140) + 0.25 * bp(x, 2500, 5000)  # mic barato, mais "presença"
    elif item["spk"] == "M" and not ext:
        x = bp(x, 380, 3400, 2) * 1.6               # voz "de longe"/mensagem
    # nivelamento
    env = frame_rms(x, 441)
    speech = env[env > env.max() * 0.1]
    x *= 0.11 / (np.sqrt(np.mean(speech ** 2)) + 1e-9)
    x = np.clip(x, -0.98, 0.98)
    d = len(x) / SR

    # alinhamento dos blocos de legenda: pausas internas = vírgulas/pontos
    env = frame_rms(x, 441)
    sil = env < env.max() * 0.06
    pauses, run = [], None
    for i, sflag in enumerate(sil):
        if sflag and run is None:
            run = i
        if not sflag and run is not None:
            if i - run >= 7 and run > 5:
                pauses.append(((run) / 100, (i) / 100))
            run = None
    weights = [sum(len(w["w"].strip(".,!?…")) for w in c) + 3 for c in chunks]
    tot = sum(weights)
    # fronteiras de frase (bloco termina com pontuação)
    bounds = [k for k, c in enumerate(chunks[:-1]) if c[-1]["w"][-1] in ",.!?…"]
    starts = [0.0] * len(chunks)
    acc = np.cumsum([0] + weights)
    used, anchors = set(), {}
    for k in bounds:
        exp_t = d * acc[k + 1] / tot
        cand = [(abs((p0 + p1) / 2 - exp_t), j) for j, (p0, p1) in enumerate(pauses) if j not in used
                and (not anchors or p0 > max(v[1] for v in anchors.values()) - 1e-3)]
        if cand and min(cand)[0] < 0.6:
            j = min(cand)[1]; used.add(j); anchors[k] = pauses[j]
    # distribui blocos dentro de cada frase
    phrase_edges = [(-1, (0.0, 0.0))] + sorted(anchors.items()) + [(len(chunks) - 1, (d, d))]
    for (k0, (_, start_t)), (k1, (end_t, _)) in zip(phrase_edges[:-1], phrase_edges[1:]):
        ks = list(range(k0 + 1, k1 + 1))
        wsum = sum(weights[k] for k in ks)
        t = start_t
        for k in ks:
            starts[k] = t
            t += (end_t - start_t) * weights[k] / wsum
    seg = dict(id=item["id"], spk=item["spk"], s=round(cursor, 3), d=round(d, 3),
               chunks=[dict(t0=round(cursor + starts[k], 3), words=c) for k, c in enumerate(chunks)])
    # envelope para sincronia labial (Dudu)
    if item["spk"] == "D":
        e = frame_rms(x, SR // FPS)
        e = e / (np.percentile(e, 95) + 1e-9)
        seg["env"] = [round(float(min(1, v)), 3) for v in e]
    seg["_audio"] = x
    segs.append(seg)
    cursor += d + item["pause"]

TOTAL = round(cursor + 0.2, 3)
N = int(TOTAL * SR) + SR
S = {s["id"]: s for s in segs}


def T(i, k=None, off=0.0):
    s = S[i]
    return (s["s"] if k is None else s["chunks"][k]["t0"]) + off


def E(i):
    return S[i]["s"] + S[i]["d"]


voice = np.zeros(N)
for s in segs:
    a = int(s["s"] * SR)
    voice[a:a + len(s["_audio"])] += s["_audio"]

# ---------------------------------------------------------------- síntese
def tt(d):
    return np.arange(int(d * SR)) / SR


def env_ad(n, a=0.005, tau=0.1):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / tau)


def marimba(f, d=0.45, amp=1.0):
    t = tt(d)
    x = (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.28)
         + 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t / 0.05)
         + 0.08 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t / 0.02))
    return amp * x * np.minimum(1, t / 0.002)


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


def noise(d):
    return rng.standard_normal(int(d * SR))


def sfx_whoosh(d=0.42, up=True):
    n = noise(d); t = tt(d)
    bands = [(250, 700), (600, 1600), (1400, 3500), (3000, 7000)]
    out = np.zeros_like(n)
    for i, (lo, hi) in enumerate(bands):
        c = (i + 0.5) / len(bands)
        if not up: c = 1 - c
        w = np.exp(-((t / d - c) ** 2) / 0.05)
        out += bp(n, lo, hi) * w
    return out * np.sin(np.pi * t / d) ** 1.5 * 0.35


def sfx_pop():
    t = tt(0.09)
    f = 900 * np.exp(-t * 28) + 180
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / 0.03) * 0.8


def sfx_click():
    t = tt(0.04)
    return hp(noise(0.04), 2500) * np.exp(-t / 0.004) * 0.6 + np.sin(2 * np.pi * 1800 * t) * np.exp(-t / 0.01) * 0.3


def sfx_bell(f=1318, d=1.2, amp=0.5):
    t = tt(d); x = 0
    for r, a, tau in [(1, 1, 0.5), (2.0, 0.5, 0.25), (2.76, 0.4, 0.18), (5.4, 0.2, 0.08)]:
        x = x + a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / tau)
    return x * amp * np.minimum(1, t / 0.002)


def sfx_coin():
    a = sfx_bell(988, 0.15, 0.35); b = sfx_bell(1319, 0.8, 0.4)
    out = np.zeros(len(a) + len(b) - 2000); out[:len(a)] += a; out[len(a) - 2000:] += b
    return out


def sfx_shimmer():
    out = np.zeros(int(1.6 * SR))
    for i, m in enumerate([84, 88, 91, 96, 100, 103, 108]):
        x = sfx_bell(mtof(m), 1.0, 0.18); a = int(i * 0.055 * SR)
        out[a:a + len(x)] += x[: len(out) - a]
    return out


def sfx_bite():
    out = np.zeros(int(0.35 * SR))
    for k in range(5):
        a = int((k * 0.045 + rng.uniform(0, 0.01)) * SR)
        x = bp(noise(0.05), 1200, 6000) * env_ad(int(0.05 * SR), 0.001, 0.012)
        out[a:a + len(x)] += x * 0.9
    return out


def sfx_buzzer():
    t = tt(0.55)
    x = signal.sawtooth(2 * np.pi * 110 * t) + 0.6 * signal.sawtooth(2 * np.pi * 116 * t)
    return lp(x, 2200) * 0.25 * np.minimum(1, t / 0.01) * np.where(t < 0.45, 1, np.exp(-(t - 0.45) / 0.03))


def sfx_creak():
    t = tt(0.7)
    f = 320 + 140 * np.sin(2 * np.pi * 1.3 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    grit = (np.sin(2 * np.pi * 38 * t) > 0.2).astype(float)
    x = signal.sawtooth(ph) * grit
    return bp(x, 400, 3000) * np.sin(np.pi * t / 0.7) * 0.35


def sfx_boing():
    t = tt(0.7)
    f = 140 + 220 * np.exp(-t * 3) * (1 + 0.4 * np.sin(2 * np.pi * 14 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / 0.25) * 0.55


def sfx_fly(d=2.0):
    t = tt(d)
    f = 210 + 25 * np.sin(2 * np.pi * 3.1 * t) + 10 * np.sin(2 * np.pi * 7.7 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = signal.sawtooth(ph) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.9 * t))
    return bp(x, 300, 2500) * 0.06 * np.minimum(1, np.minimum(t, d - t) / 0.3)


def sfx_jingle(notes=(72, 76, 79, 84), step=0.08, amp=0.45):
    out = np.zeros(int((len(notes) * step + 0.6) * SR))
    for i, m in enumerate(notes):
        x = marimba(mtof(m), 0.5, amp); a = int(i * step * SR)
        out[a:a + len(x)] += x
    return out


def sfx_cricket(d=2.6):
    t = tt(d); out = np.zeros_like(t)
    car = np.sin(2 * np.pi * 4400 * t)
    for start in np.arange(0.05, d - 0.2, 0.62):
        for p in range(3):
            c = start + p * 0.035
            out += car * np.exp(-((t - c) ** 2) / (2 * 0.008 ** 2))
    return out * 0.12


def sfx_wind(d=2.6):
    t = tt(d)
    x = bp(noise(d), 250, 1100) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.6 * t - 1.5))
    return x * np.sin(np.pi * t / d) * 0.25


def sfx_typing(d=0.8):
    out = np.zeros(int(d * SR))
    for c in np.arange(0, d - 0.05, 0.09):
        a = int((c + rng.uniform(0, 0.02)) * SR); x = sfx_click() * 0.5
        out[a:a + len(x)] += x[: len(out) - a]
    return out


def sfx_notif():
    a = marimba(mtof(81), 0.12, 0.5); b = marimba(mtof(88), 0.5, 0.5)
    out = np.zeros(len(a) + len(b)); out[:len(a)] += a; out[int(0.09 * SR):int(0.09 * SR) + len(b)] += b
    return out


def sfx_power():
    t = tt(0.9)
    f = 80 + 500 * (t / 0.9) ** 2
    ph = 2 * np.pi * np.cumsum(f) / SR
    return lp(signal.sawtooth(ph), 3000) * 0.18 * np.minimum(1, t / 0.05) * np.where(t < 0.8, 1, np.exp(-(t - 0.8) / 0.03))


def sfx_flicker(d=1.0):
    t = tt(d)
    gate = (np.sin(2 * np.pi * 9 * t + 3 * np.sin(2 * np.pi * 2.3 * t)) > 0).astype(float)
    x = signal.sawtooth(2 * np.pi * 120 * t) * 0.6 + bp(noise(d), 2000, 6000) * 0.4
    return lp(x * gate, 4000) * 0.22


def sfx_explode():
    d = 1.0; t = tt(d)
    boom = np.sin(2 * np.pi * (70 * t + 40 * np.exp(-t * 20))) * np.exp(-t / 0.18)
    crack = hp(noise(d), 1500) * np.exp(-t / 0.05)
    glass = np.zeros_like(t)
    for _ in range(14):
        c = rng.uniform(0.02, 0.5); f = rng.uniform(3000, 7000)
        glass += np.sin(2 * np.pi * f * t) * np.exp(-np.maximum(0, t - c) / 0.04) * (t > c) * 0.18
    return boom * 0.9 + crack * 0.6 + glass


def sfx_party():
    out = np.zeros(int(1.0 * SR))
    for k in range(6):
        x = sfx_pop() * 0.5; a = int(rng.uniform(0, 0.35) * SR)
        out[a:a + len(x)] += x
    j = sfx_jingle((79, 84, 88, 91), 0.06, 0.35)
    out[: len(j)] += j[: len(out)]
    return out


def brass(f, d, wah=True, vib=0.0):
    t = tt(d)
    fm = f * (1 + vib * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.3))
    ph = 2 * np.pi * np.cumsum(fm) / SR
    bright = (0.25 + 0.55 * np.sin(np.pi * np.minimum(1, t / d))) if wah else 0.6 * np.ones_like(t)
    x = sum((1 / k) * bright ** (k - 1) * np.sin(k * ph) for k in range(1, 12))
    return x * np.minimum(1, t / 0.04) * np.minimum(1, (d - t) / 0.06)


def sfx_sadtrombone():
    seq = [(mtof(58), 0.42), (mtof(57), 0.42), (mtof(56), 0.42), (mtof(55), 1.3)]
    out = np.zeros(int(sum(d for _, d in seq) * SR) + SR); a = 0
    for i, (f, d) in enumerate(seq):
        x = brass(f, d, True, 0.02 if i == 3 else 0.0) * 0.18
        out[a:a + len(x)] += x; a += int(d * SR)
    return out


def sfx_stinger():
    d = 1.6; out = np.zeros(int(d * SR))
    for m in (60, 64, 67, 72):
        x = brass(mtof(m), 1.3, False, 0.008) * 0.06
        out[:len(x)] += x
    t = tt(d)
    out += hp(noise(d), 5000) * np.exp(-t / 0.5) * 0.12  # prato
    j = sfx_jingle((72, 76, 79, 84, 88), 0.05, 0.3); out[:len(j)] += j[: len(out)]
    return out


def sfx_impact():
    t = tt(1.2)
    return (np.sin(2 * np.pi * (50 * t + 30 * np.exp(-t * 15))) * np.exp(-t / 0.35) * 0.9
            + lp(noise(1.2), 900) * np.exp(-t / 0.12) * 0.4)


def sfx_snip():
    out = np.zeros(int(0.3 * SR))
    for c in (0.0, 0.12):
        x = hp(noise(0.05), 3000) * env_ad(int(0.05 * SR), 0.001, 0.01) * 0.8
        a = int(c * SR); out[a:a + len(x)] += x
    return out


def sfx_tick():
    t = tt(0.05)
    return np.sin(2 * np.pi * 2600 * t) * np.exp(-t / 0.006) * 0.25


def sfx_hit():
    d = 2.2; t = tt(d)
    f = 35 + 90 * np.exp(-t * 9)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .55)
    crack = hp(noise(d), 1200) * np.exp(-t / .03) * .8
    body = lp(noise(d), 400) * np.exp(-t / .12) * .6
    x = sub + crack + body
    ir = lp(noise(1.2) * np.exp(-tt(1.2) / .35), 3000) * .02
    wet = signal.fftconvolve(x, ir)[: len(x)]
    return np.tanh((x + wet) * 1.6) * .85


def sfx_glitch():
    d = .42; out = np.zeros(int(d * SR)); sl = int(.03 * SR)
    for i in range(int(d / .03)):
        a = i * sl; t = tt(.03); r = rng.random()
        if r < .45: x = np.sign(np.sin(2 * np.pi * rng.uniform(500, 3200) * t)) * .35
        elif r < .8: x = bp(noise(.03), 1500, 7000) * .5
        else: x = np.zeros_like(t)
        out[a:a + len(x)] += x[: len(out) - a] * (1 - i * sl / len(out))
    return lp(out, 9000)


def sfx_scratch():
    d = .5; t = tt(d)
    sp = np.sin(2 * np.pi * 2.3 * t)  # vai e volta do disco
    f = 250 + 1400 * np.abs(sp)
    tone = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * .4
    nz = bp(noise(d), 800, 5000) * np.abs(sp) * .8
    return lp(tone + nz, 6000) * np.minimum(1, t / .01) * np.minimum(1, (d - t) / .05) * .7


def sfx_stamp():
    t = tt(.35)
    return np.sin(2 * np.pi * (110 * t + 30 * np.exp(-t * 30))) * np.exp(-t / .1) * .9 + lp(noise(.35), 2500) * np.exp(-t / .02) * .6


def sfx_clang():
    t = tt(1.0); x = 0
    for r, a, tau in [(1, 1, .25), (2.32, .6, .18), (3.7, .4, .12), (5.1, .25, .08)]:
        x = x + a * np.sin(2 * np.pi * 310 * r * t) * np.exp(-t / tau)
    return (x * .35 + lp(noise(1.0), 3000) * np.exp(-t / .03) * .5) * np.minimum(1, t / .001)


def sfx_choir():
    d = 2.2; t = tt(d); x = 0
    for m in (72, 76, 79, 84):
        f = mtof(m) * (1 + .004 * np.sin(2 * np.pi * 5.2 * t))
        ph = 2 * np.pi * np.cumsum(f) / SR
        x = x + np.sin(ph) + .3 * np.sin(2 * ph) + .15 * np.sin(3 * ph)
    return lp(x, 3500) * np.minimum(1, t / .5) * np.minimum(1, (d - t) / .6) * .07


def sfx_zip():
    d = .35; t = tt(d)
    clicks = (np.sin(2 * np.pi * (40 * t + 120 * t * t)) > .95).astype(float)
    return hp(noise(d), 2500) * clicks * .5 + hp(noise(d), 4000) * np.exp(-t / .1) * .1


def sfx_crash():
    out = np.zeros(int(1.6 * SR))
    x = sfx_impact() * .9; out[:len(x)] += x[:len(out)]
    for k in range(7):
        y = sfx_clang() * rng.uniform(.15, .35) if k % 2 else bp(noise(.12), 600, 4000) * env_ad(int(.12 * SR), .001, .03) * .6
        a = int((.05 + k * .09 + rng.uniform(0, .04)) * SR); out[a:a + len(y)] += y[: len(out) - a]
    return out


def sfx_swish():
    return sfx_whoosh(.2, True) * .8


def sfx_clipper(d=1.0):
    t = tt(d)
    x = signal.sawtooth(2 * np.pi * 118 * t) * .5 + np.sin(2 * np.pi * 236 * t) * .3
    x = x * (1 + .25 * np.sin(2 * np.pi * 50 * t)) + hp(noise(d), 3000) * .12
    return bp(x, 150, 4000) * np.minimum(1, t / .05) * np.minimum(1, (d - t) / .08) * .35


SFX = {}
def put(name, t, gain=1.0):
    SFX.setdefault(name, [])
    SFX[name].append((t, gain))

GEN = dict(whoosh=sfx_whoosh, pop=sfx_pop, click=sfx_click, coin=sfx_coin, shimmer=sfx_shimmer,
           bite=sfx_bite, buzzer=sfx_buzzer, creak=sfx_creak, boing=sfx_boing, fly=lambda: sfx_fly(2.6),
           jingle=sfx_jingle, cricket=sfx_cricket, wind=sfx_wind, typing=sfx_typing, notif=sfx_notif,
           power=sfx_power, flicker=sfx_flicker, explode=sfx_explode, party=sfx_party,
           sadtrombone=sfx_sadtrombone, stinger=sfx_stinger, impact=sfx_impact, snip=sfx_snip,
           tick=sfx_tick, whooshd=lambda: sfx_whoosh(0.35, False),
           hit=sfx_hit, glitch=sfx_glitch, scratch=sfx_scratch, stamp=sfx_stamp,
           clang=sfx_clang, choir=sfx_choir, zip=sfx_zip, crash=sfx_crash, swish=sfx_swish,
           clipper=sfx_clipper, clipper_long=lambda: sfx_clipper(3.2))

# ---------------------------------------------------------------- eventos sonoros (EP. 3)
put("hit", 0.0, 1.0); put("glitch", 0.0, 0.6); put("stamp", T("votaram", 1, 0.0), 1.0)
put("whoosh", T("barbeiro", 0, -0.15), 0.7); put("coin", T("barbeiro", 1, 0.0), 0.6)
put("buzzer", T("barbeiro", 5, 0.1), 0.6); put("cricket", E("barbeiro") + 0.05, 0.6)
put("whoosh", T("eu", 0, -0.12), 0.6); put("snip", T("eu", 1, 0.0), 0.9)
put("coin", T("tesoura", 0, 0.0), 0.5); put("snip", T("tesoura", 2, 0.05), 0.8)
put("whoosh", T("tesoura", 4, -0.12), 0.6)
for k in range(10): put("tick", T("tesoura", 5) + k * 0.06, 0.5)
put("whoosh", T("topete", 0, -0.12), 0.7); put("snip", T("topete", 1, 0.1), 1.0); put("pop", T("topete", 1, 0.3), 0.6)
put("boing", T("voltou", 1, 0.0), 1.0)
put("whoosh", T("lados", 0, -0.12), 0.6)
for k in (1, 4):
    for j in range(2): put("snip", T("lados", k) + j * 0.16, 0.8)
for j in range(3): put("snip", T("igualar", 2) + j * 0.14, 0.8)
put("whoosh", T("cogumelo", 0, -0.15), 0.8)
for k in (1, 2, 3): put("notif", T("cogumelo", k, 0.0), 0.6)
put("boing", T("cogumelo", 4, 0.0), 0.8)
put("scratch", T("mae", 0, -0.1), 0.9); put("whoosh", T("mae", 0, -0.05), 0.7)
put("whoosh", T("maquina", 0, -0.12), 0.6); put("clipper", T("maquina", 2, 0.0), 1.0)
put("clipper_long", T("consertou", 0, 0.0), 1.0)
t_ = T("consertou", 0)
while t_ < E("consertou"): put("swish", t_, 0.25); t_ += 0.35
put("whoosh", T("rosto", 0, -0.12), 0.6)
for k in range(4): put("swish", T("rosto", 1) + k * 0.2, 0.5)
put("shimmer", T("rosto", 2, 0.1), 0.5)
put("whoosh", T("apresentavel", 0, -0.15), 0.7); put("choir", T("apresentavel", 0, 0.0), 1.0); put("shimmer", T("apresentavel", 2, 0.0), 0.7)
put("coin", T("duzentos", 0, 0.0), 0.7); put("party", T("duzentos", 0, 0.1), 0.8)
put("whoosh", T("desconhecido", 0, -0.15), 0.8); put("notif", T("desconhecido", 2, 0.0), 0.8)
put("whoosh", T("engracado", 0, -0.15), 0.6)
put("cricket", T("naoe", 0, 0.0), 1.0)
put("whoosh", T("topete2", 0, -0.12), 0.6); put("boing", T("topete2", 2, 0.0), 1.0); put("pop", T("topete2", 2, 0.05), 0.6)
put("whoosh", T("opcoes", 0, -0.2), 0.8); put("impact", T("opcoes", 0, 0.0), 0.8)
put("pop", T("opcoes", 2, 0.0), 0.8); put("pop", T("opcoes", 4, 0.0), 0.8)
put("notif", T("comenta", 1, 0.0), 0.7)
put("whoosh", T("ep4", 3, -0.1), 0.7); put("jingle", T("ep4", 3, 0.15), 0.8)

sfx = np.zeros(N)
for name, evs in SFX.items():
    for t0, g in evs:
        x = GEN[name]() * g
        a = int(max(0, t0) * SR)
        sfx[a:a + len(x)] += x[: max(0, N - a)]

# ---------------------------------------------------------------- trilha (trap escuro, Lá menor)
BPM = 140; BEAT = 60 / BPM; BAR = 4 * BEAT
PROG = [(33, [57, 60, 64]), (29, [53, 57, 60]), (36, [55, 60, 64]), (28, [56, 59, 64])]  # Am F C E
music = np.zeros(N)

def add(x, t0, gain=1.0, buf=None):
    buf = music if buf is None else buf
    a = int(t0 * SR)
    if a >= N or a < 0: return
    buf[a:a + len(x)] += x[: N - a] * gain

def k808(m, d):
    t = tt(d); f = mtof(m) * (1 + .6 * np.exp(-t * 40))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / .004) * np.exp(-t / .7)
    return np.tanh(x * 1.8) * .7

def kick2():
    t = tt(.3); f = 48 + 120 * np.exp(-t * 35)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .09) + hp(noise(.3), 3000) * np.exp(-t / .004) * .3

def snare():
    t = tt(.3)
    return bp(noise(.3), 1200, 6000) * np.exp(-t / .07) * .8 + np.sin(2 * np.pi * 190 * t) * np.exp(-t / .05) * .4

def hat2(open_=False):
    d = .25 if open_ else .05
    return hp(noise(d), 8000) * env_ad(int(d * SR), .001, .06 if open_ else .012)

def bell(m, d=.6):
    t = tt(d); f = mtof(m)
    x = np.sin(2 * np.pi * f * t + .8 * np.sin(2 * np.pi * f * 3.5 * t) * np.exp(-t / .15)) * np.exp(-t / .35) * np.minimum(1, t / .003)
    return lp(x, 4000)

def dpad(ms, d, cut=700):
    t = tt(d)
    x = sum(signal.sawtooth(2 * np.pi * mtof(m) * t * (1 + dt)) for m in ms for dt in (-.003, .003))
    return lp(x, cut, 2) * np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / .8) * .05

ARP = [0, 1, 2, 1, 2, 0, 1, 2]
def groove2(t0, t1, bright=False):
    buf = np.zeros(N); bar = 0; t = t0
    while t < t1 - .05:
        root, ch = PROG[bar % 4]
        add(dpad(ch, BAR + .4), t, .9, buf)
        add(k808(root, BAR * .55), t, .55, buf); add(k808(root, BEAT * 1.4), t + 2.5 * BEAT, .45, buf)
        add(kick2(), t, .55, buf); add(kick2(), t + 2.5 * BEAT, .4, buf)
        add(snare(), t + 2 * BEAT, .35, buf)
        for i in range(8):
            add(hat2(), t + i * BEAT / 2, (.16 if i % 2 == 0 else .1) * (1.3 if bright else 1), buf)
        if bar % 2 == 1:  # rolinho de hi-hat
            for i in range(6): add(hat2(), t + 3 * BEAT + i * BEAT / 6, .08 + .02 * i, buf)
        else:
            add(hat2(True), t + 3.5 * BEAT, .1, buf)
        for i, k in enumerate(ARP):
            m = ch[k] + 12; tb = t + i * BEAT / 2
            for dl, g in ((0, .13), (.75 * BEAT, .05), (1.5 * BEAT, .02)): add(bell(m), tb + dl, g, buf)
        t += BAR; bar += 1
    e = int(t1 * SR); buf[e:] = 0
    fl = int(.03 * SR); buf[e - fl:e] *= np.linspace(1, 0, fl)
    return buf

def tape_stop(buf, t_end, d=.7):
    e = int(t_end * SR); n = int(d * SR); a = e - n
    seg = buf[a:a + int(n * 1.0)].copy()
    tt_ = np.arange(n) / SR
    pos = (tt_ - tt_ ** 2 / (2 * d)) * SR  # velocidade cai de 1 para 0
    out = np.interp(pos, np.arange(len(seg)), seg) * np.linspace(1, .3, n)
    buf[a:e] = out; buf[e:] = 0
    return buf

# A: da abertura até a mãe entrar (para com efeito de fita)
music += tape_stop(groove2(0.0, T("mae", 0, 0.05) + .7), T("mae", 0, 0.05))
# B: a mãe conserta tudo, revelação; corta seco no "Ele não é"
music += groove2(T("maquina", 0, -0.1), T("naoe", 0, 0.0), bright=True)
# C: o topete volta -> batida até o fim
music += groove2(T("topete2", 2, 0.0), TOTAL - .25, bright=True)

# ducking (a música abaixa quando tem voz)
venv = np.abs(voice)
venv = signal.sosfilt(signal.butter(1, 4, fs=SR, output="sos"), venv)
duck = 1 - 0.62 * np.clip(venv / 0.03, 0, 1)
music *= 0.20 * duck
fade = np.ones(N); fl = int(0.8 * SR); end = int(TOTAL * SR)
fade[end - fl:end] = np.linspace(1, 0, fl); fade[end:] = 0
music *= fade

# ---------------------------------------------------------------- mix
mix_mono = voice * 1.0 + sfx * 0.55
L = mix_mono + music
R = mix_mono + np.roll(music, int(0.012 * SR))
st = np.stack([L, R], 1)[: end]
peak = np.abs(st).max()
st = st / peak * 0.95
sf.write(os.path.join(D, "audio", "master.wav"), st, SR, subtype="PCM_16")
for nm, arr in (("voice", voice), ("sfx", sfx * 0.55), ("music", music)):
    sf.write(os.path.join(D, "audio", f"stem_{nm}.wav"), (arr[:end] / peak * 0.95).astype(np.float32), SR)
nm_ = voice[:end] + sfx[:end] * 0.55; nm_ = nm_ / np.abs(nm_).max() * 0.95
sf.write(os.path.join(D, "audio", "master_sem_musica.wav"), np.stack([nm_, nm_], 1), SR, subtype="PCM_16")

# ---------------------------------------------------------------- timeline para a animação
out = [{k: v for k, v in s.items() if not k.startswith("_")} for s in segs]
with open(os.path.join(D, "timeline.js"), "w") as f:
    f.write("window.TL=" + json.dumps(dict(total=TOTAL, fps=FPS, segs=out), ensure_ascii=False) + ";\n")
for s in segs:
    print(f'{s["id"]:9s} {s["s"]:6.2f} +{s["d"]:4.2f}  ' + " | ".join(f'{c["t0"]:.2f}' for c in s["chunks"]))
print("TOTAL", TOTAL, "peak", round(float(peak), 3))
