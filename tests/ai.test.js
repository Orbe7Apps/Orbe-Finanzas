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
  const shots = [];
  for (const th of [{ n: 'L', st: {} }, { n: 'D', st: { theme: 'dark' } }, { n: 'M', st: { mono: true, theme: 'dark' } }]) {
    let { p, ctx } = await open(3, { state: Object.assign({ sgName: 'Gabriel Mora', payments: [{ id: 'p1', titulo: 'Alquiler', monto: 300, moneda: 'USD', fecha: iso(4), paid: false }, { id: 'p3', titulo: 'Gimnasio', monto: 20, moneda: 'USD', fecha: iso(-1), paid: false }] }, th.st) });
    await p.evaluate(() => document.querySelector('.tab[data-tab="0"]').click()); await p.waitForTimeout(700);
    await p.evaluate(() => document.getElementById('fab').click()); await p.waitForTimeout(450); await p.evaluate(() => document.querySelector('[data-dial="ai"]').click()); await p.waitForTimeout(1100);
    const snap = async n => { await p.screenshot({ path: OUT + '/ai-' + th.n + '-' + n + '.png' }); shots.push(th.n + '-' + n); };
    await snap('0home');
    if (th.n === 'L') {
      ok('saludo con el nombre y 4 tarjetas', await p.evaluate(() => /Hola, Gabriel/.test(document.getElementById('ai-hi').textContent) && [...document.querySelectorAll('#ai-sug .ai-card')].filter(x => x.offsetParent).length === 4));
      console.log('  medidas', await p.evaluate(() => { const f = document.getElementById('ai-form').getBoundingClientRect(), P = document.getElementById('ai-panel'); return JSON.stringify({ fb: Math.round(f.bottom), ft: Math.round(f.top), ih: innerHeight, dsw: document.documentElement.scrollWidth, iw: innerWidth, psw: P.scrollWidth, pcw: P.clientWidth, wide: [...P.querySelectorAll('*')].filter(e => e.offsetParent && e.getBoundingClientRect().right > innerWidth + 1).slice(0, 3).map(e => (e.id || e.className) + ':' + Math.round(e.getBoundingClientRect().right)) }); }));
      ok('sin desborde y la caja de pregunta visible', await p.evaluate(() => { const f = document.getElementById('ai-form').getBoundingClientRect(); return document.documentElement.scrollWidth <= innerWidth + 1 && f.bottom <= innerHeight && f.top > 0 && document.getElementById('ai-panel').scrollWidth <= document.getElementById('ai-panel').clientWidth + 1; }));
      await p.focus('#ai-q'); await p.keyboard.type('hola'); await p.waitForTimeout(500);
      ok('barra limpia: la caja no tiene fondo, borde ni brillo propios, ni al escribir', await p.evaluate(() => { const c = getComputedStyle(document.getElementById('ai-q')); return /rgba\(0, 0, 0, 0\)|transparent/.test(c.backgroundColor) && c.boxShadow === 'none' && parseFloat(c.borderTopWidth) === 0 && parseFloat(c.borderRadius) === 0; }), await p.evaluate(() => { const c = getComputedStyle(document.getElementById('ai-q')); return c.backgroundColor + ' ' + c.boxShadow + ' ' + c.borderRadius; }));
      ok('la barra queda pegada abajo', await p.evaluate(() => innerHeight - document.getElementById('ai-form').getBoundingClientRect().bottom <= 14), 'aire: ' + await p.evaluate(() => Math.round(innerHeight - document.getElementById('ai-form').getBoundingClientRect().bottom)) + 'px');
      await snap('foco'); await p.fill('#ai-q', ''); await p.evaluate(() => document.getElementById('ai-q').blur());
      const last = () => p.evaluate(() => { const b = [...document.querySelectorAll('#ai-thread .ai-msg.bot .ai-b')].pop(); return b ? b.innerText.replace(/\n+/g, ' | ').slice(0, 230) : ''; });
      for (const k of ['mes', 'gasto', 'hoy', 'meta', 'pagos', 'saldo']) {
        await p.evaluate(k => document.querySelector('#ai-sug [data-ask="' + k + '"]').click(), k); await p.waitForTimeout(1500);
        const t = await last(); console.log('  ' + k + ':', t);
        ok(k + ': responde con datos', t.length > 25 && !/undefined|NaN|null/.test(t));
        ok(k + ': la caja sigue visible y sin desborde', await p.evaluate(() => { const f = document.getElementById('ai-form').getBoundingClientRect(); const P = document.getElementById('ai-panel'); return f.bottom <= innerHeight + 1 && P.scrollWidth <= P.clientWidth + 1; }));
        await snap('q-' + k);
      }
      ok('en conversación el saludo se pliega y las sugerencias van en fila', await p.evaluate(() => document.getElementById('ai-panel').classList.contains('chat') && document.getElementById('ai-hero').getBoundingClientRect().height < 4 && getComputedStyle(document.getElementById('ai-sug')).display === 'flex'));
      // escribir una pregunta que entiende
      await p.fill('#ai-q', 'cuanto puedo gastar hoy?'); await p.keyboard.press('Enter'); await p.waitForTimeout(1400);
      ok('pregunta escrita: la entiende', /puedes gastar|te pasaste/i.test(await last()), await last());
      // escribir algo que no entiende, sin IA conectada
      await p.fill('#ai-q', 'recomiéndame un banco'); await p.keyboard.press('Enter'); await p.waitForTimeout(1400);
      ok('pregunta libre sin IA: lo dice y ofrece conectarla', /conecta una IA/i.test(await last()) && await p.evaluate(() => !!document.querySelector('#ai-thread [data-ai-cfg]')), await last());
      await snap('q-libre');
      await p.evaluate(() => document.querySelector('#ai-thread [data-ai-cfg]').click()); await p.waitForTimeout(900);
      ok('«Conectar una IA» abre la configuración', await p.evaluate(() => !document.getElementById('ai-cloud').hidden && document.getElementById('ai-key').offsetParent !== null)); await snap('cfg');
      // acción dentro de una respuesta
      await p.evaluate(() => [...document.querySelectorAll('#ai-thread [data-aiq="goals"]')].pop().click()); await p.waitForTimeout(1200);
      ok('«Ver mis metas» cierra el asistente y abre Ahorro', await p.evaluate(() => document.getElementById('ai-sheet').hidden && document.body.classList.contains('view-goals')));
      // al reabrir empieza limpio
      await p.evaluate(() => document.querySelector('.tab[data-tab="0"]').click()); await p.waitForTimeout(700);
      await p.evaluate(() => document.getElementById('fab').click()); await p.waitForTimeout(450); await p.evaluate(() => document.querySelector('[data-dial="ai"]').click()); await p.waitForTimeout(1000);
      ok('al reabrir empieza de nuevo', await p.evaluate(() => !document.getElementById('ai-panel').classList.contains('chat') && !document.querySelector('#ai-thread .ai-msg') && document.getElementById('ai-diag').parentNode.id === 'ai-store'));
      // cambiar de mes reinicia
      await p.evaluate(() => document.querySelector('#ai-sug [data-ask="gasto"]').click()); await p.waitForTimeout(1200); await p.evaluate(() => document.getElementById('ai-prev').click()); await p.waitForTimeout(600);
      ok('cambiar de mes reinicia la conversación', await p.evaluate(() => !document.querySelector('#ai-thread .ai-msg')));
      await p.evaluate(() => document.getElementById('ai-close').click()); await p.waitForTimeout(500);
      ok('se cierra', await p.evaluate(() => document.getElementById('ai-sheet').hidden));
    } else {
      await p.evaluate(() => document.querySelector('#ai-sug [data-ask="mes"]').click()); await p.waitForTimeout(1500); await snap('q-mes');
      await p.evaluate(() => document.querySelector('#ai-sug [data-ask="meta"]').click()); await p.waitForTimeout(1500); await snap('q-meta');
      if (th.n === 'M') ok('blanco y negro: sin color en el asistente', await p.evaluate(() => { const bad = []; document.querySelectorAll('#ai-panel *').forEach(e => { if (!e.offsetParent) return; const cs = getComputedStyle(e); [cs.color, cs.backgroundColor, cs.stroke, cs.fill].forEach(v => { const m = v && v.match(/rgba?\((\d+), (\d+), (\d+)/); if (m && Math.max(+m[1], +m[2], +m[3]) - Math.min(+m[1], +m[2], +m[3]) > 14) bad.push((e.className.baseVal || e.className || e.tagName) + ' ' + v); }); }); window.__bad = bad; return !bad.length; }), await p.evaluate(() => [...new Set(window.__bad)].slice(0, 4).join(' ; ')));
    }
    await ctx.close();
  }
  require('fs').writeFileSync(OUT + '/ai.json', JSON.stringify(shots));
  console.log('errores', errs); await b.close(); })();
