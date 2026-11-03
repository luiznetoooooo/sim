# Futebol Arcade

Protótipo de jogo de futebol arcade para celular, com controles por toque. Tudo fica em um único arquivo (`index.html`), sem dependências.

## Como jogar
- **Joystick**: arraste em qualquer lugar da tela para mover o jogador destacado com o anel amarelo (você, time azul).
- **Chute**: segure o botão CHUTE no canto inferior direito e solte. Quanto mais tempo segurar, mais forte o chute.
- O objetivo é marcar no gol vermelho/da CPU, no topo da tela. A CPU ataca o gol de baixo.
- Cada tempo dura 60 segundos. Ao final, toque na tela para jogar de novo.

## Como abrir no celular
1. Coloque a pasta no computador ou em qualquer hospedagem estática (GitHub Pages, Netlify, etc.).
2. Ou, na mesma rede Wi-Fi do celular, rode na pasta: `python3 -m http.server 8000`, e abra `http://IP_DO_COMPUTADOR:8000/futebol-arcade/` no navegador do celular.
3. Para instalar como app, use "Adicionar à tela inicial" no navegador.

## Ajustes fáceis
As constantes no topo do script controlam o jogo: `SPEED` (velocidade do jogador), `AI_SPEED` (velocidade da CPU), `HALF` (duração do tempo) e a força do chute em `input.power`.

## Próximos passos possíveis
- Empacotar como app nativo (Capacitor) para Google Play e App Store.
- Mais modos (copa, torneio), times com nomes e uniformes próprios, sons e placares de jogadores.
- Passes e desarmes, em vez de só chute.
