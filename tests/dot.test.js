const path = require('path'), fs = require('fs');
const APP = 'file://' + path.resolve(__dirname, '../index.html');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [];
  const d0 = require('./datos.js')();
  const ok = (n, c, x) => console.log((c ? '✓ ' : '✗ FALLA ') + n + (x ? ' — ' + x : ''));
  const shots = [];
  for (const cf of [{ n: 'L', st: {} }, { n: 'D', st: { theme: 'dark', accent: 'azul' } }, { n: 'M', st: { mono: true } }]) {
    const d = Object.assign(JSON.parse(JSON.stringify(d0)), cf.st, { accounts: d0.accounts.concat([{ id: 91, nombre: 'Venezuela', moneda: 'VES', saldo: 46000, creado: '2026-09-01', color: '#e8436a' }, { id: 92, nombre: 'Efectivo', moneda: 'USD', saldo: 120, creado: '2026-09-01', color: '#e0a100' }]) });
    const ctx = await b.newContext({ ...devices['iPhone 15'], deviceScaleFactor: 2, colorScheme: cf.st.theme || 'light' }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.route(/dolarapi|pydolar|supabase|er-api|tasa.json|coingecko/, r => r.abort());
    await p.addInitScript(x => { if (!localStorage.getItem('gastos-v1')) localStorage.setItem('gastos-v1', JSON.stringify(x)); localStorage.setItem('orbe-act', String(Date.now())); }, d);
    await p.goto(APP); await p.waitForTimeout(4200); await p.addStyleTag({ content: '#inst{display:none!important}' });
    await p.evaluate(() => { document.getElementById('acc-sum').scrollIntoView({ block: 'center', behavior: 'instant' }); }); await p.waitForTimeout(900);
    const clip = await p.evaluate(() => { const r = document.getElementById('acc-sum').getBoundingClientRect(), l = document.getElementById('acc-list').getBoundingClientRect(); return { x: 0, y: r.top - 8, width: innerWidth, height: l.bottom - r.top + 16 }; });
    const txtOp = () => p.evaluate(() => getComputedStyle(document.querySelector('#acc-sum .ao-txt')).opacity);
    if (cf.n === 'L') ok('al entrar: un punto, sin el monto', await p.evaluate(() => document.querySelector('#acc-sum .ao-mid').classList.contains('dot')) && +(await txtOp()) < 0.05, 'opacidad ' + await txtOp());
    await p.screenshot({ path: OUT + '/dt-' + cf.n + '-0.png', clip }); shots.push(cf.n + '-0');
    await p.evaluate(() => document.querySelectorAll('[data-acc-pick]')[1].click()); await p.waitForTimeout(1200);
    if (cf.n === 'L') ok('al tocar una cuenta: crece y muestra su monto', await p.evaluate(() => !document.querySelector('#acc-sum .ao-mid').classList.contains('dot')) && +(await txtOp()) > 0.95 && /Venezuela/.test(await p.evaluate(() => document.querySelector('#acc-sum .ao-k').textContent)), await p.evaluate(() => document.querySelector('#acc-sum .ao-txt').innerText.replace(/\n/g, ' ')));
    await p.screenshot({ path: OUT + '/dt-' + cf.n + '-1.png', clip }); shots.push(cf.n + '-1');
    if (cf.n === 'L') {
      await p.evaluate(() => document.querySelectorAll('[data-acc-pick]')[2].click()); await p.waitForTimeout(900);
      ok('cambiar de cuenta: sigue grande con el monto nuevo', /Efectivo/.test(await p.evaluate(() => document.querySelector('#acc-sum .ao-k').textContent)) && +(await txtOp()) > 0.95);
      const r = await p.evaluate(() => { const q = document.getElementById('acc-sum').getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2]; });
      await p.mouse.click(r[0] + 150, r[1] - 120); await p.waitForTimeout(1000);
      ok('tocar fuera: vuelve a ser un punto', await p.evaluate(() => document.querySelector('#acc-sum .ao-mid').classList.contains('dot')) && +(await txtOp()) < 0.05);
      await p.screenshot({ path: OUT + '/dt-L-2.png', clip }); shots.push('L-2');
      ok('el orbe de Metas también es un punto (mismo comportamiento que Inicio)', await p.evaluate(() => { document.querySelector('.tab[data-tab="1"]').click(); return true; }) && await p.waitForTimeout(900).then(() => p.evaluate(() => !document.querySelector('#go-sum .ao-mid') || document.querySelector('#go-sum .ao-mid').classList.contains('dot'))));
    }
    await ctx.close();
  }
  require('fs').writeFileSync(OUT + '/dt.json', JSON.stringify(shots)); console.log('errores', errs); await b.close(); })();
