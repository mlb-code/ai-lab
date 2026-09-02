import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'email-preview.html');

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 700, height: 1400, deviceScaleFactor: 2 });
await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });

await page.screenshot({
  path: path.join(__dirname, 'email-preview.jpg'),
  type: 'jpeg',
  quality: 95,
  fullPage: true,
});

console.log('Done! Saved to email-preview.jpg');
await browser.close();
