const { chromium } = require('playwright');
(async () => {
  const dir=__dirname;
  const b = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
  const mode=process.argv[2]||'shot';
  const ctx = await b.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor: mode==='shot2'?2:1,
    ...(mode==='video'?{recordVideo:{dir:dir+'/vid',size:{width:1440,height:900}}}:{}) });
  const p = await ctx.newPage(); p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file://'+dir+'/6-hero-stories.html',{waitUntil:'networkidle'});
  await p.evaluate(()=>document.fonts.ready);
  if(mode.startsWith('shot')){await p.waitForTimeout(1500);await p.screenshot({path:dir+'/6-hero-stories.png'});
    await p.evaluate(()=>window.__open(0));await p.waitForTimeout(700);await p.screenshot({path:dir+'/6-hero-detail.png'});}
  else{
    await p.mouse.move(1300,150);await p.waitForTimeout(1500);
    for(let k=0;k<30;k++){await p.mouse.wheel(0,60);await p.waitForTimeout(60);}
    await p.waitForTimeout(1500);
    // hover a near card
    const box=await p.evaluate(()=>{const cs=[...document.querySelectorAll('.card')].map(c=>{const r=c.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,o:+c.style.opacity,w:r.width}}).filter(c=>c.o>.9&&c.x>300&&c.x<900).sort((a,b)=>b.w-a.w);return cs[0];});
    if(box){await p.mouse.move(box.x,box.y,{steps:20});await p.waitForTimeout(1600);await p.mouse.click(box.x,box.y);await p.waitForTimeout(300);await p.evaluate(([x,y])=>{if(!document.getElementById('detail').classList.contains('on')){const c=document.elementFromPoint(x,y)?.closest('.card');const cs=[...document.querySelectorAll('.card')];window.__open(Math.max(0,cs.indexOf(c)));console.log('fallback');}},[box.x,box.y]);await p.waitForTimeout(2200);}
    await p.evaluate(()=>document.getElementById('close').click());await p.mouse.move(1300,150);await p.waitForTimeout(400);
    for(let k=0;k<25;k++){await p.mouse.wheel(0,-50);await p.waitForTimeout(60);}
    await p.waitForTimeout(1500);
  }
  await ctx.close();await b.close();
})();
