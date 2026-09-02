import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 820, deviceScaleFactor: 1 });
await page.goto('https://ai-lab.co.il/fcbuddy/?cb=' + Math.floor(Math.random()*1e9), { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 2500));
await page.screenshot({ path: '/tmp/fcbuddy-desktop.jpg', type: 'jpeg', quality: 82 });
const info = await page.evaluate(() => {
  const v = document.querySelector('.hero-visual').getBoundingClientRect();
  return { tvLeft: Math.round(v.left), tvRight: Math.round(v.right), tvWidth: Math.round(v.width), vw: window.innerWidth, offLeft: v.left < 0, offRight: v.right > window.innerWidth };
});
console.log(JSON.stringify(info));
await browser.close();
