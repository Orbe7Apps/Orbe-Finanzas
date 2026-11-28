// Animaciones: se miden cuadro a cuadro (posición de la hoja, opacidad) y se buscan saltos y parpadeos
const path = require('path'), fs = require('fs');
const APP = 'file://' + path.resolve(__dirname, '../index.html');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const { chromium, devices } = require('playwright');
const KB = 336;
// Mayor salto entre dos cuadros seguidos y si el movimiento cambia de sentido
// (velocidad en px por cuadro de 16 ms, para no confundir un cuadro lento con un salto)
function jumps(tv) { const v = tv.map(x => x[1]); let mx = 0, rev = 0, dir = 0; for (let i = 1; i < v.length; i++) { const d = v[i] - v[i - 1], dt = Math.max(16, tv[i][0] - tv[i - 1][0]); mx = Math.max(mx, Math.abs(d) * 16 / dt); const s = Math.sign(Math.round(d)); if (s && dir && s !== dir) rev++; if (s) dir = s; } return { mx: Math.round(mx), rev }; }
(async () => { const b = await chromium.launch(); const errs = []; let fail = 0;
  const ok = (c, m) => { console.log((c ? '✓ ' : '✗ FALLA ') + m); if (!c) fail++; };
  const d0 = require('./datos.js')();
  for (const th of ['light', 'dark', 'mono']) {
    const d = JSON.parse(JSON.stringify(d0)); if (th === 'dark') d.theme = 'dark'; if (th === 'mono') d.mono = true;
    const ctx = await b.newContext({ ...devices['iPhone 15'], viewport: { width: 393, height: 852 }, deviceScaleFactor: 1, colorScheme: th === 'dark' ? 'dark' : 'light' }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(th + ': ' + e.message));
    await p.route(/dolarapi|pydolar|supabase|er-api|tasa.json|coingecko/, r => r.abort());
    await p.addInitScript(x => { localStorage.setItem('gastos-v1', JSON.stringify(x)); localStorage.setItem('orbe-act', String(Date.now()));
      const et = new EventTarget(); et.height = innerHeight; et.offsetTop = 0; et.width = innerWidth; et.offsetLeft = 0; et.scale = 1; window.__vv = et;
      Object.defineProperty(window, 'visualViewport', { get: () => et });
      // Grabador por cuadros: f() devuelve un número por cuadro
      window.__rec = (f, ms) => new Promise(res => { const v = [], t0 = performance.now(); (function s(n) { try { v.push([n, f()]); } catch (e) { v.push([n, NaN]); } if (n - t0 < ms) requestAnimationFrame(s); else res(v); })(t0); });
    }, d);
    await p.goto(APP);
    await p.waitForTimeout(700); await p.screenshot({ path: path.join(OUT, 'anim-carga-' + th + '.png') });
    // Pantalla de carga: los anillos giran y el punto late; luego se va con un fundido
    const sp = await p.evaluate(() => { const el = document.getElementById('splash'); return el ? document.getAnimations().filter(a => el.contains(a.effect && a.effect.target)).map(a => a.animationName) : null; });
    ok(sp && ['spCW', 'spCCW', 'spHalo'].every(n => sp.includes(n)), th + ' carga: anillos y punto animados ' + JSON.stringify(sp && [...new Set(sp)]));
    const spOp = await p.evaluate(() => __rec(() => { const el = document.getElementById('splash'); return el ? +getComputedStyle(el).opacity : 0; }, 2600));
    const j0 = jumps(spOp); ok(j0.rev === 0 && spOp[spOp.length - 1][1] === 0, th + ' carga: se desvanece sin parpadeo ' + JSON.stringify(j0));
    await p.waitForTimeout(1500); await p.addStyleTag({ content: '#inst{display:none!important}' });
    ok(await p.evaluate(() => !document.getElementById('splash')), th + ' carga: se quita al terminar');
    // Se pasa por el Historial antes, como quien ya lo vio: así lo nuevo se nota al volver
    await p.evaluate(() => document.querySelector('.tab[data-tab="3"]').click()); await p.waitForTimeout(600);
    await p.evaluate(() => document.querySelector('.tab[data-tab="0"]').click()); await p.waitForTimeout(700);
    // Abrir la hoja de Nuevo movimiento: sube de abajo sin rebotes raros
    await p.evaluate(() => document.getElementById('fab').click()); await p.waitForTimeout(400);
    let pr = p.evaluate(() => __rec(() => document.querySelector('#sheet .sheet').getBoundingClientRect().top, 900));
    await p.evaluate(() => document.querySelector('[data-dial="mov"]').click());
    let v = await pr, j = jumps(v); v = v.map(x => x[1]); ok(v[0] > v[v.length - 1] && j.mx < 200, th + ' hoja: abre ' + JSON.stringify(j) + ' ' + Math.round(v[0]) + '→' + Math.round(v[v.length - 1]));
    const top0 = v[v.length - 1];
    // Teclado: sube junto (altura recordada) y baja igual
    await p.evaluate(k => localStorage.setItem('orbe-kbh', String(k)), KB);
    pr = p.evaluate(() => __rec(() => document.querySelector('#sheet .sheet').getBoundingClientRect().top, 1000));
    await p.evaluate(() => document.getElementById('monto').focus()); await p.waitForTimeout(250);
    await p.evaluate(k => { __vv.height = innerHeight - k; __vv.dispatchEvent(new Event('resize')); }, KB);
    v = await pr; j = jumps(v); v = v.map(x => x[1]); ok(j.rev === 0 && j.mx < 60, th + ' teclado: la hoja sube en un solo gesto ' + JSON.stringify(j) + ' ' + Math.round(v[0]) + '→' + Math.round(v[v.length - 1]));
    ok(await p.evaluate(() => document.getElementById('kb-fill').className === 'on'), th + ' teclado: relleno detrás del teclado del color de la hoja');
    // Escribir: el número salta y la página no se mueve
    const y0 = await p.evaluate(() => scrollY);
    await p.keyboard.type('12'); const pop = await p.evaluate(() => document.getAnimations().some(a => a.animationName === 'amtPop'));
    ok(pop, th + ' monto: el número da su salto al escribir');
    await p.screenshot({ path: path.join(OUT, 'anim-kb-' + th + '.png') });
    ok(await p.evaluate(() => scrollY) === y0, th + ' teclado: la página queda quieta al escribir');
    pr = p.evaluate(() => __rec(() => document.querySelector('#sheet .sheet').getBoundingClientRect().top, 1000));
    await p.evaluate(() => { document.activeElement.blur(); __vv.height = innerHeight; __vv.dispatchEvent(new Event('resize')); });
    v = await pr; j = jumps(v); v = v.map(x => x[1]); ok(j.rev === 0 && j.mx < 60 && Math.abs(v[v.length - 1] - top0) < 3, th + ' teclado: la hoja baja en un solo gesto ' + JSON.stringify(j) + ' ' + Math.round(v[0]) + '→' + Math.round(v[v.length - 1]));
    // Guardar con el teclado abierto: la hoja baja y se cierra sin saltar
    await p.evaluate(() => document.getElementById('monto').focus()); await p.waitForTimeout(250);
    await p.evaluate(k => { __vv.height = innerHeight - k; __vv.dispatchEvent(new Event('resize')); }, KB); await p.waitForTimeout(700);
    pr = p.evaluate(() => __rec(() => document.querySelector('#sheet .sheet').getBoundingClientRect().top, 1100));
    await p.evaluate(() => { document.getElementById('add').click(); setTimeout(() => { __vv.height = innerHeight; __vv.dispatchEvent(new Event('resize')); }, 200); });
    v = await pr; j = jumps(v); v = v.map(x => x[1]); ok(j.rev === 0 && j.mx < 120, th + ' guardar con teclado: la hoja se cierra sin saltar ' + JSON.stringify(j) + ' ' + Math.round(v[0]) + '→' + Math.round(v[v.length - 1]));
    // Movimiento nuevo: en el Historial la fila entra con su animación
    await p.waitForTimeout(800);
    await p.evaluate(() => document.querySelector('.tab[data-tab="3"]').click()); await p.waitForTimeout(80);
    const fl = await p.evaluate(() => document.getAnimations().filter(a => a.animationName === 'itemIn' && a.effect.target.closest('.hrow.flash')).length);
    ok(fl > 0, th + ' registro: al abrir el Historial la fila nueva entra animada');
    await p.waitForTimeout(800); await p.evaluate(() => document.querySelector('.tab[data-tab="0"]').click());
    await p.waitForTimeout(800);
    // Cambio de pestaña: la página entra deslizando, sin parpadear
    for (const tab of ['hist', 'home']) {
      pr = p.evaluate(() => __rec(() => { const el = document.querySelector('body.view-hist .hist-view') || document.querySelector('main'); return +getComputedStyle(el).opacity; }, 700));
      await p.evaluate(t => { document.querySelector('.tab[data-tab="' + (t === 'home' ? 0 : 3) + '"]').click(); }, tab);
      v = await pr; j = jumps(v); v = v.map(x => x[1]); ok(j.rev <= 1 && Math.min(...v) >= 0.3, th + ' pestaña ' + tab + ': entra sin parpadeo ' + JSON.stringify(j) + ' min ' + Math.min(...v).toFixed(2));
      await p.waitForTimeout(500);
    }
    await ctx.close();
  }
  // Con «reducir movimiento»: sin animaciones, la hoja igual sube, baja y se cierra en su sitio
  { const ctx = await b.newContext({ ...devices['iPhone 15'], viewport: { width: 393, height: 852 }, deviceScaleFactor: 1, reducedMotion: 'reduce' }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push('rm: ' + e.message));
    await p.route(/dolarapi|pydolar|supabase|er-api|tasa.json|coingecko/, r => r.abort());
    await p.addInitScript(x => { localStorage.setItem('gastos-v1', JSON.stringify(x)); localStorage.setItem('orbe-act', String(Date.now())); localStorage.setItem('orbe-kbh', '336');
      const et = new EventTarget(); et.height = innerHeight; et.offsetTop = 0; et.width = innerWidth; et.offsetLeft = 0; et.scale = 1; window.__vv = et; Object.defineProperty(window, 'visualViewport', { get: () => et }); }, d0);
    await p.goto(APP); await p.waitForTimeout(1500);
    ok(await p.evaluate(() => !document.getElementById('splash')), 'reducir movimiento: la carga se va rápido');
    await p.evaluate(() => document.getElementById('fab').click()); await p.waitForTimeout(300);
    await p.evaluate(() => document.querySelector('[data-dial="mov"]').click()); await p.waitForTimeout(300);
    await p.evaluate(() => document.getElementById('monto').focus()); await p.evaluate(k => { __vv.height = innerHeight - k; __vv.dispatchEvent(new Event('resize')); }, KB); await p.waitForTimeout(100);
    let r = await p.evaluate(() => { const s = document.querySelector('#sheet .sheet'); return { b: Math.round(s.getBoundingClientRect().bottom), tr: s.style.transform }; });
    ok(r.b === 852 - KB && !r.tr, 'reducir movimiento: la hoja queda al instante sobre el teclado ' + JSON.stringify(r));
    await p.keyboard.type('5'); await p.evaluate(() => { document.getElementById('add').click(); __vv.height = innerHeight; __vv.dispatchEvent(new Event('resize')); }); await p.waitForTimeout(300);
    r = await p.evaluate(() => ({ h: document.getElementById('sheet').hidden, tr: document.querySelector('#sheet .sheet').style.transform, kb: document.documentElement.classList.contains('kb-up') }));
    ok(r.h && !r.tr && !r.kb, 'reducir movimiento: guarda y cierra sin restos ' + JSON.stringify(r));
    await ctx.close(); }
  console.log(fail ? fail + ' FALLA' : 'todo bien', 'errores', errs); await b.close(); })();
