const path = require('path'), fs = require('fs');
const APP = 'file://' + path.resolve(__dirname, '../index.html');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [];
  const d0 = require('./datos.js')();
  const ok = (n, c, x) => console.log((c ? '✓ ' : '✗ FALLA ') + n + (x ? ' — ' + x : ''));
  const T0 = new Date(); const iso = (off) => { const x = new Date(T0.getFullYear(), T0.getMonth(), T0.getDate() + off); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  const GO = [{ id: 'g1', nombre: 'Viaje a la playa', meta: 600, moneda: 'USD', icon: 'plane', color: '#0e9aa7' }, { id: 'g2', nombre: 'Celular nuevo', meta: 450, moneda: 'USD', icon: 'phone', color: '#8a3ffc' }, { id: 'g3', nombre: 'Fondo de emergencia', meta: 200, moneda: 'USD', icon: 'shield', color: '#e08a00' }, { id: 'g4', nombre: 'Carro', meta: 6000, moneda: 'USD', icon: 'car', color: '#e8436a' }, { id: 'g5', nombre: 'Laptop', meta: 800, moneda: 'USD', icon: 'laptop', color: '#2f7de1' }, { id: 'g6', nombre: 'Regalo de mamá', meta: 23000, moneda: 'VES', icon: 'gift', color: '#12a37a' }];
  const dep = (id, gid, v, off) => ({ id, tipo: 'traspaso', cat: 'Meta', fecha: iso(off), desde: { k: 'cuenta', id: 2, monto: v, moneda: 'USD' }, hacia: { k: 'meta', id: gid, monto: v, moneda: 'USD' }, nota: '' });
  async function open(n, opt = {}) {
    const d = JSON.parse(JSON.stringify(d0)); d.goals = GO.slice(0, n); Object.assign(d, opt.state || {}); if (opt.state && opt.state.goals) n = 0;
    if (n) d.items.push(dep(901, 'g1', 90, -40), dep(902, 'g1', 90, -10), dep(903, 'g2', 315, -3)); if (n >= 3) d.items.push(dep(904, 'g3', 200, -20));
    const ctx = await b.newContext({ ...devices[opt.dev || 'iPhone 15'], deviceScaleFactor: 2, colorScheme: d.theme || 'light' }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.route(/dolarapi|pydolar|supabase|er-api|tasa.json|coingecko/, r => r.abort());
    await p.addInitScript(x => { if (!localStorage.getItem('gastos-v1')) { localStorage.setItem('gastos-v1', JSON.stringify(x)); localStorage.setItem('orbe-act', String(Date.now())); } }, d);
    await p.goto(APP); await p.waitForTimeout(4200);
    await p.addStyleTag({ content: '#inst{display:none!important}' });
    await p.evaluate(() => document.querySelector('.tab[data-tab="1"]').click()); await p.waitForTimeout(1800);
    await p.evaluate(() => { const g = document.getElementById('gv-metas-h'); scrollTo({ top: g.getBoundingClientRect().top + scrollY - 90, behavior: 'instant' }); }); await p.waitForTimeout(300);
    return { p, ctx };
  }
  let { p, ctx } = await open(4);
  const cdp = await ctx.newCDPSession(p); const T = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  for (const sel of ['#go-sum', '#acc-sum']) {
    if (sel === '#acc-sum') { await p.evaluate(() => document.querySelector('.tab[data-tab="0"]').click()); await p.waitForTimeout(900); }
    await p.evaluate(sel => document.querySelector(sel).scrollIntoView({ block: 'center', behavior: 'instant' }), sel); await p.waitForTimeout(500);
    const r = await p.evaluate(sel => { const q = document.querySelector(sel).getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height * 0.22]; }, sel);
    const pix = () => p.evaluate(sel => { const c = document.querySelector(sel + ' canvas'); return c.toDataURL().length + ':' + c.width + 'x' + c.height; }, sel);
    ok(sel + ': el lienzo tiene tamaño y dibujo', await p.evaluate(sel => { const c = document.querySelector(sel + ' canvas'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4000) if (d[i]) n++; return c.width > 600 && n > 20; }, sel), await pix());
    // arrastre de lado: gira (no desplaza la página)
    const y0 = await p.evaluate(() => scrollY);
    await T('touchStart', r[0], r[1]); for (let i = 1; i <= 8; i++) { await T('touchMove', r[0] + i * 12, r[1] + i * 2); await p.waitForTimeout(16); }
    const grab = await p.evaluate(sel => document.querySelector(sel).classList.contains('grab'), sel);
    for (let i = 1; i <= 8; i++) { await T('touchMove', r[0] + 96, r[1] + 16 + i * 10); await p.waitForTimeout(16); }   // ya agarrado, también sube y baja
    await T('touchEnd'); await p.waitForTimeout(300);
    ok(sel + ': arrastrar de lado lo agarra y la página no se mueve', grab && (await p.evaluate(() => scrollY)) === y0);
    ok(sel + ': al soltar se suelta', await p.evaluate(sel => !document.querySelector(sel).classList.contains('grab'), sel));
    // recién soltado: un arrastre hacia arriba lo sigue girando (la página no se mueve)
    const y1 = await p.evaluate(() => scrollY);
    await T('touchStart', r[0], r[1] + 40); for (let i = 1; i <= 8; i++) { await T('touchMove', r[0] + i, r[1] + 40 - i * 12); await p.waitForTimeout(16); }
    const grabV = await p.evaluate(sel => document.querySelector(sel).classList.contains('grab'), sel);
    await T('touchEnd'); await p.waitForTimeout(300);
    ok(sel + ': recién movido, deslizar hacia arriba igual desplaza la página', !grabV && (await p.evaluate(() => scrollY)) > y1 + 30, 'scroll ' + y1 + ' → ' + await p.evaluate(() => scrollY));
    await p.evaluate(() => scrollTo({ top: scrollY - 120, behavior: 'instant' })); await p.waitForTimeout(300);
    await T('touchStart', r[0], r[1] + 40); for (let i = 1; i <= 8; i++) { await T('touchMove', r[0] + i, r[1] + 40 - i * 14); await p.waitForTimeout(16); }
    const grab2 = await p.evaluate(sel => document.querySelector(sel).classList.contains('grab'), sel);
    await T('touchEnd'); await p.waitForTimeout(500);
    ok(sel + ': después, deslizar hacia arriba desplaza la página', !grab2 && (await p.evaluate(() => scrollY)) > y1 + 40, 'scroll ' + y1 + ' → ' + await p.evaluate(() => scrollY));
  }
  // al abrir otra pantalla el orbe deja de animar; al volver sigue
  await ctx.close();
  console.log('errores', errs); await b.close(); })();
