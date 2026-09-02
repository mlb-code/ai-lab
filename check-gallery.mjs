import puppeteer from 'puppeteer';
import path from 'path'; import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fileUrl = 'file://' + path.join(__dirname, 'index.html');
const browser = await puppeteer.launch({ headless: true });

// MOBILE
const m = await browser.newPage();
await m.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
await m.goto(fileUrl, { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise(r => setTimeout(r, 1200));
const collapsed = await m.evaluate(() => {
  const cards = [...document.querySelectorAll('.proj-grid .proj-card')];
  const visible = cards.filter(c => c.offsetParent !== null);
  return {
    visibleCount: visible.length,
    order: visible.map(c => c.querySelector('.proj-student')?.textContent.trim()),
    btnVisible: document.querySelector('.proj-more-btn')?.offsetParent !== null,
  };
});
// click show more
await m.click('.proj-more-btn');
await new Promise(r => setTimeout(r, 600));
const expanded = await m.evaluate(() => ({
  visibleCount: [...document.querySelectorAll('.proj-grid .proj-card')].filter(c => c.offsetParent !== null).length,
}));

// DESKTOP
const d = await browser.newPage();
await d.setViewport({ width: 1400, height: 900, deviceScaleFactor: 1 });
await d.goto(fileUrl, { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise(r => setTimeout(r, 800));
const desktop = await d.evaluate(() => ({
  visibleCount: [...document.querySelectorAll('.proj-grid .proj-card')].filter(c => c.offsetParent !== null).length,
  btnVisible: document.querySelector('.proj-more-btn')?.offsetParent !== null,
  firstFour: [...document.querySelectorAll('.proj-grid .proj-card')].slice(0,4).map(c=>c.querySelector('.proj-student')?.textContent.trim()),
}));

console.log(JSON.stringify({ MOBILE_collapsed: collapsed, MOBILE_expanded: expanded, DESKTOP: desktop }, null, 2));
await browser.close();
