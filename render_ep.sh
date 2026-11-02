#!/usr/bin/env bash
# Gera o episódio completo: áudio -> quadros (4 processos) -> MP4 com música e sem música.
# Uso: ./render_ep.sh episodios/ep02
set -e
EP="${1:?uso: ./render_ep.sh episodios/epXX}"
cd "$EP"
NAME=$(basename "$PWD")
python3 build_audio.py 2>&1 | grep -v -i warn
N=$(python3 -c "import json,math;s=open('timeline.js').read();print(math.ceil(json.loads(s[s.index('=')+1:].rstrip().rstrip(';'))['total']*30))")
echo "quadros: $N"
rm -rf frames; Q=$(( (N+3)/4 ))
for w in 0 1 2 3; do a=$((w*Q)); b=$(( (w+1)*Q )); [ $b -gt $N ] && b=$N; node render.js $a $b & done; wait
mkdir -p final
ffmpeg -v error -y -framerate 30 -i frames/f%05d.png -c:v libx264 -preset slow -tune animation -crf 16 -profile:v high -pix_fmt yuv420p frames/_video.mp4
for v in "master.wav:dudu_${NAME}_FINAL.mp4" "master_sem_musica.wav:dudu_${NAME}_FINAL_sem_musica.mp4"; do
  a=${v%%:*}; o=${v##*:}
  ffmpeg -v error -y -i frames/_video.mp4 -i audio/$a -c:v copy -af "loudnorm=I=-14:TP=-1.0:LRA=9" -ar 48000 -c:a aac -b:a 256k -movflags +faststart -shortest final/$o
  echo "final/$o"
done
