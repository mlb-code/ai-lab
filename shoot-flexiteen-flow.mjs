import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
const log = [];
await page.goto('https://ai-lab.co.il/flexiteen/?cb=' + Math.floor(Math.random()*1e9), { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 1500));
log.push('landing: ' + (await page.title()));
// find a function that navigates to dashboard
const r = await page.evaluate(() => {
  const names = Object.keys(window).filter(k => typeof window[k] === 'function');
  // try common ones
  for (const fn of ['goToDashboard','goDashboard','enterDashboard','login','goToApp','startNow']) {
    if (typeof window[fn] === 'function') { try { window[fn](); return 'called '+fn; } catch(e){ return 'err '+fn+' '+e.message; } }
  }
  return 'no known fn; funcs: ' + names.slice(0,40).join(',');
});
await new Promise(r2 => setTimeout(r2, 2000));
log.push('after nav: ' + r + ' -> ' + page.url() + ' | ' + (await page.title()));
console.log(JSON.stringify(log, null, 2));
await browser.close();
