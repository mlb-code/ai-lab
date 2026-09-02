import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'fb-post-image.html');

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 600));

await page.screenshot({
  path: path.join(__dirname, 'fb-post-image.png'),
  type: 'png',
  omitBackground: false,
  clip: { x: 0, y: 0, width: 1200, height: 630 },
});

console.log('✓ Saved: fb-post-image.png (1200×630, 2x)');
await browser.close();
