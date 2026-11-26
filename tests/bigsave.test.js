const path = require('path'), fs = require('fs');
const APP = 'file://' + path.resolve(__dirname, '../index.html');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
// Copia de la app con acceso a las funciones que abren cada hoja (solo para la prueba)
const COPY = 'file://' + path.join(OUT, 'app-prueba.html');
fs.writeFileSync(path.join(OUT, 'app-prueba.html'), fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8').replace('window.__msUpd = msUpd;', 'window.__msUpd = msUpd; setTimeout(function(){ window.__T={pg:openPg,sv:openSv,ge:openGe,tr:openTr,mv:openMv,tu:openTu,cq:openCq}; },0);'));
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [];
  const d = require('./datos.js')();
  d.accounts.push(Object.assign({}, d.accounts[0], { id: 99, nombre: 'Efectivo', moneda: 'USD' }));
  const ok = (n, c, x) => console.log((c ? '✓ ' : '✗ FALLA ') + n + (x ? ' — ' + x : ''));
  const ctx = await b.newContext({ ...devices['iPhone 15'] }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.route(/dolarapi|pydolar|supabase|er-api|tasa.json|coingecko/, r => r.abort());
  await p.addInitScript(x => { if (!localStorage.getItem('gastos-v1')) localStorage.setItem('gastos-v1', JSON.stringify(x)); localStorage.setItem('orbe-act', String(Date.now())); }, d);
  await p.goto(COPY); await p.waitForTimeout(3800); await p.addStyleTag({ content: '#inst{display:none!important}' });
  const S = () => p.evaluate(() => JSON.parse(localStorage.getItem('gastos-v1')));
  // pago
  await p.evaluate(() => window.__T.pg(null)); await p.waitForTimeout(700);
  await p.fill('#pg-titulo', 'Internet'); await p.click('#pg-monto'); await p.keyboard.type('2500');
  await p.evaluate(() => document.getElementById('pg-save').click()); await p.waitForTimeout(600);
  let s = await S(); const pg = (s.pays || s.pagos || s.sched || []); ok('programar pago guarda', JSON.stringify(s).includes('Internet'), JSON.stringify(pg).slice(0, 120));
  // transferir
  const n0 = s.items.length;
  await p.evaluate(() => window.__T.tr()); await p.waitForTimeout(700); await p.click('#tr-monto'); await p.keyboard.type('1000');
  await p.evaluate(() => document.getElementById('tr-go').click()); await p.waitForTimeout(700);
  s = await S(); ok('transferir guarda', s.items.length > n0 && s.items.some(i => i.tipo === 'traspaso' && Math.abs(i.monto - 10) < .01));
  // ahorro
  const n1 = s.items.length;
  await p.evaluate(() => window.__T.sv()); await p.waitForTimeout(700); await p.click('#sv-monto'); await p.keyboard.type('500');
  await p.evaluate(() => document.getElementById('sv-go').click()); await p.waitForTimeout(700);
  s = await S(); ok('agregar ahorro guarda', s.items.length > n1, (s.items.length - n1) + ' movimientos');
  // meta
  await p.evaluate(() => window.__T.ge(null)); await p.waitForTimeout(700); await p.click('#ge-meta'); await p.keyboard.type('30000'); await p.fill('#ge-nombre', 'Viaje');
  await p.evaluate(() => document.getElementById('ge-save').click()); await p.waitForTimeout(700);
  s = await S(); ok('crear meta guarda', (s.goals || []).some(g => g.nombre === 'Viaje' && Math.abs((g.meta || g.monto) - 300) < .01), JSON.stringify((s.goals || []).slice(-1)));
  console.log('errores', errs); await b.close(); })();
