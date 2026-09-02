import puppeteer from 'puppeteer';
import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, 'travelpick');
const out = path.join(__dirname, 'project-previews', 'travelpick.jpg');
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
await page.goto('file://' + path.join(dir,'index.html'), { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise(r => setTimeout(r, 2000));
await page.screenshot({ path: out, type: 'jpeg', quality: 82, clip: {x:0,y:0,width:1280,height:720} });
console.log('preview -> ' + (fs.statSync(out).size/1024).toFixed(1) + 'KB');
// verify nav links resolve to existing files
const links = await page.evaluate(() => [...document.querySelectorAll('a.card-cta')].map(a => ({txt:a.textContent.trim(), href:a.getAttribute('href')})));
console.log('links: ' + JSON.stringify(links));
for (const l of links) {
  const target = path.join(dir, l.href);
  console.log('  ' + l.href + ' exists: ' + fs.existsSync(target));
}
await browser.close();
