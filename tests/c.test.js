const path = require('path'), fs = require('fs');
const APP = 'file://' + path.resolve(__dirname, '../index.html');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [];
  const d0 = require('./datos.js')();
  const ok = (n, c, x) => console.log((c ? '✓ ' : '✗ FALLA ') + n + (x ? ' — ' + x : ''));
  const shots = [];
  for (const th of ['light', 'dark', 'mono']) {
    const d = JSON.parse(JSON.stringify(d0)); if (th === 'dark') d.theme = 'dark'; if (th === 'mono') d.mono = true;
    d.accounts.push(Object.assign({}, d.accounts[0], { id: 99, nombre: 'Efectivo', color: '#e08a00' }));
    const ctx = await b.newContext({ ...devices['iPhone 15'], deviceScaleFactor: 2, colorScheme: th === 'dark' ? 'dark' : 'light' }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.route(/dolarapi|pydolar|supabase|er-api|tasa.json|coingecko/, r => r.abort());
    await p.addInitScript(x => { if (!localStorage.getItem('gastos-v1')) localStorage.setItem('gastos-v1', JSON.stringify(x)); localStorage.setItem('orbe-act', String(Date.now())); }, d);
    await p.goto(APP); await p.waitForTimeout(3800); await p.addStyleTag({ content: '#inst{display:none!important}' });
    await p.evaluate(() => document.getElementById('fab').click()); await p.waitForTimeout(400); await p.evaluate(() => document.querySelector('[data-dial="mov"]').click()); await p.waitForTimeout(1000);
    const vis = id => p.evaluate(id => { const e = document.getElementById(id); const r = e.getBoundingClientRect(); return r.height > 4 && getComputedStyle(e).visibility !== 'hidden'; }, id);
    if (th === 'light') {
      ok('fichas visibles: cuenta, Hoy, Nota', await p.evaluate(() => [...document.querySelectorAll('#mv-strip .ms')].map(b => b.textContent.trim()).map(t => t.replace(/^[A-Z]{1,2}(?=[A-Z][a-z])/, '')).join('|')) === 'Binance|Hoy|Nota', await p.evaluate(() => [...document.querySelectorAll('#mv-strip .ms')].map(b => b.textContent.trim()).join('|')));
      ok('sin subcategorías, sin campo de nota, sin campo de fecha, cuentas plegadas', !(await vis('sub-row')) && !(await vis('nota')) && !(await vis('fecha-btn')) && !(await vis('acc-pick')));
    }
    await p.screenshot({ path: OUT + '/c-' + th + '-0.png' }); shots.push(th + '-0');
    await p.click('#monto'); await p.keyboard.type('1250'); await p.waitForTimeout(120);
    if (th === 'light') ok('el número salta al escribir', await p.evaluate(() => document.getElementById('monto').classList.contains('amt-pop')));
    await p.waitForTimeout(400);
    await p.click('#ms-acc'); await p.waitForTimeout(500);
    if (th === 'light') ok('tocar la cuenta despliega las cuentas', await vis('acc-pick'));
    await p.screenshot({ path: OUT + '/c-' + th + '-1.png' }); shots.push(th + '-1');
    await p.click('[data-ap="99"]'); await p.waitForTimeout(600);
    if (th === 'light') ok('elegir otra cuenta la pone en la ficha y se pliega', (await p.textContent('#ms-acc')).includes('Efectivo') && !(await vis('acc-pick')));
    await p.click('#ms-nota'); await p.waitForTimeout(500); await p.keyboard.type('Almuerzo');
    if (th === 'light') ok('tocar Nota abre el campo y escribe', await vis('nota') && (await p.textContent('#ms-nota')).includes('Almuerzo'));
    await p.screenshot({ path: OUT + '/c-' + th + '-2.png' }); shots.push(th + '-2');
    if (th === 'light') {
      await p.click('#ms-date'); await p.waitForTimeout(600);
      ok('tocar la fecha abre el calendario', await p.evaluate(() => [...document.querySelectorAll('.sheet-backdrop')].filter(x => !x.hidden).length >= 2));
      await p.keyboard.press('Escape'); await p.waitForTimeout(400);
      await p.evaluate(() => { [...document.querySelectorAll('.sheet-backdrop')].filter(x => !x.hidden && x.id !== 'sheet').forEach(x => { const c = x.querySelector('[aria-label="Cerrar"], .del'); if (c) c.click(); }); }); await p.waitForTimeout(400);
      const n0 = await p.evaluate(() => JSON.parse(localStorage.getItem('gastos-v1')).items.length);
      await p.evaluate(() => document.getElementById('add').click()); await p.waitForTimeout(700);
      ok('se guarda con monto, cuenta y nota', await p.evaluate(n0 => { const s = JSON.parse(localStorage.getItem('gastos-v1')); const it = s.items[s.items.length - 1]; return s.items.length === n0 + 1 && Math.abs(it.monto - 12.5) < .001 && it.cuenta == 99 && it.nota === 'Almuerzo'; }, n0), await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('gastos-v1')); return JSON.stringify(s.items[s.items.length - 1]); }));
    }
    await ctx.close();
  }
  require('fs').writeFileSync(OUT + '/c.json', JSON.stringify(shots)); console.log('errores', errs); await b.close(); })();
