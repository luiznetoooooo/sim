// renderiza um intervalo de quadros em PNG (sem perdas)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const [a, b] = process.argv.slice(2).map(Number);
(async () => {
  const dir = __dirname; fs.mkdirSync(path.join(dir, 'frames'), { recursive: true });
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.join(dir, 'index.html'));
  await p.evaluate(() => Promise.all([document.fonts.load('100px Anton'), document.fonts.load('800 40px Nunito'), document.fonts.load('40px Luckiest')]));
  for (let i = a; i < b; i++) {
    await p.evaluate(tt => window.render(tt), i / 30);
    await p.screenshot({ path: path.join(dir, 'frames', `f${String(i).padStart(5, '0')}.png`) });
  }
  if (errs.length) console.log('ERR', errs.slice(0, 3));
  console.log('done', a, b); await br.close();
})();
