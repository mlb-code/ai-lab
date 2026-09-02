import puppeteer from '/Users/meirlb/Desktop/ai-lab/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const browser = await puppeteer.launch({ headless: 'new' });

const page = await browser.newPage();
await page.setViewport({ width: 1422, height: 752, deviceScaleFactor: 1 });
page.on('console', msg => console.log('PAGE:', msg.text()));

await page.goto('file://' + join(__dirname, 'banner-compose.html'), { waitUntil: 'networkidle0' });
await page.evaluateHandle('document.fonts.ready');

await page.evaluate(() => {
  const img = document.querySelector('img.bg');
  console.log('img:', img?.src, 'complete:', img?.complete, 'natW:', img?.naturalWidth);
  return new Promise(r => {
    if (img && img.complete && img.naturalWidth > 0) return r();
    if (img) { img.onload = r; img.onerror = r; } else r();
  });
});

await new Promise(r => setTimeout(r, 500));

// Take screenshot of the canvas element (not the whole page)
const el = await page.$('.canvas');
if (!el) { console.log('NO CANVAS'); await browser.close(); process.exit(1); }

const box = await el.boundingBox();
console.log('box:', box);

await el.screenshot({
  path: join(__dirname, 'banner-output.jpg'),
  type: 'jpeg',
  quality: 92,
});

await browser.close();
console.log('✅ banner-output.jpg');
