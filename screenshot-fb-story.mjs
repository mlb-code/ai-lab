import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'fb-story-image.html');

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 2 });
await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 600));

await page.screenshot({
  path: path.join(__dirname, 'fb-story-image.png'),
  type: 'png',
  omitBackground: false,
  clip: { x: 0, y: 0, width: 1080, height: 1920 },
});

console.log('✓ Saved: fb-story-image.png (1080×1920, 2x)');
await browser.close();
