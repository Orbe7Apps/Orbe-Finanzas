const path = require('path'), fs = require('fs');
const APP = 'file://' + path.resolve(__dirname, '../index.html');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [];
  const d0 = require('./datos.js')();
  const ok = (n, c, x) => console.log((c ? '✓ ' : '✗ FALLA ') + n + (x ? ' — ' + x : ''));
  const shots = [];
  for (const cf of [{ n: 'eur', st: { disp: 'EUR', theme: 'dark', accent: 'azul', trendMode: 'none' } }, { n: 'usd', st: { trendMode: 'none' } }, { n: 'ves-mes', st: { disp: 'VES', trendMode: 'mes' } }]) {
    const d = Object.assign(JSON.parse(JSON.stringify(d0)), cf.st);
    const ctx = await b.newContext({ ...devices['iPhone 15'], deviceScaleFactor: 2, colorScheme: cf.st.theme || 'light' }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.route(/dolarapi|pydolar|supabase|er-api|tasa.json|coingecko/, r => r.abort());
    await p.addInitScript(x => { if (!localStorage.getItem('gastos-v1')) localStorage.setItem('gastos-v1', JSON.stringify(x)); localStorage.setItem('orbe-act', String(Date.now())); }, d);
    await p.goto(APP); await p.waitForTimeout(4200); await p.addStyleTag({ content: '#inst{display:none!important}' });
    const m = await p.evaluate(() => { const b = document.getElementById('balance'), u = b.querySelector('small.usd'); if (!u) return null; const rb = b.getBoundingClientRect(), ru = u.getBoundingClientRect(); return { below: ru.top > rb.top + 20, txt: u.textContent, fits: rb.right <= innerWidth }; });
    if (cf.n !== 'usd') ok(cf.n + ': el ≈ va debajo del total', m && m.below && m.fits, JSON.stringify(m));
    await p.screenshot({ path: OUT + '/hr-' + cf.n + '.png', clip: { x: 0, y: 0, width: 393, height: 560 } }); shots.push(cf.n);
    await ctx.close();
  }
  require('fs').writeFileSync(OUT + '/hr.json', JSON.stringify(shots)); console.log('errores', errs); await b.close(); })();
