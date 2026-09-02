import puppeteer from 'puppeteer';
import path from 'path'; import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fileUrl = 'file://' + path.join(__dirname, 'index.html');
const browser = await puppeteer.launch({ headless: true });
const m = await browser.newPage();
await m.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
await m.goto(fileUrl, { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise(r => setTimeout(r, 1000));
// scroll to gallery
await m.evaluate(() => document.querySelector('.proj-grid').scrollIntoView({block:'start'}));
await new Promise(r => setTimeout(r, 500));
// report visual order by position (RTL: sort by top, then by right x descending)
const visual = await m.evaluate(() => {
  const cards = [...document.querySelectorAll('.proj-grid .proj-card')].filter(c=>c.offsetParent!==null);
  return cards.map(c => { const r=c.getBoundingClientRect(); return { s:c.querySelector('.proj-student')?.textContent.trim(), top:Math.round(r.top), right:Math.round(r.right)}; })
    .sort((a,b)=> a.top-b.top || b.right-a.right)
    .map(x=>x.s);
});
console.log('VISUAL ORDER (mobile collapsed):', JSON.stringify(visual));
await m.screenshot({ path: '/tmp/gallery-mobile-collapsed.jpg', type:'jpeg', quality: 82 });
await browser.close();
