// שרת פיתוח מקומי ל-AI Lab — מהיר, עם מטמון ותמיכה בדילוגי וידאו
// הפעלה: node dev-server.mjs   (או דאבל-קליק על start-server.command)
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = '/Users/meirlb/Desktop/ai-lab';
const MIME = { html:'text/html; charset=utf-8', js:'text/javascript', mjs:'text/javascript', css:'text/css',
  jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', svg:'image/svg+xml', webp:'image/webp', gif:'image/gif',
  mp4:'video/mp4', json:'application/json', txt:'text/plain; charset=utf-8', ico:'image/x-icon',
  woff:'font/woff', woff2:'font/woff2', xml:'application/xml' };
http.createServer((req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.normalize(path.join(ROOT, p));
    if (!f.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
    const st = fs.statSync(f);
    const ext = f.split('.').pop().toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    const cache = ext === 'html' ? 'no-cache' : 'public, max-age=600';
    const range = req.headers.range;
    if (range && st.size > 0) {
      const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
      const a = m[1] ? +m[1] : 0, z = m[2] ? +m[2] : st.size - 1;
      res.writeHead(206, { 'Content-Type': mime, 'Content-Range': `bytes ${a}-${z}/${st.size}`,
        'Accept-Ranges': 'bytes', 'Content-Length': z - a + 1, 'Cache-Control': cache });
      fs.createReadStream(f, { start: a, end: z }).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': mime, 'Content-Length': st.size,
        'Accept-Ranges': 'bytes', 'Cache-Control': cache });
      fs.createReadStream(f).pipe(res);
    }
  } catch (e) { res.writeHead(500); res.end('err'); }
}).listen(5502, '127.0.0.1', () => console.log('AI Lab dev server → http://localhost:5502'));
