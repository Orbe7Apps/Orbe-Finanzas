const path = require('path'), fs = require('fs');
const APP = 'file://' + path.resolve(__dirname, '../index.html');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [];
  const d0 = require('./datos.js')();
  const ok = (n, c, x) => console.log((c ? '✓ ' : '✗ FALLA ') + n + (x ? ' — ' + x : ''));
  const hue = h => { h = h.replace('#', ''); const r = parseInt(h.substr(0, 2), 16) / 255, g = parseInt(h.substr(2, 2), 16) / 255, bb = parseInt(h.substr(4, 2), 16) / 255; const mx = Math.max(r, g, bb), mn = Math.min(r, g, bb), d = mx - mn; if (!d) return 0; let x = mx === r ? ((g - bb) / d) % 6 : mx === g ? (bb - r) / d + 2 : (r - g) / d + 4; x *= 60; return x < 0 ? x + 360 : x; };
  const rgb2hex = s => { const m = s.match(/\d+/g); return '#' + m.slice(0, 3).map(v => (+v).toString(16).padStart(2, '0')).join(''); };
  const shots = [];
  for (const cf of [{ n: 'orbe', st: {} }, { n: 'azul', st: { accent: 'azul' } }, { n: 'azul-osc', st: { accent: 'azul', theme: 'dark' } }, { n: 'verde', st: { accent: 'verde' } }, { n: 'bn', st: { mono: true } }]) {
    const d = Object.assign(JSON.parse(JSON.stringify(d0)), cf.st);
    d.goals = [{ id: 'g1', nombre: 'Viaje', meta: 600, moneda: 'USD', icon: 'plane', color: '#0e9aa7' }, { id: 'g2', nombre: 'Celular', meta: 450, moneda: 'USD', icon: 'phone', color: '#e5133f' }];
    const ctx = await b.newContext({ ...devices['iPhone 15'], deviceScaleFactor: 2, colorScheme: cf.st.theme || 'light' }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.route(/dolarapi|pydolar|supabase|er-api|tasa.json|coingecko/, r => r.abort());
    await p.addInitScript(x => { if (!sessionStorage.q) { sessionStorage.q = 1; localStorage.setItem('gastos-v1', JSON.stringify(x)); localStorage.setItem('orbe-act', String(Date.now())); } }, d);
    await p.goto(APP); await p.waitForTimeout(4200); await p.addStyleTag({ content: '#inst{display:none!important}' });
    const acc = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim());
    // colores de las categorías en «Tus gastos»
    await p.evaluate(() => { const x = document.querySelector('[data-panel="cat"]'); if (x) x.scrollIntoView({ block: 'start' }); scrollBy(0, -40); }); await p.waitForTimeout(700);
    const cols = await p.evaluate(() => [...document.querySelectorAll('[data-panel="cat"] [style*="--c"]')].slice(0, 8).map(e => getComputedStyle(e).getPropertyValue('--c').trim()).filter(Boolean));
    await p.screenshot({ path: OUT + '/tn-' + cf.n + '-gastos.png' }); shots.push(cf.n + '-gastos');
    if (cf.n === 'orbe') ok('Orbe: categorías con su arcoíris de siempre', new Set(cols.map(c => Math.round(hue(c) / 40))).size >= 3, cols.join(' '));
    if (cf.n.startsWith('azul') || cf.n === 'verde') {
      const ha = hue(acc), far = cols.filter(c => { const d = Math.abs(((hue(c) - ha + 540) % 360) - 180); return d > 35; });
      ok(cf.n + ': categorías en tonos del color de la app', cols.length > 2 && !far.length, 'acento ' + acc + ' · ' + cols.join(' '));
      ok(cf.n + ': y se distinguen entre sí', new Set(cols).size >= Math.min(cols.length, 3), new Set(cols).size + ' tonos distintos');
    }
    // selectores de color (plantilla nueva) y orbe de metas
    await p.evaluate(() => document.getElementById('fab').click()); await p.waitForTimeout(400); await p.evaluate(() => document.querySelector('[data-dial="plantilla"]').click()); await p.waitForTimeout(600);
    await p.evaluate(() => document.getElementById('tpl-new').click()); await p.waitForTimeout(700);
    await p.evaluate(() => { const c = document.getElementById('te-colors'); (c.offsetParent ? c : document.getElementById('te-nota')).scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(300);
    const pick = await p.evaluate(() => { const c = document.getElementById('te-colors'); return { vis: !!c.offsetParent, lbl: !!(c.previousElementSibling && c.previousElementSibling.offsetParent), n: c.children.length, cols: [...c.children].map(x => getComputedStyle(x).backgroundColor) }; });
    await p.screenshot({ path: OUT + '/tn-' + cf.n + '-tpl.png' }); shots.push(cf.n + '-tpl');
    if (cf.n === 'bn') ok('Blanco y negro: sin selector de color ni su título', !pick.vis && !pick.lbl);
    else ok(cf.n + ': selector visible, colores distintos', pick.vis && new Set(pick.cols).size === pick.n, pick.n + ' muestras, ' + new Set(pick.cols).size + ' distintas');
    if (cf.n === 'azul') ok('azul: las muestras son tonos del azul', pick.cols.every(c => { const d = Math.abs(((hue(rgb2hex(c)) - hue(acc) + 540) % 360) - 180); return d <= 35; }), pick.cols.map(rgb2hex).join(' '));
    await ctx.close();
  }
  // cambiar de color en Ajustes: se repinta sin recargar
  { const d = JSON.parse(JSON.stringify(d0)); const ctx = await b.newContext({ ...devices['iPhone 15'] }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.route(/dolarapi|pydolar|supabase|er-api|tasa.json|coingecko/, r => r.abort());
    await p.addInitScript(x => { if (!sessionStorage.q) { sessionStorage.q = 1; localStorage.setItem('gastos-v1', JSON.stringify(x)); } }, d);
    await p.goto(APP); await p.waitForTimeout(4000);
    const c0 = await p.evaluate(() => getComputedStyle(document.querySelector('[data-panel="cat"] [style*="--c"]')).getPropertyValue('--c').trim());
    await p.evaluate(() => document.querySelector('[data-accent-set="rosa"]').click()); await p.waitForTimeout(600);
    const c1 = await p.evaluate(() => getComputedStyle(document.querySelector('[data-panel="cat"] [style*="--c"]')).getPropertyValue('--c').trim());
    await p.evaluate(() => document.querySelector('[data-accent-set="orbe"]').click()); await p.waitForTimeout(600);
    const c2 = await p.evaluate(() => getComputedStyle(document.querySelector('[data-panel="cat"] [style*="--c"]')).getPropertyValue('--c').trim());
    ok('al cambiar a Rosa se tiñe y al volver a Orbe vuelve el original', c0 !== c1 && c2 === c0 && Math.abs(((hue(c1) - 330 + 540) % 360) - 180) < 40, c0 + ' → ' + c1 + ' → ' + c2);
    await ctx.close(); }
  require('fs').writeFileSync(OUT + '/tn.json', JSON.stringify(shots));
  console.log('errores', errs); await b.close(); })();
