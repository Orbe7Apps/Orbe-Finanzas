const path = require('path'), fs = require('fs');
const APP = 'file://' + path.resolve(__dirname, '../index.html');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [];
  const d0 = require('./datos.js')();
  const ok = (n, c, x) => console.log((c ? '✓ ' : '✗ FALLA ') + n + (x ? ' — ' + x : ''));
  for (const th of [{ n: 'L', st: {} }, { n: 'D', st: { theme: 'dark' } }, { n: 'M', st: { mono: true } }]) {
    const d = Object.assign(JSON.parse(JSON.stringify(d0)), th.st); d.templates = [{ id: 't1', nombre: 'Café', tipo: 'gasto', cuenta: d.accounts[0].id, cat: 'Restaurantes', nota: '' }];
    const ctx = await b.newContext({ ...devices['iPhone 15'], deviceScaleFactor: 2, colorScheme: th.st.theme || 'light' }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.route(/dolarapi|pydolar|supabase|er-api|tasa.json|coingecko/, r => r.abort());
    await p.addInitScript(x => { if (!sessionStorage.q) { sessionStorage.q = 1; localStorage.setItem('gastos-v1', JSON.stringify(x)); localStorage.setItem('orbe-act', String(Date.now())); } }, d);
    await p.goto(APP); await p.waitForTimeout(4200); await p.addStyleTag({ content: '#inst{display:none!important}' });
    await p.evaluate(() => document.getElementById('fab').click()); await p.waitForTimeout(400); await p.evaluate(() => document.querySelector('[data-dial="mov"]').click()); await p.waitForTimeout(800);
    if (th.n === 'L') {
      ok('cerrada no se ve: ni lupa ni grupos', await p.evaluate(() => { const w = document.getElementById('cat-chips'); return w.hidden && w.getBoundingClientRect().height === 0 && !w.querySelector('.cg-q').offsetParent; }));
      ok('las tres frecuentes son píldoras bajas en una fila', await p.evaluate(() => { const r = [...document.querySelectorAll('#cat-quick .cq')].map(x => x.getBoundingClientRect()); return r.length > 0 && r.every(q => q.height <= 36) && new Set(r.map(q => Math.round(q.top))).size === 1 && r.every(q => q.left >= 0 && q.right <= innerWidth) && [...document.querySelectorAll('#cat-quick .cq span')].every(x => x.scrollWidth <= x.clientWidth + 1) && Math.abs(r[0].left - document.getElementById('cat-btn').getBoundingClientRect().left) < 1 && Math.abs(r[r.length - 1].right - document.getElementById('cat-btn').getBoundingClientRect().right) < 1; }), await p.evaluate(() => [...document.querySelectorAll('#cat-quick .cq')].map(x => Math.round(x.getBoundingClientRect().height)).join(',')));
      await p.screenshot({ path: OUT + '/cg-L-cerrada.png' });
    }
    await p.evaluate(() => { window.__hs = []; const w = document.getElementById('cat-chips'); document.getElementById('cat-btn').click(); let t = 0; const iv = setInterval(() => { window.__hs.push(Math.round(w.getBoundingClientRect().height)); if (++t > 9) clearInterval(iv); }, 50); }); await p.waitForTimeout(700);
    if (th.n === 'L') { const hs = await p.evaluate(() => window.__hs); ok('se despliega creciendo de a poco (sin salto)', hs[0] < hs[hs.length - 1] && hs.filter((v, i) => i && v > hs[i - 1]).length >= 3 && !hs.some((v, i) => i && v < hs[i - 1] - 2), hs.join(','));
      ok('montos rápidos: no aparecen en Nuevo movimiento', await p.evaluate(() => document.getElementById('amt-quick').hidden)); }
    await p.evaluate(() => { const c = document.getElementById('cat-chips'); c.scrollIntoView({ block: 'start' }); document.querySelector('#sheet .sheet').scrollBy(0, -40); }); await p.waitForTimeout(300);
    await p.screenshot({ path: OUT + '/cg-' + th.n + '-mov.png' });
    if (th.n === 'L') {
      ok('Nuevo movimiento: 4 grupos con las 22 categorías', await p.evaluate(() => document.querySelectorAll('#cat-chips .cg-grp').length === 4 && document.querySelectorAll('#cat-chips .cg-row').length === 22), await p.evaluate(() => [...document.querySelectorAll('#cat-chips .cg-h')].map(x => x.textContent).join(',')));
      ok('dos columnas sin desborde', await p.evaluate(() => { const r = [...document.querySelectorAll('#cat-chips .cg-row')].map(x => x.getBoundingClientRect()); const xs = new Set(r.map(q => Math.round(q.left))); return xs.size === 2 && r.every(q => q.right <= innerWidth); }));
      await p.fill('#cat-chips .cg-q', 'tra'); await p.waitForTimeout(200);
      ok('buscar «tra» deja Transporte y oculta los grupos vacíos', await p.evaluate(() => [...document.querySelectorAll('#cat-chips .cg-row')].filter(x => !x.hidden).map(x => x.textContent).join(',') === 'Transporte' && [...document.querySelectorAll('#cat-chips .cg-grp')].filter(g => !g.hidden).length === 1));
      await p.screenshot({ path: OUT + '/cg-L-buscar.png' });
      await p.fill('#cat-chips .cg-q', 'zzz'); await p.waitForTimeout(200);
      ok('sin resultados muestra el aviso', await p.evaluate(() => !document.querySelector('#cat-chips .cg-none').hidden));
      await p.fill('#cat-chips .cg-q', ''); await p.waitForTimeout(200);
      await p.click('#cat-chips [data-cat-pick="Mascotas"]'); await p.waitForTimeout(700);
      ok('elegir una la pone en el movimiento y la lista se pliega (y no se ve)', await p.evaluate(() => document.getElementById('cat').value === 'Mascotas' && document.getElementById('cat-chips').hidden && document.getElementById('cat-chips').getBoundingClientRect().height === 0), await p.evaluate(() => document.getElementById('cat').value));
      await p.evaluate(() => document.getElementById('cat-btn').click()); await p.waitForTimeout(600);
      ok('el botón vuelve a abrirla', await p.evaluate(() => !document.getElementById('cat-chips').hidden && document.getElementById('cat-chips').getBoundingClientRect().height > 300 && document.querySelector('#cat-chips .cg-q').offsetParent !== null));
      await p.evaluate(() => document.getElementById('cat-btn').click()); await p.waitForTimeout(600);
      ok('y otra vez la cierra', await p.evaluate(() => document.getElementById('cat-chips').hidden && document.getElementById('cat-chips').getBoundingClientRect().height === 0));
      await p.evaluate(() => document.getElementById('cat-btn').click()); await p.waitForTimeout(600);
      ok('al reabrir, la elegida queda marcada', await p.evaluate(() => document.querySelector('#cat-chips [data-cat-pick="Mascotas"]').getAttribute('aria-selected') === 'true'));
      await p.evaluate(() => document.querySelector('[data-type="ingreso"]').click()); await p.waitForTimeout(300); await p.evaluate(() => { const c = document.getElementById('cat-chips'); if (c.hidden) document.getElementById('cat-btn').click(); }); await p.waitForTimeout(600);
      ok('Ingreso: sus grupos (Trabajo, Otros ingresos)', await p.evaluate(() => [...document.querySelectorAll('#cat-chips .cg-h')].map(x => x.textContent).join(',') === 'Trabajo,Otros ingresos' && document.querySelectorAll('#cat-chips .cg-row').length === 10), await p.evaluate(() => [...document.querySelectorAll('#cat-chips .cg-h')].map(x => x.textContent).join(',')));
      await p.screenshot({ path: OUT + '/cg-L-ingreso.png' });
      // movimiento completo
      await p.evaluate(() => document.querySelector('[data-type="gasto"]').click()); await p.waitForTimeout(300);
      await p.fill('#monto', '700'); await p.evaluate(() => { if (document.getElementById('cat-chips').hidden) document.getElementById('cat-btn').click(); }); await p.waitForTimeout(600); await p.click('#cat-chips [data-cat-pick="Ropa"]'); await p.waitForTimeout(700);
      await p.evaluate(() => document.getElementById('add').click()); await p.waitForTimeout(600);
      ok('se guarda el gasto con la categoría elegida', await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('gastos-v1')); return s.items.some(it => it.cat === 'Ropa' && it.monto === 7); }), await p.evaluate(() => document.getElementById('err').textContent + ' | ' + JSON.stringify(JSON.parse(localStorage.getItem('gastos-v1')).items.slice(-1))));
    }
    await p.evaluate(() => document.querySelectorAll('.sheet-backdrop:not([hidden])').forEach(x => { const c = x.querySelector('.sheet-head .del'); if (c) c.click(); })); await p.waitForTimeout(500);
    // Editor de plantillas
    await p.evaluate(() => document.getElementById('fab').click()); await p.waitForTimeout(400); await p.evaluate(() => document.querySelector('[data-dial="plantilla"]').click()); await p.waitForTimeout(700);
    await p.evaluate(() => document.querySelector('[data-tpl-edit="t1"]').click()); await p.waitForTimeout(700);
    await p.evaluate(() => { document.getElementById('te-cats').scrollIntoView({ block: 'start' }); document.querySelector('#te-sheet .sheet').scrollBy(0, -50); }); await p.waitForTimeout(300);
    await p.screenshot({ path: OUT + '/cg-' + th.n + '-te.png' });
    if (th.n === 'L') {
      ok('Plantilla: grupos y la categoría de la plantilla marcada', await p.evaluate(() => document.querySelectorAll('#te-cats .cg-grp').length === 4 && document.querySelector('#te-cats [data-te-cat="Restaurantes"]').getAttribute('aria-checked') === 'true'));
      await p.fill('#te-cats .cg-q', 'sal'); await p.waitForTimeout(200);
      ok('el buscador también filtra aquí', await p.evaluate(() => [...document.querySelectorAll('#te-cats .cg-row')].filter(x => !x.hidden).map(x => x.textContent).join(',') === 'Salud'));
      await p.click('#te-cats [data-te-cat="Salud"]'); await p.waitForTimeout(300);
      ok('elegir mantiene el filtro y marca la nueva', await p.evaluate(() => document.getElementById('te-cat').value === 'Salud' && document.querySelector('#te-cats [data-te-cat="Salud"]').getAttribute('aria-checked') === 'true' && document.querySelector('#te-cats .cg-q').value === 'sal'));
      await p.evaluate(() => document.querySelector('[data-te="ingreso"]').click()); await p.waitForTimeout(300);
      ok('cambiar a Ingreso muestra sus categorías', await p.evaluate(() => document.querySelectorAll('#te-cats .cg-row').length === 10));
    }
    await ctx.close();
  }
  console.log('errores', errs); await b.close(); })();
