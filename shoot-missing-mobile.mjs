// צילום מובייל לאתרי תלמידים שחסר להם תצלום בפסיפס ההירו.
// פורמט זהה לקיים: 390×780 @2x → project-previews-mobile/slug.jpg (780×1560)
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bigDir = path.join(__dirname, 'project-previews-mobile');
const desktopDir = path.join(__dirname, 'project-previews-small');

const all = fs.readdirSync(desktopDir).filter(f => f.endsWith('.jpg')).map(f => f.replace('.jpg', ''));
const have = new Set(fs.readdirSync(bigDir).filter(f => f.endsWith('.jpg')).map(f => f.replace('.jpg', '')));
const missing = all.filter(s => !have.has(s));
console.log('חסרים:', missing.length, missing.join(' '));

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1');

const failed = [];
for (const slug of missing) {
  const url = `https://ai-lab.co.il/${slug}/`;
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 40000 });
    await new Promise(r => setTimeout(r, 1800));
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(bigDir, `${slug}.jpg`), type: 'jpeg', quality: 80 });
    console.log('✓', slug);
  } catch (e) {
    failed.push(slug);
    console.error('✗', slug, e.message.split('\n')[0]);
  }
}
await browser.close();
console.log('נכשלו:', failed.length ? failed.join(' ') : 'אף אחד');
