import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'project-previews');

const slug = 'englishkids';
const url = `https://ai-lab.co.il/${slug}/`;
const outPath = path.join(outDir, `${slug}.jpg`);

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
console.log(`Shooting ${url}...`);
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 2500));
await page.screenshot({
  path: outPath,
  type: 'jpeg',
  quality: 82,
  clip: { x: 0, y: 0, width: 1280, height: 720 },
});
const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`  → ${kb}KB`);
await browser.close();
