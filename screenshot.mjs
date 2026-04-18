import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'webinar-us-banner.html');

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 628, deviceScaleFactor: 2 });
await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });

const banner = await page.$('#banner');
await banner.screenshot({
  path: path.join(__dirname, 'webinar-us-banner.jpg'),
  type: 'jpeg',
  quality: 95,
});

console.log('Done! Saved to webinar-us-banner.jpg');
await browser.close();
