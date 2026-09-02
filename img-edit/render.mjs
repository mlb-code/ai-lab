import puppeteer from '/Users/meirlb/Desktop/ai-lab/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const browser = await puppeteer.launch({
  headless: 'new',
  defaultViewport: { width: 1408, height: 768, deviceScaleFactor: 1 },
});

const page = await browser.newPage();
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
page.on('pageerror', err => console.log('PAGE ERR:', err.message));

await page.goto('file://' + join(__dirname, 'compose.html'), { waitUntil: 'networkidle0' });
await page.evaluateHandle('document.fonts.ready');

// Wait for bg image to fully load
await page.evaluate(() => {
  const img = document.querySelector('img.bg');
  if (!img) { console.log('NO BG IMG'); return; }
  console.log('IMG src:', img.src, 'complete:', img.complete, 'naturalW:', img.naturalWidth);
  return new Promise(r => {
    if (img.complete && img.naturalWidth > 0) return r();
    img.onload = r; img.onerror = r;
  });
});

// small additional wait for any layout
await new Promise(r => setTimeout(r, 500));

await page.screenshot({
  path: join(__dirname, 'output.png'),
  type: 'png',
  clip: { x: 0, y: 0, width: 1408, height: 768 },
  omitBackground: false,
});

await browser.close();
console.log('✅ Saved to output.png');
