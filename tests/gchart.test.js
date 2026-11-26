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
    await p.addInitScript(x => { if (!sessionStorage.q) { sessionStorage.q = 1; localStorage.setItem('gastos-v1', JSON.stringify(x)); localStorage.setItem('orbe-act', String(Date.now())); } }, d);
    await p.goto(APP); await p.waitForTimeout(4200);
    await p.addStyleTag({ content: '#inst{display:none!important}' });
    await p.evaluate(() => document.querySelector('.tab[data-tab="1"]').click()); await p.waitForTimeout(1800);
    await p.evaluate(() => { const g = document.getElementById('gv-metas-h'); scrollTo({ top: g.getBoundingClientRect().top + scrollY - 90, behavior: 'instant' }); }); await p.waitForTimeout(300);
    return { p, ctx };
  }
  const core = p => p.evaluate(() => { const t = document.querySelector('#go-sum .ao-txt'); return t.querySelector('.ao-k').textContent + ' | ' + (t.querySelector('.ao-v').getAttribute('aria-label') || '') + ' | ' + t.querySelector('.ao-s').textContent; });
  const card = (p, id) => p.evaluate(id => { const c = document.querySelector('[data-go="' + id + '"]'); return { open: c.getAttribute('aria-expanded') === 'true', txt: c.innerText.replace(/\n+/g, ' | '), pj: !!c.querySelector('.go-pj'), end: !!c.querySelector('.go-end'), line: c.querySelectorAll('.go-plot svg path').length, eta: (c.querySelector('.go-eta') || {}).textContent || '', h: Math.round(c.getBoundingClientRect().height) }; }, id);
  let { p, ctx } = await open(3);
  ok('orbe con 3 anillos y 3 tarjetas', await p.evaluate(() => !document.getElementById('gorb').hidden && document.getElementById('go-sum').getAttribute('data-rings').split(',').length === 3 && !!document.querySelector('#go-sum canvas') && document.querySelectorAll('#go-list .go-item').length === 3), await core(p));
  ok('el orbe de Metas mide lo mismo que el de Cuentas', await p.evaluate(() => { const a = document.getElementById('go-sum').getBoundingClientRect(), m = document.querySelector('#go-sum .ao-mid').getBoundingClientRect(); return Math.abs(a.width / a.height - 353 / 300) < 0.02 && a.width > 300 && Math.abs(m.width / a.width - 0.34) < 0.01; }));
  ok('cerradas: solo el encabezado, sin gráfico a la vista', await p.evaluate(() => [...document.querySelectorAll('#go-list .go-item')].every(c => c.getBoundingClientRect().height < 62)));
  ok('las tarjetas viejas no se ven', await p.evaluate(() => [...document.querySelectorAll('#goal-list > .goal')].every(x => x.offsetParent === null) && getComputedStyle(document.getElementById('gv-hero')).display === 'none'));
  let c1 = await card(p, 'g1'), c2 = await card(p, 'g2'), c3 = await card(p, 'g3');
  ok('con ritmo: línea, punteada, punto final y mes', c1.pj && c1.end && c1.eta.length > 2, JSON.stringify(c1));
  ok('un solo aporte reciente: sin punteada ni fecha', !c2.pj && !c2.end && !c2.eta, JSON.stringify(c2));
  ok('lograda: sin punteada, dice Lograda', !c3.pj && /Lograda/.test(c3.txt) && !c3.eta, c3.txt);
  ok('no se sale de la pantalla', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && [...document.querySelectorAll('.go-item, .go-a')].every(x => { const r = x.getBoundingClientRect(); return r.right <= innerWidth + 1 && r.left >= -1; })));
  await p.screenshot({ path: OUT + '/go-1.png' });
  await p.click('[data-go="g1"]'); await p.waitForTimeout(1700);
  c1 = await card(p, 'g1');
  ok('abierta: gráfico dibujado, puntos dentro y nada desbordado', await p.evaluate(() => { const c = document.querySelector('[data-go="g1"]'), pl = c.querySelector('.go-plot'), q = pl.getBoundingClientRect(), cr = c.getBoundingClientRect(); return !/100%/.test(getComputedStyle(pl).clipPath) && q.height > 40 && [...c.querySelectorAll('.go-now, .go-end')].every(d => { const r = d.getBoundingClientRect(); return r.top >= q.top - 8 && r.bottom <= q.bottom + 8 && r.right <= cr.right; }) && c.querySelector('.go-act').getBoundingClientRect().right <= cr.right - 8; }));
  ok('el orbe enciende su anillo y el centro muestra la meta', await p.evaluate(() => document.getElementById('go-sum').getAttribute('data-sel') === 'g1') && /Viaje/.test(await core(p)) && /180/.test(await core(p)), await core(p));
  ok('un toque abre la tarjeta: falta y botón', c1.open && /Faltan \$420/.test(c1.txt) && /\+ Depositar/.test(c1.txt), c1.txt);
  ok('las demás se atenúan', await p.evaluate(() => getComputedStyle(document.querySelector('[data-go="g2"]')).opacity < 1));
  await p.screenshot({ path: OUT + '/go-2.png' });
  await p.click('[data-go="g1"] .go-act'); await p.waitForTimeout(700);
  ok('«+ Depositar» abre la hoja de depósito (y no la meta)', await p.evaluate(() => !document.getElementById('gm-sheet').hidden && document.getElementById('gd-sheet').hidden));
  await p.focus('#gm-monto'); await p.keyboard.type('6000', { delay: 15 }); await p.evaluate(() => document.getElementById('gm-go').click()); await p.waitForTimeout(1500);
  c1 = await card(p, 'g1');
  ok('tras depositar $60: monto, falta y total se actualizan', /\$240/.test(c1.txt) && /Faltan \$360/.test(c1.txt) && /240/.test(await core(p)), c1.txt + ' · ' + await core(p));
  ok('la tarjeta sigue abierta tras depositar', c1.open);
  await p.evaluate(() => document.querySelectorAll('.sheet-backdrop:not([hidden]) .sheet-head .del').forEach(x => x.click())); await p.waitForTimeout(500);
  await p.click('[data-go="g1"] .go-n'); await p.waitForTimeout(700);
  ok('segundo toque abre la meta', await p.evaluate(() => !document.getElementById('gd-sheet').hidden));
  await p.evaluate(() => document.getElementById('gd-close').click()); await p.waitForTimeout(500);
  await p.click('[data-go="g3"]'); await p.waitForTimeout(600);
  c3 = await card(p, 'g3');
  ok('meta lograda abierta: «Ver meta»', c3.open && /Ver meta/.test(c3.txt) && !(await card(p, 'g1')).open, c3.txt);
  await p.click('[data-go="g3"] .go-act'); await p.waitForTimeout(600);
  ok('«Ver meta» abre la meta', await p.evaluate(() => !document.getElementById('gd-sheet').hidden)); await p.evaluate(() => document.getElementById('gd-close').click()); await p.waitForTimeout(500);
  await p.evaluate(() => document.getElementById('gv-metas-h').click()); await p.waitForTimeout(400);
  ok('tocar fuera cierra la tarjeta y el centro vuelve al total', !(await card(p, 'g3')).open && await p.evaluate(() => !document.getElementById('go-list').classList.contains('dim')) && /Ahorrado/.test(await core(p)) && /755/.test(await core(p)), await core(p));
  // tocar un anillo del orbe elige esa meta
  await p.evaluate(() => document.getElementById('go-sum').scrollIntoView({ block: 'center', behavior: 'instant' })); await p.waitForTimeout(300);
  const gb = await p.evaluate(() => { const r = document.getElementById('go-sum').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; });
  let hitSel = '';
  for (let f = 0.04; f < 0.34 && !hitSel; f += 0.02) { await p.mouse.click(gb[0] + gb[2] * f, gb[1] + gb[3] / 2); await p.waitForTimeout(250); hitSel = await p.evaluate(() => document.getElementById('go-sum').getAttribute('data-sel')); }
  ok('tocar un anillo del orbe elige esa meta y abre su tarjeta', !!hitSel && (await card(p, hitSel)).open, hitSel + ' · ' + await core(p));
  await p.mouse.click(gb[0] + gb[2] / 2, gb[1] + gb[3] / 2); await p.waitForTimeout(400);
  ok('tocar el centro vuelve al total', (await p.evaluate(() => document.getElementById('go-sum').getAttribute('data-sel'))) === '' && /Ahorrado/.test(await core(p)));
  await p.evaluate(() => document.getElementById('gv-metas-h').click()); await p.waitForTimeout(400);
  // teclado
  await p.focus('[data-go="g2"]'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  ok('con teclado (Enter) también abre', (await card(p, 'g2')).open);
  await ctx.close();
  // 6 metas en pantalla chica, con una en bolívares
  ({ p, ctx } = await open(6, { dev: 'iPhone SE' }));
  ok('monto pegado a la derecha', await p.evaluate(() => [...document.querySelectorAll('.go-item')].every(c => Math.abs(c.querySelector('.go-a').getBoundingClientRect().right - (c.getBoundingClientRect().right - 14)) < 2)));
  ok('6 metas: 5 anillos, 6 tarjetas, sin desbordes', await p.evaluate(() => document.getElementById('go-sum').getAttribute('data-rings').split(',').length === 5 && document.querySelectorAll('#go-list .go-item').length === 6 && document.documentElement.scrollWidth <= innerWidth + 1 && [...document.querySelectorAll('.go-a, .go-act')].every(x => x.getBoundingClientRect().right <= innerWidth)));
  await p.evaluate(() => document.querySelector('[data-go="g6"]').click()); await p.waitForTimeout(600); console.log('  meta en Bs:', (await card(p, 'g6')).txt);
  await p.evaluate(() => document.querySelector('[data-go="g4"]').click()); await p.waitForTimeout(700); await p.screenshot({ path: OUT + '/go-3.png' }); await ctx.close();
  // Sin metas
  ({ p, ctx } = await open(0));
  ok('sin metas: oculto y se ve la invitación', await p.evaluate(() => document.getElementById('gorb').hidden && document.getElementById('goal-empty').offsetParent !== null)); await ctx.close();
  // Blanco y negro oscuro + ocultar ahorros
  ({ p, ctx } = await open(3, { state: { theme: 'dark', mono: true, hideSav: true } }));
  await p.click('[data-go="g2"]'); await p.waitForTimeout(700); await p.screenshot({ path: OUT + '/go-4.png' });
  ok('con ahorros ocultos no se ven montos', await p.evaluate(() => !/\$\s?\d/.test(document.getElementById('gorb').innerText)), (await card(p, 'g2')).txt);
  ok('blanco y negro: nada de color en las tarjetas', await p.evaluate(() => { const bad = []; document.querySelectorAll('#gorb *').forEach(e => { const cs = getComputedStyle(e); [cs.color, cs.backgroundColor, cs.stroke, cs.fill].forEach(v => { const m = v && v.match(/rgba?\((\d+), (\d+), (\d+)/); if (m && Math.max(+m[1], +m[2], +m[3]) - Math.min(+m[1], +m[2], +m[3]) > 14) bad.push(e.className + ' ' + v); }); }); window.__bad = bad; return !bad.length; }), await p.evaluate(() => window.__bad.slice(0, 3).join(' ; '))); await ctx.close();
  // caso real: dos metas sin aportes, blanco y negro claro
  ({ p, ctx } = await open(0, { state: { mono: true, goals: [{ id: 'c1', nombre: 'Carro', meta: 7500, moneda: 'USD', icon: 'car' }, { id: 'c2', nombre: 'Emergencias', meta: 500, moneda: 'USD', icon: 'shield' }] } }));
  await p.click('[data-go="c1"]'); await p.waitForTimeout(900);
  console.log('  sin aportes:', (await card(p, 'c1')).txt);
  await p.screenshot({ path: OUT + '/go-5.png' }); await ctx.close();
  // sin avance reciente (aportes de hace más de 90 días), con un retiro, y muchos movimientos
  const many = []; for (let i = 0; i < 60; i++) many.push(dep(2000 + i, 'g2', 5, -300 + i * 5));
  const wd = { id: 1500, tipo: 'traspaso', cat: 'Meta', fecha: iso(-120), desde: { k: 'meta', id: 'g1', monto: 40, moneda: 'USD' }, hacia: { k: 'cuenta', id: 2, monto: 40, moneda: 'USD' }, nota: '' };
  ({ p, ctx } = await open(0, { state: { goals: [GO[0], GO[1]], items: d0.items.concat([dep(1400, 'g1', 100, -200), dep(1401, 'g1', 90, -150), wd], many) } }));
  const f1 = await card(p, 'g1'), f2 = await card(p, 'g2');
  ok('sin avance reciente: punteada plana, sin fecha ni punto final', f1.pj && !f1.end && !f1.eta && /\$150/.test(f1.txt), f1.txt);
  ok('60 aportes: dibuja y da fecha', f2.pj && f2.end && f2.eta.length > 2 && /\$300/.test(f2.txt), f2.txt);
  ok('la línea no se sale del gráfico', await p.evaluate(() => [...document.querySelectorAll('.go-plot svg path:not(.go-ar)')].every(x => { const r = x.getBoundingClientRect(), q = x.closest('.go-plot').getBoundingClientRect(); return r.top >= q.top - 3 && r.bottom <= q.bottom + 3 && r.right <= q.right + 3; })));
  await p.screenshot({ path: OUT + '/go-6.png' }); await ctx.close();
  console.log('errores', errs); await b.close(); })();
