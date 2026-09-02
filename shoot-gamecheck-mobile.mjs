import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2, isMobile: true });
await page.goto('https://ai-lab.co.il/gamecheck/?cb=' + Math.floor(Math.random()*1e9), { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 2000));
// full hero shot (top of page)
await page.screenshot({ path: '/tmp/gc-hero.jpg', type: 'jpeg', quality: 82 });
// measure hero height vs viewport
const info = await page.evaluate(() => {
  const hero = document.querySelector('.hero');
  const fg = document.querySelector('.features-grid');
  return {
    heroH: Math.round(hero.getBoundingClientRect().height),
    viewportH: window.innerHeight,
    featuresDisplay: fg ? getComputedStyle(fg).display : null,
    featuresOverflowX: fg ? getComputedStyle(fg).overflowX : null,
    featuresScrollW: fg ? fg.scrollWidth : null,
    featuresClientW: fg ? fg.clientWidth : null,
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  };
});
console.log(JSON.stringify(info, null, 0));
// scroll to features and screenshot
await page.evaluate(() => document.querySelector('.features-grid').scrollIntoView({block:'center'}));
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: '/tmp/gc-features.jpg', type: 'jpeg', quality: 82 });
await browser.close();
