const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const times = process.argv.slice(2).map(Number);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.join(__dirname, 'index.html'));
  await p.evaluate(() => Promise.all([document.fonts.load('100px Anton'), document.fonts.load('800 40px Nunito'), document.fonts.load('40px Luckiest')]));
  for (const t of times) { await p.evaluate(tt => window.render(tt), t); await p.screenshot({ path: path.join(__dirname, 'prev', `p_${t.toFixed(2)}.png`) }); }
  console.log('errors:', JSON.stringify(errs.slice(0, 5))); await b.close();
})();
