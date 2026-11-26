const path = require('path'), fs = require('fs');
const APP = 'file://' + path.resolve(__dirname, '../index.html');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [];
  const ok = (n, c, x) => console.log((c ? '✓ ' : '✗ FALLA ') + n + (x ? ' — ' + x : ''));
  const ctx = await b.newContext({ ...devices['iPhone 15'], deviceScaleFactor: 2 }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.route(/dolarapi|pydolar|supabase|er-api|tasa.json|coingecko/, r => r.abort());
  await p.goto(APP); await p.waitForTimeout(3200);
  await p.evaluate(() => { const v = [...document.querySelectorAll('#ctry-list button')].find(x => /Venezuela/.test(x.textContent)); v.click(); }); await p.waitForTimeout(300);
  await p.evaluate(() => document.getElementById('ctry-go').click()); await p.waitForTimeout(1200);
  let k = -1;
  for (let i = 0; i < 9; i++) { if (await p.evaluate(() => !!document.querySelector('.onb-slide[aria-hidden="false"] .oa-tm'))) { k = i; break; } await p.evaluate(() => document.getElementById('onb-next').click()); await p.waitForTimeout(700); }
  ok('la introducción tiene la página para elegir el Inicio', k >= 0, 'página ' + (k + 1));
  ok('viene marcada «Solo el total» por defecto', await p.evaluate(() => document.querySelector('[data-onb-trend="none"]').getAttribute('aria-checked') === 'true'));
  await p.screenshot({ path: OUT + '/ot-1.png' });
  await p.evaluate(() => document.querySelector('[data-onb-trend="mes"]').click()); await p.waitForTimeout(500);
  ok('tocar «Este mes» la marca y la guarda', await p.evaluate(() => document.querySelector('[data-onb-trend="mes"]').getAttribute('aria-checked') === 'true' && document.querySelector('[data-onb-trend="none"]').getAttribute('aria-checked') === 'false'));
  await p.screenshot({ path: OUT + '/ot-2.png' });
  ok('sin desborde', await p.evaluate(() => { const r = document.querySelector('.oa-tm').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }));
  for (let i = 0; i < 6; i++) { if (await p.evaluate(() => document.getElementById('onb').hidden)) break; await p.evaluate(() => document.getElementById('onb-next').click()); await p.waitForTimeout(600); }
  await p.evaluate(() => document.querySelectorAll('.sheet-backdrop:not([hidden])').forEach(x => { const c = x.querySelector('.cl-skip:not([hidden]), .sheet-head .del'); if (c) c.click(); })); await p.waitForTimeout(800);
  ok('al terminar, el Inicio tiene el gráfico elegido', await p.evaluate(() => !document.getElementById('trend').hidden && JSON.parse(localStorage.getItem('gastos-v1')).trendMode === 'mes'), await p.evaluate(() => JSON.parse(localStorage.getItem('gastos-v1') || '{}').trendMode));
  await ctx.close();
  // nueva instalación que no toca nada: sin gráfico
  const c2 = await b.newContext({ ...devices['iPhone 15'] }); const p2 = await c2.newPage();
  await p2.route(/dolarapi|pydolar|supabase|er-api|tasa.json|coingecko/, r => r.abort());
  await p2.goto(APP); await p2.waitForTimeout(3000);
  ok('instalación nueva: por defecto «Sin gráfico»', await p2.evaluate(() => document.getElementById('trend').hidden));
  await c2.close();
  // quien ya tenía «Este mes» guardado lo conserva
  const c3 = await b.newContext({ ...devices['iPhone 15'] }); const p3 = await c3.newPage();
  await p3.route(/dolarapi|pydolar|supabase|er-api|tasa.json|coingecko/, r => r.abort());
  await p3.addInitScript(() => { if (!localStorage.getItem('gastos-v1')) localStorage.setItem('gastos-v1', JSON.stringify({ onb: true, trendMode: 'mes', items: [], accounts: [{ id: 1, nombre: 'Banco', moneda: 'USD', saldo: 100 }] })); });
  await p3.goto(APP); await p3.waitForTimeout(3500);
  ok('usuario que ya tenía «Este mes» lo conserva', await p3.evaluate(() => !document.getElementById('trend').hidden));
  await c3.close();
  console.log('errores', errs); await b.close(); })();
