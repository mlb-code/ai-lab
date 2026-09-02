/* ============================================================
   AI Lab — ווידג'ט הסוכן לכל דפי האתר (בלוג, שאלות, משימה...)
   קובץ עצמאי אחד: מזריק עיצוב + כפתור צף + לוח צ'אט + מוח.
   מתחבר לסוכן האמיתי (my.ai-lab.co.il/api/sales-agent) עם
   נפילה חכמה למוח דמו מקומי. לא נטען בדף הבית (יש לו סוכן מובנה).
   ============================================================ */
(function () {
    'use strict';
    if (document.getElementById('agentOrb')) return; // דף הבית — יש כבר סוכן

    var WA = function (t) { return 'https://wa.me/972546500795?text=' + encodeURIComponent(t); };

    // ---------- עיצוב ----------
    var css = ''
    + '.agent-orb{position:fixed;bottom:26px;left:26px;z-index:220;width:58px;height:58px;border-radius:50%;border:0;cursor:pointer;'
    + 'background:conic-gradient(from 0deg,#6366F1,#4DD6E8,#8B5CF6,#6366F1);display:flex;align-items:center;justify-content:center;'
    + 'box-shadow:0 10px 34px rgba(99,102,241,.65),0 0 0 5px rgba(99,102,241,.2),0 0 44px rgba(77,214,232,.55);animation:agwBeacon 2.6s ease-in-out infinite;}'
    + '@keyframes agwBeacon{0%,100%{box-shadow:0 10px 34px rgba(99,102,241,.6),0 0 0 5px rgba(99,102,241,.18),0 0 34px rgba(77,214,232,.4)}50%{box-shadow:0 10px 40px rgba(99,102,241,.85),0 0 0 8px rgba(99,102,241,.26),0 0 70px rgba(77,214,232,.8)}}'
    + '.agent-orb::before{content:"יש שאלה?";position:absolute;bottom:calc(100% + 10px);left:50%;transform:translateX(-50%);white-space:nowrap;pointer-events:none;'
    + 'color:#fff;font-family:Assistant,sans-serif;font-weight:700;font-size:.76rem;'
    + 'background:linear-gradient(163deg,rgba(214,220,248,.2),rgba(140,148,198,.14)),rgba(13,16,40,.72);'
    + 'backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.3);border-radius:50px;padding:6px 13px;'
    + 'box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 8px 22px rgba(0,0,0,.35);}'
    + '.agent-orb .orb-core{width:46px;height:46px;border-radius:50%;background:#0D1130;display:flex;align-items:center;justify-content:center;}'
    + '.agent-orb .orb-core img{width:32px;height:32px;display:block;}'
    + '.agent-wrap{position:fixed;inset:0;z-index:230;background:rgba(7,9,26,.48);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);'
    + 'display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;pointer-events:none;transition:opacity .25s;direction:rtl;}'
    + '.agent-wrap.open{opacity:1;pointer-events:auto;}'
    + '.agent-box{width:100%;max-width:620px;max-height:82svh;border-radius:28px;border:1px solid rgba(255,255,255,.22);background:rgba(26,30,66,.4);'
    + 'backdrop-filter:blur(30px) saturate(1.75) brightness(1.06);-webkit-backdrop-filter:blur(30px) saturate(1.75) brightness(1.06);'
    + 'box-shadow:0 40px 110px rgba(0,0,0,.55),inset 0 1.5px 0 rgba(255,255,255,.38),inset 0 -1px 0 rgba(0,0,0,.28);'
    + 'display:flex;flex-direction:column;overflow:hidden;transform:translateY(16px) scale(.98);transition:transform .28s cubic-bezier(.3,1.3,.55,1);'
    + 'font-family:Assistant,-apple-system,sans-serif;color:#fff;}'
    + '.agent-wrap.open .agent-box{transform:none;}'
    + '.agw-head{display:flex;align-items:center;gap:10px;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,.14);position:relative;}'
    + '.agw-head img{width:26px;height:26px;filter:drop-shadow(0 0 8px rgba(120,200,255,.45));}'
    + '.agw-head b{font-size:1rem;font-weight:800;}'
    + '.agw-mode{color:rgba(226,229,255,.6);font-size:.72rem;font-weight:700;margin-inline-start:auto;margin-inline-end:44px;}'
    + '.agw-x{position:absolute;top:12px;left:12px;width:38px;height:38px;border-radius:50%;border:0;background:rgba(255,255,255,.08);color:#fff;font-size:1rem;cursor:pointer;}'
    + '.agw-x:hover{background:rgba(255,255,255,.16);}'
    + '.agw-corewrap{display:flex;justify-content:center;padding:10px 0 0;transition:max-height .3s ease,opacity .3s ease;max-height:130px;overflow:hidden;}'
    + '.agw-corewrap canvas{width:106px;height:106px;}'
    + '.agent-box.chatting .agw-corewrap{max-height:0;opacity:0;padding:0;}'
    + '.agent-log{flex:1;overflow-y:auto;padding:22px 20px 8px;display:flex;flex-direction:column;gap:12px;min-height:220px;'
    + 'background-image:radial-gradient(rgba(255,255,255,.05) 1px,transparent 1px);background-size:24px 24px;}'
    + '.ag-msg{max-width:88%;border-radius:14px;padding:12px 15px;font-size:.9rem;line-height:1.7;}'
    + '.ag-msg.bot{align-self:flex-start;position:relative;margin-inline-start:36px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.16);'
    + 'box-shadow:inset 0 1px 0 rgba(255,255,255,.18);border-inline-start:2.5px solid rgba(77,214,232,.55);color:rgba(255,255,255,.92);border-bottom-right-radius:5px;}'
    + '.ag-msg.bot::before{content:"AI";position:absolute;inset-inline-start:-36px;top:0;width:26px;height:26px;border-radius:8px;'
    + 'background:linear-gradient(120deg,#6366F1,#4DD6E8);color:#fff;font-size:.58rem;font-weight:900;display:flex;align-items:center;justify-content:center;}'
    + '.ag-msg.user{align-self:flex-end;background:linear-gradient(135deg,rgba(99,102,241,.4),rgba(139,92,246,.32));border:1px solid rgba(255,255,255,.22);'
    + 'box-shadow:inset 0 1px 0 rgba(255,255,255,.25);color:#fff;border-bottom-left-radius:5px;}'
    + '.ag-typing{display:inline-flex;gap:5px;padding:4px 2px;}'
    + '.ag-typing i{width:7px;height:7px;border-radius:50%;background:rgba(159,232,242,.7);animation:agwDot 1.1s ease-in-out infinite;}'
    + '.ag-typing i:nth-child(2){animation-delay:.18s}.ag-typing i:nth-child(3){animation-delay:.36s}'
    + '@keyframes agwDot{0%,100%{transform:translateY(0);opacity:.5}45%{transform:translateY(-5px);opacity:1}}'
    + '.ag-actions{display:flex;flex-wrap:wrap;gap:8px;align-self:flex-start;max-width:92%;}'
    + '.ag-act{display:inline-flex;align-items:center;gap:7px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.2);'
    + 'box-shadow:inset 0 1px 0 rgba(255,255,255,.16);color:#C9F2F8;font-weight:700;font-size:.84rem;border-radius:50px;padding:8px 16px;'
    + 'cursor:pointer;text-decoration:none;transition:background .2s,transform .15s;font-family:inherit;}'
    + '.ag-act:hover{background:rgba(77,214,232,.2);transform:translateY(-1px);}'
    + '.ag-act.wa{background:rgba(31,175,87,.15);border-color:rgba(74,222,128,.4);color:#86EFAC;}'
    + '.ag-lead{align-self:flex-start;width:92%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:9px;}'
    + '.ag-lead input{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);border-radius:11px;padding:10px 13px;color:#fff;font-family:Assistant,sans-serif;font-size:.93rem;}'
    + '.ag-lead input::placeholder{color:rgba(255,255,255,.4);}'
    + '.ag-lead button{background:linear-gradient(120deg,#6366F1,#8B5CF6);color:#fff;border:0;border-radius:11px;padding:11px;font-weight:800;font-size:.93rem;cursor:pointer;font-family:inherit;}'
    + '.agw-chips{display:flex;flex-wrap:wrap;gap:8px;padding:10px 20px 14px;justify-content:center;}'
    + '.agw-form{display:flex;gap:10px;padding:0 20px 20px;}'
    + '.agw-form input{flex:1;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);box-shadow:inset 0 1px 0 rgba(255,255,255,.2);'
    + 'border-radius:50px;padding:13px 20px;color:#fff;font-family:inherit;font-size:.9rem;transition:border-color .2s;}'
    + '.agw-form input:focus{outline:none;border-color:rgba(77,214,232,.6);}'
    + '.agw-form input::placeholder{color:rgba(255,255,255,.38);}'
    + '.agw-send{background:linear-gradient(120deg,#6366F1,#8B5CF6);color:#fff;border:0;border-radius:50px;padding:12px 24px;font-weight:700;cursor:pointer;font-family:inherit;font-size:.9rem;}'
    + 'body.agent-open{overflow:hidden;}'
    + '@media (max-width:700px){.agent-orb{bottom:18px;left:18px;width:54px;height:54px;}.agent-wrap{padding:10px;align-items:flex-end;}.agent-box{max-height:88svh;border-radius:24px;}}';

    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // ---------- מבנה ----------
    var root = document.createElement('div');
    root.innerHTML = ''
        + '<button class="agent-orb" id="agwOrb" aria-label="דברו עם הסוכן של AI Lab"><span class="orb-core"><img src="/logo-gem-96.png" alt=""></span></button>'
        + '<div class="agent-wrap" id="agwWrap" role="dialog" aria-modal="true" aria-label="הסוכן של AI Lab">'
        + '  <div class="agent-box" id="agwBox">'
        + '    <div class="agw-head"><img src="/logo-gem-96.png" alt=""><b>הסוכן של AI Lab</b><span class="agw-mode">עונה על הכול · 24/7</span>'
        + '      <button class="agw-x" id="agwX" aria-label="סגירה">&#10005;</button></div>'
        + '    <div class="agw-corewrap"><canvas id="agwCore" width="128" height="128"></canvas></div>'
        + '    <div class="agent-log" id="agwLog"></div>'
        + '    <div class="agw-chips" id="agwChips"></div>'
        + '    <form class="agw-form" id="agwForm"><input id="agwField" type="text" placeholder="שאלו אותי הכול על AI Lab…" autocomplete="off">'
        + '      <button type="submit" class="agw-send">שליחה</button></form>'
        + '  </div>'
        + '</div>';
    document.body.appendChild(root);

    var wrap = document.getElementById('agwWrap'),
        log = document.getElementById('agwLog'),
        chipsEl = document.getElementById('agwChips'),
        form = document.getElementById('agwForm'),
        field = document.getElementById('agwField'),
        orb = document.getElementById('agwOrb');

    // ---------- ליבת האנרגיה ----------
    var coreState = 'idle';
    (function core(){
        var cv = document.getElementById('agwCore');
        if (!cv) return;
        var cx = cv.getContext('2d'), C = 64, t = 0, run = false, speed = 1, glow = .55, amp = 0;
        var ARCS = [
            { r: 44, w: 2.2, sp: 1.0, off: 0, c: '99,102,241' },
            { r: 35, w: 1.7, sp: -1.6, off: 2.1, c: '77,214,232' },
            { r: 26, w: 1.4, sp: 2.3, off: 4.2, c: '244,114,182' }
        ];
        function frame() {
            if (!run) return;
            var target = coreState === 'think' ? 4.2 : coreState === 'speak' ? 1.6 : 1;
            var gT = coreState === 'idle' ? .55 : 1;
            speed += (target - speed) * .06;
            glow += (gT - glow) * .08;
            amp = coreState === 'speak' ? .5 + .5 * Math.sin(t * 9) : amp * .92;
            t += .016 * speed;
            cx.clearRect(0, 0, 128, 128);
            var breathe = 13 + 3.5 * Math.sin(t * 1.8) + amp * 5;
            var g = cx.createRadialGradient(C, C, 0, C, C, breathe + 22);
            g.addColorStop(0, 'rgba(200,205,255,' + (.85 * glow) + ')');
            g.addColorStop(.35, 'rgba(139,141,255,' + (.5 * glow) + ')');
            g.addColorStop(1, 'rgba(139,141,255,0)');
            cx.fillStyle = g;
            cx.beginPath(); cx.arc(C, C, breathe + 22, 0, 6.283); cx.fill();
            cx.fillStyle = 'rgba(240,242,255,' + (.95 * glow) + ')';
            cx.beginPath(); cx.arc(C, C, 5.5 + amp * 2, 0, 6.283); cx.fill();
            for (var i = 0; i < ARCS.length; i++) {
                var a = ARCS[i], start = t * a.sp + a.off;
                cx.beginPath(); cx.arc(C, C, a.r / 2 + 8, start, start + 2.4);
                cx.strokeStyle = 'rgba(' + a.c + ',' + (.75 * glow) + ')';
                cx.lineWidth = a.w; cx.lineCap = 'round'; cx.stroke();
                var px = C + (a.r / 2 + 8) * Math.cos(start + 2.4), py = C + (a.r / 2 + 8) * Math.sin(start + 2.4);
                cx.beginPath(); cx.arc(px, py, a.w + .6, 0, 6.283);
                cx.fillStyle = 'rgba(' + a.c + ',' + glow + ')'; cx.fill();
            }
            requestAnimationFrame(frame);
        }
        new MutationObserver(function(){
            var isOpen = wrap.classList.contains('open');
            if (isOpen && !run) { run = true; frame(); }
            else if (!isOpen) run = false;
        }).observe(wrap, { attributes: true, attributeFilter: ['class'] });
    })();

    // ---------- פתיחה/סגירה ----------
    var opened = false;
    function openAgent() {
        wrap.classList.add('open');
        document.body.classList.add('agent-open');
        if (!opened) { opened = true; greet(); }
        setTimeout(function(){ field.focus(); }, 250);
    }
    function closeAgent() {
        wrap.classList.remove('open');
        document.body.classList.remove('agent-open');
    }
    orb.addEventListener('click', openAgent);
    document.getElementById('agwX').addEventListener('click', closeAgent);
    wrap.addEventListener('click', function(e){ if (e.target === wrap) closeAgent(); });
    addEventListener('keydown', function(e){ if (e.key === 'Escape' && wrap.classList.contains('open')) closeAgent(); });

    // ---------- רינדור ----------
    function bubble(cls, html) {
        var d = document.createElement('div');
        d.className = 'ag-msg ' + cls;
        d.innerHTML = html;
        log.appendChild(d);
        log.scrollTop = log.scrollHeight;
        if (log.querySelectorAll('.ag-msg').length > 1) document.getElementById('agwBox').classList.add('chatting');
        return d;
    }
    function typeBot(text, then) {
        coreState = 'think';
        var d = bubble('bot', '<span class="ag-typing"><i></i><i></i><i></i></span>');
        setTimeout(function(){
            coreState = 'speak';
            var i = 0;
            d.textContent = '';
            (function t(){
                i += 2;
                d.textContent = text.slice(0, i);
                log.scrollTop = log.scrollHeight;
                if (i < text.length) setTimeout(t, 11);
                else { coreState = 'idle'; if (then) then(); }
            })();
        }, 480 + Math.min(500, text.length * 2));
    }
    function renderActions(actions) {
        if (!actions || !actions.length) return;
        var row = document.createElement('div');
        row.className = 'ag-actions';
        actions.forEach(function(a){
            if (a.t === 'lead') { renderLead(); return; }
            var el = document.createElement('a');
            el.className = 'ag-act' + (a.t === 'wa' ? ' wa' : '');
            el.innerHTML = a.label;
            if (a.t === 'link') { el.href = a.href; if (a.href.indexOf('#') !== 0) { el.target = '_blank'; el.rel = 'noopener'; } }
            else if (a.t === 'wa') { el.href = WA(a.msg); el.target = '_blank'; el.rel = 'noopener'; }
            else if (a.t === 'scroll') { el.href = '/' + (a.sel || '#courses'); } // בדפי משנה — ניווט לדף הבית
            else if (a.t === 'course') { el.href = '/#courses'; }
            row.appendChild(el);
        });
        log.appendChild(row);
        log.scrollTop = log.scrollHeight;
    }
    function renderLead() {
        var f = document.createElement('form');
        f.className = 'ag-lead';
        f.innerHTML = '<input name="nm" placeholder="שם מלא" required>'
            + '<input name="ph" placeholder="טלפון" type="tel" required>'
            + '<button type="submit">שלחו לנו בוואטסאפ ←</button>';
        f.addEventListener('submit', function(e){
            e.preventDefault();
            var nm = f.nm.value.trim(), ph = f.ph.value.trim();
            open(WA('היי! אשמח שתחזרו אליי לגבי הקורסים\nשם: ' + nm + '\nטלפון: ' + ph), '_blank');
            typeBot('מעולה! פתחתי לכם וואטסאפ עם הפרטים מוכנים — רק ללחוץ שליחה, ונחזור אליכם אישית.');
        });
        log.appendChild(f);
        log.scrollTop = log.scrollHeight;
    }
    function respond(r) { typeBot(r.text, function(){ renderActions(r.actions); }); }

    // ---------- מוח דמו (נפילה כשאין רשת) ----------
    var ACT = {
        map:    { t: 'link', href: '/#courses', label: 'למפת הקורסים' },
        reg:    { t: 'link', href: 'https://my.ai-lab.co.il/join', label: 'להרשמה' },
        wa:     { t: 'wa', msg: 'היי, אני מתעניין בקורסים של AI Lab', label: 'דברו איתנו בוואטסאפ' },
        waCall: { t: 'wa', msg: 'היי, אשמח לתאם שיחת היכרות קצרה', label: 'תיאום שיחה בוואטסאפ' },
        lead:   { t: 'lead' },
        sites:  { t: 'link', href: '/#wall', label: 'לקיר האתרים' },
        portal: { t: 'link', href: 'https://my.ai-lab.co.il', label: 'לאזור האישי' },
        adult:  { t: 'link', href: 'https://starter.ai-lab.co.il', label: 'לקורסי המבוגרים' }
    };
    var INTENTS = [
        { k: ['שיחה', 'פגישה', 'לתאם', 'תיאום', 'טלפון'], r: { text: 'בשמחה! הדרך הכי מהירה היא וואטסאפ — עונים שם אישית ומהר. אפשר גם להשאיר פרטים כאן ונחזור אליכם.', actions: [ACT.waCall, ACT.lead] } },
        { k: ['מחיר', 'עולה', 'כמה', 'עלות', 'תשלום'], r: { text: 'המחירים אצלנו גלויים תמיד: קורס יזמות ובינה מלאכותית — 990 ₪ ל-8 מפגשים. קורס תכנות ב-AI (המתקדם) — 1,250 ₪. עד 5 תלמידים בקבוצה, והאזור האישי כלול.', actions: [ACT.map, ACT.reg] } },
        { k: ['גיל', 'בן ', 'בת ', 'מתאים ל'], r: { text: 'הקורסים מתאימים לגילאי 9–16, בקבוצות גיל נפרדות של עד 5 תלמידים. מתחילים מקורס היזמות — משם כל המסלולים נפתחים.', actions: [ACT.map, ACT.waCall] } },
        { k: ['דוגמ', 'פרויקט', 'בנו', 'תוצאות'], r: { text: 'יש לנו עשרות אתרים חיים שילדים בנו — כולם באוויר. מוזמנים לקיר האתרים בדף הבית:', actions: [ACT.sites] } },
        { k: ['קורס', 'לומדים', 'מסלול', 'תכנות', 'סילבוס'], r: { text: 'יש לנו מפת קורסים שלמה: מתחילים בקורס יזמות (בונים מיזם ואתר ראשון), וממשיכים לפי מה שהילד אוהב — תכנות ב-AI, סרטונים, מוזיקה, שיווק ועוד.', actions: [ACT.map, ACT.reg] } },
        { k: ['הרשמ', 'להירשם', 'נרשמ', 'פרטים'], r: { text: 'קלי קלות — משאירים פרטים כאן ואנחנו חוזרים אליכם, או נרשמים ישירות:', actions: [ACT.lead, ACT.reg] } },
        { k: ['מבוגר', 'למבוגרים'], r: { text: 'בטח! יש לנו את AI Lab Starter — קורסי AI למבוגרים בלי רקע טכני.', actions: [ACT.adult, ACT.wa] } },
        { k: ['אזור אישי', 'פורטל', 'הקלטות'], r: { text: 'כל תלמיד מקבל אזור אישי: מפגשים, הקלטות, חומרים — ועוזר AI שזמין תמיד.', actions: [ACT.portal] } },
        { k: ['שלום', 'היי', 'הי '], r: { text: 'היי! אני הסוכן של AI Lab — שאלו אותי על הקורסים, המחירים או תיאום שיחת היכרות.', actions: [ACT.map, ACT.waCall] } },
        { k: ['זום', 'איפה', 'מיקום', 'מפגש'], r: { text: 'המפגשים חיים בזום — קבוצות קטנות של עד 5 תלמידים, מכל מקום בארץ.', actions: [ACT.map, ACT.wa] } }
    ];
    function demoBrain(text) {
        var t = text.trim();
        for (var i = 0; i < INTENTS.length; i++) if (INTENTS[i].k.some(function(k){ return t.indexOf(k) !== -1; })) return INTENTS[i].r;
        return { text: 'שאלה מעולה — את זו נשמור לצוות שלנו בוואטסאפ עונים מהר, ובינתיים אפשר להציץ במפת הקורסים.', actions: [ACT.wa, ACT.map, ACT.lead] };
    }

    // ---------- צ'יפים ----------
    [{ l: 'תיאום שיחה', q: 'אפשר לתאם שיחה?' },
     { l: 'הקורסים והמחירים', q: 'כמה עולה קורס?' },
     { l: 'השארת פרטים', q: 'אני רוצה להשאיר פרטים' }].forEach(function(c){
        var b = document.createElement('button');
        b.className = 'ag-act'; b.type = 'button'; b.textContent = c.l;
        b.addEventListener('click', function(){ send(c.q); });
        chipsEl.appendChild(b);
    });

    function greet() {
        respond({ text: 'היי! אני הסוכן של AI Lab. שאלו אותי כל דבר על הקורסים — או בחרו נושא למטה.', actions: [] });
    }

    // ---------- המוח האמיתי + נפילה לדמו ----------
    var AGENT_API = 'https://my.ai-lab.co.il/api/sales-agent';
    var hist = [];
    function send(text) {
        if (!text.trim()) return;
        var clean = text.replace(/[<>]/g, '');
        bubble('user', clean);
        field.value = '';
        hist.push({ role: 'user', content: clean });
        coreState = 'think';
        fetch(AGENT_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: hist.slice(-12) })
        }).then(function(res){
            if (!res.ok) throw 0;
            return res.json();
        }).then(function(r){
            hist.push({ role: 'assistant', content: r.text || '' });
            respond(r);
        }).catch(function(){
            respond(demoBrain(clean));
        });
    }
    form.addEventListener('submit', function(e){ e.preventDefault(); send(field.value); });
})();
