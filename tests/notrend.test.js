const path = require('path'), fs = require('fs');
const APP = 'file://' + path.resolve(__dirname, '../index.html');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [];
  const d0 = require('./datos.js')();
  const ok = (n, c, x) => console.log((c ? '✓ ' : '✗ FALLA ') + n + (x ? ' — ' + x : ''));
  const shots = [];
  for (const cf of [{ n: 'L', st: {} }, { n: 'D', st: { theme: 'dark', accent: 'azul' } }, { n: 'M', st: { mono: true } }]) {
    const d = Object.assign(JSON.parse(JSON.stringify(d0)), cf.st);
    const ctx = await b.newContext({ ...devices['iPhone 15'], deviceScaleFactor: 2, colorScheme: cf.st.theme || 'light' }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.route(/dolarapi|pydolar|supabase|er-api|tasa.json|coingecko/, r => r.abort());
    await p.addInitScript(x => { if (!localStorage.getItem('gastos-v1')) { localStorage.setItem('gastos-v1', JSON.stringify(x)); } localStorage.setItem('orbe-act', String(Date.now())); }, d);
    await p.goto(APP); await p.waitForTimeout(4200); await p.addStyleTag({ content: '#inst{display:none!important}' });
    if (cf.n === 'L') ok('al empezar está «Sin gráfico» (por defecto)', await p.evaluate(() => document.getElementById('trend').hidden));
    await p.evaluate(() => document.getElementById('set-open').click()); await p.waitForTimeout(900);
    await p.evaluate(() => document.getElementById('trend-row').scrollIntoView({ block: 'center' })); await p.waitForTimeout(300);
    if (cf.n === 'L') { await p.screenshot({ path: OUT + '/nt-ajustes.png' }); shots.push('ajustes');
      ok('Ajustes tiene las tres opciones en una fila', await p.evaluate(() => { const bs = [...document.querySelectorAll('[data-trend-set]')]; const r = bs.map(x => x.getBoundingClientRect()); return bs.length === 3 && new Set(r.map(q => Math.round(q.top))).size === 1 && bs.every(x => x.scrollWidth <= x.clientWidth + 1); })); }
    await p.evaluate(() => document.querySelector('[data-trend-set="none"]').click()); await p.waitForTimeout(300);
    await p.evaluate(() => { const c = document.querySelector('.view-back, [data-back], #set-back'); if (c) c.click(); }); await p.waitForTimeout(900);
    await p.evaluate(() => { document.querySelectorAll('body').forEach(() => {}); document.querySelector('.tab[data-tab="0"]').click(); scrollTo({ top: 0, behavior: 'instant' }); }); await p.waitForTimeout(900);
    const st = await p.evaluate(() => { const t = document.getElementById('trend'), dl = document.getElementById('bal-delta'), a = document.getElementById('balance').getBoundingClientRect(); return { hid: t.hidden && t.offsetHeight === 0, delta: dl.hidden ? '' : dl.textContent, cls: dl.className, center: Math.abs((a.left + a.right) / 2 - innerWidth / 2) < 6, saved: JSON.parse(localStorage.getItem('gastos-v1')).trendMode }; });
    ok(cf.n + ': sin gráfico, total centrado y el cambio del mes', st.hid && st.center && /este mes/.test(st.delta) && st.saved === 'none', JSON.stringify(st));
    await p.screenshot({ path: OUT + '/nt-' + cf.n + '.png' }); shots.push(cf.n);
    if (cf.n === 'L') {
      await p.reload(); await p.waitForTimeout(4200);
      console.log('  tras recargar', await p.evaluate(() => JSON.stringify({ m: JSON.parse(localStorage.getItem('gastos-v1')).trendMode, hid: document.getElementById('trend').hidden, dl: document.getElementById('bal-delta').hidden, lock: !document.getElementById('lock').hidden })));
      ok('tras recargar sigue sin gráfico', await p.evaluate(() => document.getElementById('trend').hidden && !document.getElementById('bal-delta').hidden));
      await p.evaluate(() => document.getElementById('set-open').click()); await p.waitForTimeout(800);
      await p.evaluate(() => document.querySelector('[data-trend-set="30d"]').click()); await p.waitForTimeout(400);
      ok('volver a «30 días» lo muestra otra vez', await p.evaluate(() => !document.getElementById('trend').hidden && !document.querySelector('.bal-hero').classList.contains('no-trend')));
    }
    await ctx.close();
  }
  require('fs').writeFileSync(OUT + '/nt.json', JSON.stringify(shots)); console.log('errores', errs); await b.close(); })();
