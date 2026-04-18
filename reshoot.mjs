import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'project-previews');

// Reshoot all projects at tighter viewport (less empty space)
const projects = [
  'build-pc',
  'spot',
  'free-movie-trailers',
  'trendsaver',
  'nadavlego',
  'hairmatch',
  'horse-fashion',
  'gamebuddy',
  'tennismate',
  'drivelog',
];

const browser = await puppeteer.launch({ headless: true });

for (const slug of projects) {
  const url = `https://ai-lab.co.il/${slug}/`;
  const outPath = path.join(outDir, `${slug}.jpg`);
  console.log(`Shooting ${url}...`);
  const page = await browser.newPage();
  // Wider aspect (16:9.6 ≈ closer to card aspect), avoids empty bottom
  await page.setViewport({ width: 1400, height: 840, deviceScaleFactor: 1 });
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({
      path: outPath,
      type: 'jpeg',
      quality: 80,
      clip: { x: 0, y: 0, width: 1400, height: 840 },
    });
    const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(`  → ${kb}KB`);
  } catch (e) {
    console.error(`  FAILED: ${e.message}`);
  }
  await page.close();
}

await browser.close();
console.log('\nDone!');
