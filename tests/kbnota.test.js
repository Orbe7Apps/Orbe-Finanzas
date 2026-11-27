// Nuevo movimiento con el teclado abierto: la hoja sube entera, sin encogerse, junto con el teclado, y la nota queda a la vista
const path = require('path'), fs = require('fs');
const APP = 'file://' + path.resolve(__dirname, '../index.html');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const { chromium, devices } = require('playwright');
const KB = 336;
(async () => { const b = await chromium.launch(); const errs = []; let fail = 0;
  const ok = (c, m) => { console.log((c ? '✓ ' : '✗ FALLA ') + m); if (!c) fail++; };
  const d0 = require('./datos.js')();
  for (const th of ['light', 'dark', 'mono']) {
    const d = JSON.parse(JSON.stringify(d0)); if (th === 'dark') d.theme = 'dark'; if (th === 'mono') d.mono = true;
    const ctx = await b.newContext({ ...devices['iPhone 15'], viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, colorScheme: th === 'dark' ? 'dark' : 'light' }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.route(/dolarapi|pydolar|supabase|er-api|tasa.json|coingecko/, r => r.abort());
    await p.addInitScript(x => { localStorage.setItem('gastos-v1', JSON.stringify(x)); localStorage.setItem('orbe-act', String(Date.now()));
      const et = new EventTarget(); et.height = innerHeight; et.offsetTop = 0; et.width = innerWidth; et.offsetLeft = 0; et.scale = 1; window.__vv = et;
      Object.defineProperty(window, 'visualViewport', { get: () => et }); }, d);
    await p.goto(APP); await p.waitForTimeout(4000); await p.addStyleTag({ content: '#inst{display:none!important}' });
    await p.evaluate(() => document.getElementById('fab').click()); await p.waitForTimeout(400);
    await p.evaluate(() => document.querySelector('[data-dial="mov"]').click()); await p.waitForTimeout(800);
    const kbOn = k => p.evaluate(k => { __vv.height = innerHeight - k; __vv.dispatchEvent(new Event('resize')); }, k);
    const check = () => p.evaluate(() => { const a = document.activeElement, r = a.getBoundingClientRect(), sh = document.querySelector('#sheet .sheet').getBoundingClientRect(), ft = document.querySelector('#sheet .sheet-foot').getBoundingClientRect();
      return { id: a.id, top: Math.round(r.top), bottom: Math.round(r.bottom), vis: __vv.height, sheetBottom: Math.round(sh.bottom), footTop: Math.round(ft.top) }; });
    // Monto
    const h0 = await p.evaluate(() => document.querySelector('#sheet .sheet').offsetHeight);
    await p.focus('#monto'); await kbOn(KB); await p.waitForTimeout(700);
    let c = await check(); ok(c.id === 'monto' && c.top >= 0 && c.bottom <= c.vis, th + ' monto a la vista ' + JSON.stringify(c));
    ok(Math.abs(c.sheetBottom - c.vis) <= 2 && c.footTop < c.vis, th + ' la hoja termina encima del teclado');
    ok(Math.abs(await p.evaluate(() => document.querySelector('#sheet .sheet').offsetHeight) - h0) <= 2, th + ' la hoja sube entera, sin encogerse');
    await p.screenshot({ path: path.join(OUT, 'kbnota-monto-' + th + '.png') });
    await p.evaluate(() => { document.activeElement.blur(); __vv.height = innerHeight; __vv.dispatchEvent(new Event('resize')); }); await p.waitForTimeout(400);
    ok(await p.evaluate(() => !document.documentElement.classList.contains('kb-up')), th + ' al cerrar el teclado la hoja vuelve abajo');
    // Nota: se toca la ficha, se enfoca el campo y luego aparece el teclado (como en el iPhone)
    await p.evaluate(() => document.getElementById('ms-nota').click()); await p.waitForTimeout(50);
    ok(await p.evaluate(() => document.documentElement.classList.contains('kb-up')), th + ' la hoja empieza a subir al tocar, junto con el teclado (altura recordada)');
    await kbOn(KB); await p.waitForTimeout(900);
    ok(await p.evaluate(() => document.querySelector('#sheet .sheet').style.transform === ''), th + ' al terminar la subida no queda desplazamiento');
    await p.keyboard.type('almuerzo con Ana'); await p.waitForTimeout(600);
    c = await check(); ok(c.id === 'nota' && c.top >= 0 && c.bottom <= c.footTop && c.bottom <= c.vis, th + ' nota a la vista ' + JSON.stringify(c));
    await p.screenshot({ path: path.join(OUT, 'kbnota-nota-' + th + '.png') });
    ok(await p.evaluate(() => document.getElementById('ms-nota-t').textContent) === 'almuerzo con Ana', th + ' la ficha muestra la nota');
    await p.evaluate(() => { document.activeElement.blur(); __vv.height = innerHeight; __vv.dispatchEvent(new Event('resize')); }); await p.waitForTimeout(400);
    await ctx.close();
  }
  console.log(fail ? fail + ' FALLA' : 'todo bien', 'errores', errs); await b.close(); })();
