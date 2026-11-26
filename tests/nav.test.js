const path = require('path'), fs = require('fs');
const APP = 'file://' + path.resolve(__dirname, '../index.html');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const errs=[];
  const d = Object.assign(require('./datos.js')(), { theme: 'dark' });
  const ctx = await b.newContext({ ...devices['iPhone 15'], deviceScaleFactor: 2, colorScheme:'dark' }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.route(/dolarapi|pydolar|supabase|er-api|tasa.json|coingecko/, r => r.abort());
  await p.addInitScript(x => { if (!localStorage.getItem('gastos-v1')) localStorage.setItem('gastos-v1', JSON.stringify(x)); localStorage.setItem('orbe-act', String(Date.now())); }, d);
  await p.goto(APP); await p.waitForTimeout(4000); await p.addStyleTag({ content: '#inst{display:none!important}' });
  const navs = ['hist','pay']; let i=0;
  for (const v of ['Historial','Pagos']) { await p.evaluate(v => [...document.querySelectorAll('nav button, .tabbar button, [data-view]')].find(b => (b.getAttribute('aria-label')||b.textContent).includes(v)).click(), v); await p.waitForTimeout(900);
    const el = await p.$(v==='Historial'?'#hist-prev':'#pay-prev'); const bb = await el.boundingBox();
    await p.screenshot({ path: OUT + '/nav'+(i++)+'.png', clip: { x: 0, y: bb.y - 12, width: 393, height: 70 } });
    console.log(v, await p.evaluate(id => { const b = document.getElementById(id).getBoundingClientRect(); return [b.width, b.height]; }, v==='Historial'?'hist-prev':'pay-prev')); }
  await p.evaluate(() => { document.getElementById('hist-next').click(); }); 
  console.log(await p.evaluate(() => { const e=document.getElementById('hist-prev'), c=getComputedStyle(e), a=getComputedStyle(e,'::after'); return [c.fontSize,c.display,a.content,a.width,a.maskImage?.slice(0,30),a.webkitMaskImage?.slice(0,30), e.innerHTML]; })); console.log('errores', errs); await b.close(); })();
