const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: +(process.argv[2]||1) });
  const p = await ctx.newPage(); p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file://' + __dirname + '/5-lifelines-3d.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: __dirname + '/5-lifelines-3d.png' });
  await b.close();
})();
