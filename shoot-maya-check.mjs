import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
// Mobile viewport (iPhone-ish)
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
const url = 'https://ai-lab.co.il/mayasuqish/';
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 2500));
await page.screenshot({ path: '/tmp/maya-mobile.jpg', type: 'jpeg', quality: 85 });
// Check for horizontal overflow
const overflow = await page.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
  bodyDir: getComputedStyle(document.body).direction,
}));
console.log(JSON.stringify(overflow));
// Open hamburger
await page.click('#hamburger');
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: '/tmp/maya-menu.jpg', type: 'jpeg', quality: 85 });
await browser.close();
console.log('done');
