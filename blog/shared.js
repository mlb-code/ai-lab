/* ============================================================
   AI Lab — Blog Shared Components
   Injects nav, mobile menu, register popup, footer, and lead form
   into placeholder divs on every blog page.
   Single source of truth — update here, applies everywhere.
   ============================================================ */

(function () {
    'use strict';

    // Detect current page so we can mark active link in nav
    var path = window.location.pathname;
    var isBlogIndex = path === '/blog/' || path === '/blog/index.html';

    // ---------- NAV + תפריט מובייל 2026 ----------
    // זהה לחלוטין לאתר הראשי (redesign-2026.html). העיצוב ב-/blog/menu-2026.css.
    var navHTML = ''
        + '<nav id="navbar">'
        + '<div class="nav-inner-2026">'
        + '  <a href="/" class="nav-logo">AI <span>Lab</span></a>'
        + '  <ul class="nav-links nav-links-desktop">'
        + '    <li><a href="/blog/"' + (isBlogIndex ? ' class="active"' : '') + '>עולם ה-AI</a></li>'
        + '    <li><a href="/#courses">הקורסים</a></li>'
        + '    <li><a href="/#wall">הפרויקטים</a></li>'
        + '    <li><a href="/faq.html">שאלות</a></li>'
        + '    <li><a href="/mission.html">המשימה שלנו</a></li>'
        + '  </ul>'
        + '  <div class="nav-cta-group">'
        + '    <a href="https://my.ai-lab.co.il" class="nav-cta nav-ghost">אזור אישי</a>'
        + '    <a href="https://my.ai-lab.co.il/join" class="nav-cta">הרשמה</a>'
        + '  </div>'
        + '  <button class="burger" id="burger" aria-label="תפריט"><span></span><span></span><span></span></button>'
        + '</div>'
        + '</nav>'
        + '<div class="mobile-menu" id="mobileMenu">'
        + '  <button class="m-gem" id="menuAgentBtn" type="button" aria-label="דברו עם ה-AI שלנו">'
        + '    <span class="m-gem-core"><img src="/logo-gem-96.png" alt="" width="64" height="64"></span>'
        + '    <span class="m-gem-label">דברו עם ה-AI שלנו</span>'
        + '  </button>'
        + '  <div class="m-list">'
        + '    <a class="mlink" href="/blog/">עולם ה-AI</a>'
        + '    <a class="mlink" href="/#wall">הפרויקטים של התלמידים</a>'
        + '    <a class="mlink" href="/#videos">סרטוני תלמידים</a>'
        + '    <a class="mlink" href="/#courses">הקורסים והמחירים</a>'
        + '    <a class="mlink" href="/#community">קהילה</a>'
        + '    <a class="mlink" href="/faq.html">שאלות נפוצות</a>'
        + '  </div>'
        + '  <div class="m-actions">'
        + '    <a href="https://my.ai-lab.co.il/join" class="btn btn-primary">הרשמה</a>'
        + '    <a href="https://my.ai-lab.co.il" class="btn btn-ghost-dark">אזור אישי</a>'
        + '    <a href="https://wa.me/972546500794?text=%D7%94%D7%99%D7%99%2C%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%9E%D7%94%D7%91%D7%9C%D7%95%D7%92%20%D7%95%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A4%D7%A8%D7%98%D7%99%D7%9D%20%D7%A2%D7%9C%20%D7%94%D7%A7%D7%95%D7%A8%D7%A1%D7%99%D7%9D%20%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D" target="_blank" rel="noopener" class="btn btn-wa">וואטסאפ</a>'
        + '  </div>'
        + '  <div class="m-social">'
        + '    <a href="https://www.instagram.com/ai.lab.il" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2m0 2A76 76 0 0 0 7.3 4.3c-.9.1-1.3.2-1.6.3-.4.2-.7.3-1 .7-.3.3-.5.6-.7 1-.1.3-.3.8-.3 1.6-.1 1.2-.1 1.5-.1 4.6s0 3.4.1 4.6c.1.9.2 1.3.3 1.6.2.4.3.7.7 1 .3.3.6.5 1 .7.3.1.8.3 1.6.3 1.2.1 1.5.1 4.7.1s3.5 0 4.7-.1c.9-.1 1.3-.2 1.6-.3.4-.2.7-.3 1-.7.3-.3.5-.6.7-1 .1-.3.3-.8.3-1.6.1-1.2.1-1.5.1-4.6s0-3.4-.1-4.6c-.1-.9-.2-1.3-.3-1.6-.2-.4-.3-.7-.7-1-.3-.3-.6-.5-1-.7-.3-.1-.8-.3-1.6-.3-1.2-.1-1.5-.1-4.7-.1M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6m5.2-3.4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4"/></svg></a>'
        + '    <a href="https://www.tiktok.com/@ai.labisrael" target="_blank" rel="noopener" aria-label="TikTok"><svg viewBox="0 0 24 24"><path d="M19.6 7.3a5 5 0 0 1-3.5-1.4v6.6a6 6 0 1 1-6-6c.2 0 .5 0 .7.1v3a3 3 0 1 0 2.2 2.9V1.9h3a5 5 0 0 0 .1.9 5 5 0 0 0 2.2 3.2 5 5 0 0 0 2.8.9v3a8 8 0 0 1-1.5-.6"/></svg></a>'
        + '    <a href="https://discord.gg/qUxv47SCfh" target="_blank" rel="noopener" aria-label="Discord"><svg viewBox="0 0 24 24"><path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg></a>'
        + '    <a href="https://www.facebook.com/share/18CXmH7Zum/" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12"/></svg></a>'
        + '  </div>'
        + '</div>';

    // ---------- REGISTER POPUP HTML ----------
    var popupHTML = ''
        + '<div id="registerPopup" class="scroll-popup-overlay" onclick="if(event.target===this)closeRegisterPopup()">'
        + '  <div class="scroll-popup-box">'
        + '    <button class="scroll-popup-close" onclick="closeRegisterPopup()" aria-label="סגור">&times;</button>'
        + '    <div class="scroll-popup-header">'
        + '      <div class="scroll-popup-icon"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#B4C4FF" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg></div>'
        + '      <h3>שריינו מקום בקורס</h3>'
        + '      <p>השאירו פרטים ונחזור אליכם בהקדם</p>'
        + '    </div>'
        + '    <form class="contact-form" id="contactFormPopup" onsubmit="return submitFormPopup(event)">'
        + '      <input type="hidden" name="access_key" value="9ba5abaf-d501-44db-a33d-d5028c89e0ef">'
        + '      <input type="hidden" name="subject" value="פנייה חדשה מאתר הקורס AI Lab — Blog Popup">'
        + '      <input type="hidden" name="source" value="blog_popup">'
        + '      <div class="form-group">'
        + '        <label for="namePopup">שם מלא</label>'
        + '        <input type="text" id="namePopup" name="name" placeholder="הכניסו את השם שלכם" required>'
        + '      </div>'
        + '      <div class="form-group">'
        + '        <label for="phonePopup">מספר טלפון</label>'
        + '        <input type="tel" id="phonePopup" name="phone" placeholder="050-1234567" required>'
        + '      </div>'
        + '      <div class="form-group">'
        + '        <label for="emailPopup">אימייל</label>'
        + '        <input type="email" id="emailPopup" name="email" placeholder="your@email.com" required>'
        + '      </div>'
        + '      <div class="form-buttons">'
        + '        <button type="submit" class="btn-primary">שלח פנייה</button>'
        + '        <button type="button" class="btn-whatsapp" onclick="sendWhatsAppPopup()">שלח בוואטסאפ</button>'
        + '      </div>'
        + '    </form>'
        + '  </div>'
        + '</div>';

    // ---------- FOOTER HTML ----------
    var footerHTML = ''
        + '<footer class="shared-footer">'
        + '  <div class="footer-content">'
        + '    <div class="footer-section">'
        + '      <h4>AI Lab</h4>'
        + '      <p>המרכז למיומנויות העתיד — יזמות, בינה מלאכותית ובנייה אמיתית לילדים, נוער ומבוגרים.</p>'
        + '    </div>'
        + '    <div class="footer-section">'
        + '      <h4>יצירת קשר</h4>'
        + '      <a href="tel:054-6500794">054-6500794</a>'
        + '      <a href="mailto:meir@ai-lab.co.il">meir@ai-lab.co.il</a>'
        + '      <a href="https://wa.me/972546500794?text=%D7%94%D7%99%D7%99%2C%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%9E%D7%94%D7%91%D7%9C%D7%95%D7%92%20%D7%95%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A4%D7%A8%D7%98%D7%99%D7%9D%20%D7%A2%D7%9C%20%D7%94%D7%A7%D7%95%D7%A8%D7%A1%D7%99%D7%9D%20%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D" target="_blank" onclick="if(window.gtag)gtag(\'event\',\'whatsapp_click\',{event_category:\'contact\',event_label:\'footer_link\'})">WhatsApp</a>'
        + '    </div>'
        + '    <div class="footer-section">'
        + '      <h4>קהילה</h4>'
        + '      <a href="https://chat.whatsapp.com/LpbKfD25gYF6Tx2K9Lj5WG?mode=hqctcli" target="_blank" rel="noopener" style="color:#25D366;font-weight:600;" onclick="if(window.gtag)gtag(\'event\',\'whatsapp_community_click\',{event_category:\'community\',event_label:\'footer_join\'})">קבוצת הוואטסאפ</a>'
        + '      <span style="color:var(--text-muted);font-size:0.85rem;">עדכונים, טיפים יומיים וקהילה</span>'
        + '    </div>'
        + '    <div class="footer-section">'
        + '      <h4>מידע</h4>'
        + '      <a href="/blog/">עולם ה-AI</a>'
        + '      <a href="/#courses">מפת הקורסים</a>'
        + '      <a href="https://my.ai-lab.co.il">אזור אישי</a>'
        + '      <a href="/privacy.html">מדיניות פרטיות</a>'
        + '      <a href="/terms.html">תנאי שימוש</a>'
        + '      <a href="/accessibility.html">הצהרת נגישות</a>'
        + '    </div>'
        + '  </div>'
        + '  <div class="footer-social">'
        + '    <a href="https://www.instagram.com/ai.lab.il" target="_blank" aria-label="Instagram">'
        + '      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>'
        + '    </a>'
        + '    <a href="https://www.tiktok.com/@ai.labisrael" target="_blank" aria-label="TikTok">'
        + '      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-.81-.07 4.86 4.86 0 01-.38-4.56z"/></svg>'
        + '    </a>'
        + '    <a href="https://discord.gg/qUxv47SCfh" target="_blank" aria-label="Discord">'
        + '      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>'
        + '    </a>'
        + '    <a href="https://www.facebook.com/share/18CXmH7Zum/" target="_blank" aria-label="Facebook">'
        + '      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>'
        + '    </a>'
        + '    <a href="https://www.linkedin.com/in/meirlavi" target="_blank" aria-label="LinkedIn">'
        + '      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>'
        + '    </a>'
        + '  </div>'
        + '  <div class="footer-bottom">'
        + '    <span>&copy; 2026 AI Lab — מאיר לביא. כל הזכויות שמורות.</span>'
        + '    <span>ai-lab.co.il</span>'
        + '  </div>'
        + '</footer>';

    // ---------- LEAD FORM HTML (article CTA) ----------
    function leadFormHTML(articleSlug) {
        var slug = articleSlug || 'blog_article';
        return ''
            + '<section class="lead-form-section">'
            + '  <div class="lead-form-card">'
            + '    <h3>רוצים שנלמד את הילדים שלכם להשתמש ב-AI בצורה חכמה ובטוחה?</h3>'
            + '    <p class="lead-form-sub">השאירו פרטים — נחזור אליכם עם פרטים על הקורס, מבלי שום מחויבות.</p>'
            + '    <form class="contact-form" id="leadFormArticle" onsubmit="return submitLeadForm(event)">'
            + '      <input type="hidden" name="access_key" value="9ba5abaf-d501-44db-a33d-d5028c89e0ef">'
            + '      <input type="hidden" name="subject" value="ליד חדש מהבלוג — ' + slug + '">'
            + '      <input type="hidden" name="source" value="blog_article:' + slug + '">'
            + '      <div class="form-group">'
            + '        <label for="leadName">שם מלא</label>'
            + '        <input type="text" id="leadName" name="name" placeholder="הכניסו את השם שלכם" required>'
            + '      </div>'
            + '      <div class="form-group">'
            + '        <label for="leadPhone">מספר טלפון</label>'
            + '        <input type="tel" id="leadPhone" name="phone" placeholder="050-1234567" required>'
            + '      </div>'
            + '      <div class="form-group">'
            + '        <label for="leadEmail">אימייל</label>'
            + '        <input type="email" id="leadEmail" name="email" placeholder="your@email.com" required>'
            + '      </div>'
            + '      <div class="form-buttons">'
            + '        <button type="submit" class="btn-primary">שלח פנייה</button>'
            + '        <button type="button" class="btn-whatsapp" onclick="sendLeadWhatsApp()">שלח בוואטסאפ</button>'
            + '      </div>'
            + '    </form>'
            + '    <p class="lead-form-phone">או התקשרו ישירות: <a href="tel:054-6500794">054-6500794</a></p>'
            + '  </div>'
            + '</section>';
    }

    // ---------- INJECT INTO PAGE ----------
    function inject(id, html, before) {
        var el = document.getElementById(id);
        if (!el) return;
        if (before) {
            el.insertAdjacentHTML('beforebegin', html);
            // כפתור וואטסאפ צף (המספר העסקי) — גם במאמרים
            if (!document.querySelector('.wa-float')) {
                var waCss = document.createElement('style');
                waCss.textContent = '.wa-float{position:fixed;bottom:26px;left:22px;z-index:94;width:54px;height:54px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 26px rgba(37,211,102,.45),0 0 0 4px rgba(37,211,102,.16);transition:transform .2s;text-decoration:none}.wa-float:hover{transform:translateY(-2px) scale(1.04)}@media(max-width:768px){.wa-float{bottom:calc(22px + env(safe-area-inset-bottom));left:16px;width:50px;height:50px}}';
                document.head.appendChild(waCss);
                document.body.insertAdjacentHTML('beforeend', '<a class="wa-float" href="https://wa.me/972546500794?text=%D7%94%D7%99%D7%99%2C%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%9E%D7%94%D7%91%D7%9C%D7%95%D7%92%20%D7%95%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A4%D7%A8%D7%98%D7%99%D7%9D%20%D7%A2%D7%9C%20%D7%94%D7%A7%D7%95%D7%A8%D7%A1%D7%99%D7%9D%20%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D" target="_blank" rel="noopener" aria-label="וואטסאפ" data-cta="whatsapp_float"><svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path fill="#fff" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2m.01 1.67c4.54 0 8.23 3.7 8.23 8.24 0 4.54-3.69 8.23-8.23 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.32a8.2 8.2 0 0 1-1.26-4.38c.01-4.54 3.7-8.23 8.24-8.23M8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.86-.87 2.07 0 1.22.89 2.39 1 2.56.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.27-.25-.14-1.47-.74-1.69-.82-.23-.08-.37-.12-.56.12-.16.25-.64.81-.78.97-.15.17-.29.19-.53.07-.26-.13-1.06-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.12-.24-.01-.39.11-.5.11-.11.27-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.11-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43-.14 0-.3-.01-.47-.01"/></svg></a>');
            }
            el.parentNode.removeChild(el);
        } else {
            el.outerHTML = html;
        }
    }

    // Wait for DOM
    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        // סקין 2026: גופנים (Suez One + Assistant) + ערכת הליקוויד-גלאס — נטענים לכל דפי הבלוג
        if (!document.querySelector('link[href="/blog/theme-2026.css"]')) {
            var fonts = document.createElement('link');
            fonts.rel = 'stylesheet';
            fonts.href = 'https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800&family=Suez+One&display=swap';
            document.head.appendChild(fonts);
            var theme = document.createElement('link');
            theme.rel = 'stylesheet';
            theme.href = '/blog/theme-2026.css';
            document.head.appendChild(theme);
            var menuCss = document.createElement('link');
            menuCss.rel = 'stylesheet';
            menuCss.href = '/blog/menu-2026.css';
            document.head.appendChild(menuCss);
        }
        // הסוכן של AI Lab מלווה את כל דפי הבלוג
        if (!document.querySelector('script[src="/agent-widget.js"]')) {
            var agw = document.createElement('script');
            agw.src = '/agent-widget.js';
            agw.defer = true;
            document.head.appendChild(agw);
        }

        // Replace placeholders with real markup
        var navSlot = document.getElementById('shared-nav');
        if (navSlot) navSlot.outerHTML = navHTML + popupHTML;

        var footerSlot = document.getElementById('shared-footer');
        if (footerSlot) footerSlot.outerHTML = footerHTML;

        var ctaSlot = document.getElementById('shared-cta');
        if (ctaSlot) {
            var slug = ctaSlot.getAttribute('data-article') || 'unknown';
            ctaSlot.outerHTML = leadFormHTML(slug);
        }

        // חיווט תפריט המובייל — זהה לאתר הראשי: מחלקה menu-open על ה-body
        var burger = document.getElementById('burger');
        var mobileMenu = document.getElementById('mobileMenu');
        if (burger && mobileMenu) {
            burger.addEventListener('click', function () {
                document.body.classList.toggle('menu-open');
            });
            mobileMenu.querySelectorAll('a').forEach(function (a) {
                a.addEventListener('click', function () { document.body.classList.remove('menu-open'); });
            });
            // היהלום בתפריט פותח את הסוכן (agent-widget.js) וסוגר את התפריט
            var gemBtn = document.getElementById('menuAgentBtn');
            if (gemBtn) gemBtn.addEventListener('click', function () {
                document.body.classList.remove('menu-open');
                var orb = document.getElementById('agwOrb');
                if (orb) orb.click();
            });
        }

        // Nav scroll background
        var navbar = document.getElementById('navbar');
        if (navbar) {
            window.addEventListener('scroll', function () {
                if (window.scrollY > 20) navbar.classList.add('scrolled');
                else navbar.classList.remove('scrolled');
            }, { passive: true });
        }
    });

    // ---------- GLOBAL HELPERS ----------
    // תאימות לאחור: דפים ישנים עדיין קוראים לפונקציות האלה
    window.openMobileMenu  = function () { document.body.classList.add('menu-open'); };
    window.closeMobileMenu = function () { document.body.classList.remove('menu-open'); };

    window.openRegisterPopup = function () {
        var p = document.getElementById('registerPopup');
        if (p) p.classList.add('popup-visible');
        if (window.gtag) gtag('event', 'register_popup_open', { event_category: 'engagement', event_label: 'blog' });
    };

    window.closeRegisterPopup = function () {
        var p = document.getElementById('registerPopup');
        if (p) p.classList.remove('popup-visible');
    };

    window.submitFormPopup = async function (e) {
        e.preventDefault();
        var form = document.getElementById('contactFormPopup');
        var btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'שולח...';
        try {
            var data = new FormData(form);
            var res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
            if (res.ok) {
                if (window.gtag) {
                    gtag('event', 'generate_lead', { event_category: 'contact_form', event_label: 'blog_popup' });
                    gtag('event', 'conversion', { 'send_to': 'AW-18061574299/CQ1VCKW-_5QcEJuBt6RD' });
                }
                form.innerHTML = '<div style="text-align:center;padding:2rem;font-size:1.1rem;color:var(--accent);font-weight:700;">הפנייה נשלחה בהצלחה! נחזור אליכם בהקדם.</div>';
            } else {
                btn.disabled = false;
                btn.textContent = 'שלח פנייה';
                alert('שגיאה בשליחה. נסו שוב או שלחו בוואטסאפ.');
            }
        } catch (err) {
            btn.disabled = false;
            btn.textContent = 'שלח פנייה';
            alert('שגיאה בשליחה. נסו שוב או שלחו בוואטסאפ.');
        }
        return false;
    };

    window.sendWhatsAppPopup = function () {
        var name = document.getElementById('namePopup').value.trim();
        var phone = document.getElementById('phonePopup').value.trim();
        var email = document.getElementById('emailPopup').value.trim();
        if (!name || !phone || !email) {
            alert('נא למלא את כל השדות');
            return;
        }
        var msg = 'היי, אני מתעניין/ת בקורס יזמות ו-AI\n\nשם: ' + name + '\nטלפון: ' + phone + '\nאימייל: ' + email;
        if (window.gtag) {
            gtag('event', 'whatsapp_click', { event_category: 'contact', event_label: 'blog_popup' });
            gtag('event', 'conversion', { 'send_to': 'AW-18061574299/CQ1VCKW-_5QcEJuBt6RD' });
        }
        window.open('https://wa.me/972546500794?text=' + encodeURIComponent(msg), '_blank');
    };

    // Lead form (in-article CTA)
    window.submitLeadForm = async function (e) {
        e.preventDefault();
        var form = document.getElementById('leadFormArticle');
        var btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'שולח...';
        try {
            var data = new FormData(form);
            var res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
            if (res.ok) {
                if (window.gtag) {
                    gtag('event', 'generate_lead', { event_category: 'contact_form', event_label: 'blog_article' });
                    gtag('event', 'conversion', { 'send_to': 'AW-18061574299/CQ1VCKW-_5QcEJuBt6RD' });
                }
                form.innerHTML = '<div style="text-align:center;padding:2rem;font-size:1.1rem;color:var(--accent);font-weight:700;">תודה! קיבלנו את הפנייה ונחזור אליכם בהקדם.</div>';
            } else {
                btn.disabled = false;
                btn.textContent = 'שלח פנייה';
                alert('שגיאה בשליחה. נסו שוב או שלחו בוואטסאפ.');
            }
        } catch (err) {
            btn.disabled = false;
            btn.textContent = 'שלח פנייה';
            alert('שגיאה בשליחה. נסו שוב או שלחו בוואטסאפ.');
        }
        return false;
    };

    window.sendLeadWhatsApp = function () {
        var name = document.getElementById('leadName').value.trim();
        var phone = document.getElementById('leadPhone').value.trim();
        var email = document.getElementById('leadEmail').value.trim();
        if (!name || !phone || !email) {
            alert('נא למלא את כל השדות');
            return;
        }
        var article = '';
        var slot = document.querySelector('input[name="source"][value^="blog_article:"]');
        if (slot) article = slot.value.replace('blog_article:', '');
        var msg = 'היי, קראתי את המאמר "' + article + '" ואשמח לשמוע עוד על הקורס\n\nשם: ' + name + '\nטלפון: ' + phone + '\nאימייל: ' + email;
        if (window.gtag) {
            gtag('event', 'whatsapp_click', { event_category: 'contact', event_label: 'blog_article' });
            gtag('event', 'conversion', { 'send_to': 'AW-18061574299/CQ1VCKW-_5QcEJuBt6RD' });
        }
        window.open('https://wa.me/972546500794?text=' + encodeURIComponent(msg), '_blank');
    };
})();


// ===== מדידת לחיצות ל-Google Analytics (08.09.2026): כפתורים וקישורים משמעותיים → אירוע cta_click =====
(function ctaTracking(){
    const SEL = 'a.btn, button.btn, .cta-btn, .btn-submit, .blog-card, .back-link, .footer-social a, .nav-cta, .nav-links a, .mobile-menu-links a, a[href*="my.ai-lab.co.il"], a[href*="wa.me"], a[href*="discord.gg"], a[href*="chat.whatsapp.com"], a[href*="tel:"], a[href*="mailto:"], [data-track]';
    document.addEventListener('click', e => {
        const el = e.target && e.target.closest ? e.target.closest(SEL) : null;
        if (!el || typeof gtag !== 'function') return;
        const label = (el.dataset.track || el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
        const section = el.closest('article') ? 'article' : el.closest('#shared-cta') ? 'cta' : el.closest('footer, #shared-footer') ? 'footer' : el.closest('nav, #shared-nav') ? 'nav' : 'page';
        gtag('event', 'cta_click', { cta_label: label || '(ללא טקסט)', cta_section: 'blog:' + section, cta_href: (el.getAttribute('href') || '').slice(0, 100), transport_type: 'beacon' });
    }, true);
})();
