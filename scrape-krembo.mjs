import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setUserAgent('Mozilla/5.0');
await page.goto('https://contacts.krembo.org.il/he', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 4000));

const data = await page.evaluate(() => {
  const emails = new Set();
  document.querySelectorAll('a[href^="mailto:"]').forEach(a => emails.add(a.href.replace('mailto:','').split('?')[0]));
  const text = document.body.innerText;
  const regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  (text.match(regex) || []).forEach(e => emails.add(e));
  const cards = [];
  document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
    const email = el.href.replace('mailto:','').split('?')[0];
    let ctx = el;
    for (let i=0; i<5 && ctx; i++) ctx = ctx.parentElement;
    cards.push({ email, ctx: (ctx||el).innerText.slice(0,400) });
  });
  return { emails: [...emails], cards, text_len: text.length };
});

console.log(JSON.stringify(data, null, 2));
await browser.close();
