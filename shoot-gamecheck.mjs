import puppeteer from 'puppeteer';
import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const browser = await puppeteer.launch({ headless: true });
// 1) Desktop preview for gallery
const p1 = await browser.newPage();
await p1.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
await p1.goto('https://ai-lab.co.il/gamecheck/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 2500));
const out = path.join(__dirname, 'project-previews', 'gamecheck.jpg');
await p1.screenshot({ path: out, type: 'jpeg', quality: 82, clip: {x:0,y:0,width:1280,height:720} });
console.log('preview -> ' + (fs.statSync(out).size/1024).toFixed(1) + 'KB');
// 2) Mobile check + open hamburger
const p2 = await browser.newPage();
await p2.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
await p2.goto('https://ai-lab.co.il/gamecheck/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 2000));
const m = await p2.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth, dir: getComputedStyle(document.body).direction }));
console.log('mobile ' + JSON.stringify(m));
await p2.click('#hamburger');
await new Promise(r => setTimeout(r, 700));
await p2.screenshot({ path: '/tmp/gamecheck-menu.jpg', type: 'jpeg', quality: 85 });
await browser.close();
