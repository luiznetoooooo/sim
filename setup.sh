#!/usr/bin/env bash
# Prepara o ambiente para gerar episódios (roda uma vez por sessão nova do Claude Code).
set -e
cd "$(dirname "$0")"
pip install -q kokoro-onnx soundfile scipy librosa 2>&1 | grep -v WARNING || true
mkdir -p models
R=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
[ -s models/kokoro-v1.0.onnx ] || curl -sSL -o models/kokoro-v1.0.onnx $R/kokoro-v1.0.onnx
[ -s models/voices-v1.0.bin ]  || curl -sSL -o models/voices-v1.0.bin  $R/voices-v1.0.bin
node -e "require('playwright')" && echo "playwright ok"
which ffmpeg >/dev/null && echo "ffmpeg ok"
python3 -c "import kokoro_onnx, librosa, scipy; print('python ok')"
echo "Pronto."
