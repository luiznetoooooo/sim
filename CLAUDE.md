# Instruções para o Claude: série "Dudu quer ser streamer"

Este branch (`serie-dudu-streamer`) guarda uma série de vídeos curtos animados feita inteiramente pelo Claude.
**Converse com o dono do canal em português do Brasil.** Leia `SERIE.md` antes de qualquer coisa:
lá estão o personagem, as regras de estilo aprovadas e o diário de episódios (o que já aconteceu e o estado atual).

## Como o pipeline funciona
- `episodios/epXX/build_audio.py`: contém o **roteiro** (lista `SCRIPT`). Monta voz, efeitos e trilha, alinha
  a legenda de cada trecho, calcula a sincronia labial do Dudu e gera `timeline.js` e `audio/master*.wav`.
  - Vozes externas (ElevenLabs) ficam em `ext/narrador.mp3`, `ext/dudu.mp3` e `ext/mae.mp3`, com cortes em `ext/*_align.json`.
    Se um arquivo não existir, aquela voz cai no Kokoro local (sintético, pior).
  - Na legenda, `|` separa os blocos, `*palavra*` deixa amarelo e `_palavra_` deixa azul. `say=` é a grafia fonética para a voz sintética.
- `episodios/epXX/scene.js`: toda a animação em SVG procedural (1080×1920, 30 fps). Partes reutilizáveis:
  `duduParts()` (personagem e poses), `worldScene()`/`worldFront()` (quarto), `screenContent()` (monitor),
  `streamUI()` (tela da live com chat), `choiceScene()` (votação), `hud()`, `caption()`, `hlCircle()`, `arrow()`,
  `qmarks()`, `flies()`, `stink()`. As poses por momento ficam em `dudPose()` e a câmera em `buildKF()`.
  Os eventos usam `T('id_da_fala', bloco)`, então tudo se ajusta sozinho quando a voz muda de duração.
- `episodios/epXX/index.html` + `render.js` (Playwright) renderizam quadros PNG. `preview.js t1 t2 ...` gera quadros soltos para conferir.
- `ferramentas/alinhar_voz.py AUDIO FALAS.txt SAIDA.json [voz]`: corta um áudio único com várias falas
  (pausas + conferência acústica por DTW). Vozes de referência: pm_alex (narrador), pm_santa (Dudu), pf_dora (mãe).
- `./setup.sh`: instala dependências e baixa os modelos Kokoro (cerca de 350 MB, do GitHub). Rode uma vez por sessão.
- `./render_ep.sh episodios/epXX`: gera tudo e grava `final/dudu_epXX_FINAL.mp4` e `..._sem_musica.mp4`
  (cerca de 10 min: 4 processos de render mais a codificação).

## Fluxo para um novo episódio
1. Pergunte qual opção venceu a votação (se o dono não disser). Leia o diário em `SERIE.md`.
2. Escreva o roteiro (60–70 s) seguindo a estrutura e o tom de `SERIE.md`. Mostre ao dono e ajuste.
3. Entregue os textos para o ElevenLabs em **blocos únicos por personagem**. O dono tem crédito limitado
   e **não consegue mandar um arquivo por fala**. Ponha uma linha em branco entre as falas.
4. Quando os áudios chegarem, **confira pelo conteúdo qual é qual** (duração, número de frases, tom).
   No EP. 1 o dono mandou os arquivos do Dudu e da mãe trocados.
5. `cp -r episodios/ep01 episodios/epNN` (sem `final/`, `ext/*.mp3` e `ext/*.json`). Edite `SCRIPT` e os eventos sonoros
   (`put(...)`) em `build_audio.py`. Em `scene.js`, edite cenas, poses (`dudPose`), câmera (`buildKF`), `MODES()`,
   os destaques e `choiceScene()` (novas opções e "EP. N+1").
6. Rode `preview.js` em 30–40 momentos, monte uma planilha de quadros com ffmpeg e **olhe** antes de renderizar tudo.
   Problemas já encontrados: legenda cobrindo conteúdo, desfoque forte demais, objetos tapando a tela do monitor.
7. `./render_ep.sh episodios/epNN`, confira a planilha final e o volume (-14 LUFS) e entregue as duas versões.
8. Atualize o diário em `SERIE.md` (resumo, votação e estado de continuidade), escreva `roteiro.md` com descrição e
   hashtags, faça commit e push neste branch.

## Ambiente (Claude Code na nuvem)
- Bloqueados: Google TTS, HuggingFace, ElevenLabs API, bancos de sons. Liberados: GitHub, PyPI, npm, Google Fonts.
- Chromium e Playwright já vêm instalados (`require('playwright')`). Não reinstale.
- Música e efeitos são sintetizados em numpy/scipy (não há biblioteca de sons disponível).
- Não dá para ouvir o áudio. Confira os níveis por medição (stems em `audio/stem_*.wav`) e o tempo das falas pelo alinhamento.
