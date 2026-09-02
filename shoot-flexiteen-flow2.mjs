import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
const log = [];
await page.goto('https://ai-lab.co.il/flexiteen/?cb=' + Math.floor(Math.random()*1e9), { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 1200));
log.push('landing: ' + (await page.title()));
await Promise.all([
  page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(()=>{}),
  page.click('.nav-login'),
]);
await new Promise(r => setTimeout(r, 1500));
log.push('after login click -> ' + page.url() + ' | ' + (await page.title()));
await page.screenshot({ path: '/tmp/flexiteen-dash.jpg', type: 'jpeg', quality: 80 });
console.log(JSON.stringify(log, null, 2));
await browser.close();
