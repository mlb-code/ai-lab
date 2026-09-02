import puppeteer from 'puppeteer';
const cb = () => '?cb=' + Math.floor(Math.random()*1e9);
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
const log = [];
// 1) landing
await page.goto('https://ai-lab.co.il/setup/' + cb(), { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 1500));
log.push('landing: ' + (await page.title()));
await page.screenshot({ path: '/tmp/setup-1-landing.jpg', type: 'jpeg', quality: 80 });
// try clicking a login/start button that calls goToDashboard
const navigated = await page.evaluate(() => {
  if (typeof goToDashboard === 'function') { goToDashboard('start'); return 'called goToDashboard'; }
  return 'no goToDashboard';
});
await new Promise(r => setTimeout(r, 2000));
log.push('after login click -> ' + page.url() + ' | ' + (await page.title()));
await page.screenshot({ path: '/tmp/setup-2-dashboard.jpg', type: 'jpeg', quality: 80 });
// 2) from dashboard go to panel
const toPanel = await page.evaluate(() => { if (typeof goToPanel === 'function'){ goToPanel(); return 'called goToPanel'; } return 'no goToPanel'; });
await new Promise(r => setTimeout(r, 2000));
log.push('after goToPanel -> ' + page.url() + ' | ' + (await page.title()));
await page.screenshot({ path: '/tmp/setup-3-panel.jpg', type: 'jpeg', quality: 80 });
console.log(JSON.stringify(log, null, 2));
await browser.close();
