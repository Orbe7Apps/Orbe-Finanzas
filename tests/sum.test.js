const path = require('path'), fs = require('fs');
const APP = 'file://' + path.resolve(__dirname, '../index.html');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [];
  const d0 = require('./datos.js')();
  const ok = (n, c, x) => console.log((c ? '✓ ' : '✗ FALLA ') + n + (x ? ' — ' + x : ''));
  const shots = [];
  for (const cf of [{ n: 'L', st: { trendMode: 'none' } }, { n: 'D', st: { trendMode: 'none', theme: 'dark', accent: 'azul', disp: 'EUR' } }, { n: 'M', st: { trendMode: 'none', mono: true } }]) {
    const d = Object.assign(JSON.parse(JSON.stringify(d0)), cf.st);
    const ctx = await b.newContext({ ...devices['iPhone 15'], deviceScaleFactor: 2, colorScheme: cf.st.theme || 'light' }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.route(/dolarapi|pydolar|supabase|er-api|tasa.json|coingecko/, r => r.abort());
    await p.addInitScript(x => { if (!localStorage.getItem('gastos-v1')) localStorage.setItem('gastos-v1', JSON.stringify(x)); localStorage.setItem('orbe-act', String(Date.now())); }, d);
    await p.goto(APP); await p.waitForTimeout(4200); await p.addStyleTag({ content: '#inst{display:none!important}' });
    const fh = () => p.evaluate(() => Math.round(document.getElementById('flows').getBoundingClientRect().height));
    if (cf.n === 'L') ok('al entrar: resumen oculto, píldora con flecha', (await fh()) < 2 && await p.evaluate(() => document.getElementById('bal-delta').getAttribute('aria-expanded') === 'false' && !!document.querySelector('#bal-delta .bd-chev')), 'alto ' + await fh());
    await p.screenshot({ path: OUT + '/sm-' + cf.n + '-0.png', clip: { x: 0, y: 0, width: 393, height: 470 } }); shots.push(cf.n + '-0');
    await p.click('#bal-delta'); await p.waitForTimeout(700);
    if (cf.n === 'L') ok('tocar la píldora despliega ingresos, gastos y ahorrado', (await fh()) > 40 && await p.evaluate(() => document.getElementById('bal-delta').getAttribute('aria-expanded') === 'true'), 'alto ' + await fh());
    await p.screenshot({ path: OUT + '/sm-' + cf.n + '-1.png', clip: { x: 0, y: 0, width: 393, height: 470 } }); shots.push(cf.n + '-1');
    if (cf.n === 'L') {
      await p.reload(); await p.waitForTimeout(4200);
      ok('se recuerda abierto tras recargar', (await fh()) > 40);
      await p.click('#bal-delta'); await p.waitForTimeout(700);
      ok('tocar otra vez lo pliega', (await fh()) < 2);
      await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('gastos-v1')); s.trendMode = 'mes'; localStorage.setItem('gastos-v1', JSON.stringify(s)); }); await p.reload(); await p.waitForTimeout(4200);
      ok('con gráfico la píldora va debajo del gráfico', await p.evaluate(() => { const d = document.getElementById('bal-delta'); return !d.hidden && d.nextElementSibling === document.getElementById('flows'); }));
    }
    await ctx.close();
  }
  require('fs').writeFileSync(OUT + '/sm.json', JSON.stringify(shots)); console.log('errores', errs); await b.close(); })();
