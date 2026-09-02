import puppeteer from '/Users/meirlb/Desktop/ai-lab/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const browser = await puppeteer.launch({
  headless: 'new',
  defaultViewport: { width: 794, height: 1123, deviceScaleFactor: 2 }, // A4 @96dpi, 2x retina
});

const page = await browser.newPage();
await page.goto('file://' + join(__dirname, 'flyer.html'), { waitUntil: 'networkidle0' });

// Wait for fonts to load
await page.evaluateHandle('document.fonts.ready');

const element = await page.$('.page');
await element.screenshot({
  path: join(__dirname, 'flyer.png'),
  type: 'png',
  omitBackground: false,
});

await browser.close();
console.log('✅ Exported to flyer.png');
