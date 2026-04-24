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

    // ---------- NAV HTML ----------
    var navHTML = ''
        + '<nav id="navbar">'
        + '  <a href="/" class="nav-logo">AI Lab</a>'
        + '  <ul class="nav-links nav-links-desktop">'
        + '    <li><a href="/blog/"' + (isBlogIndex ? ' class="active"' : '') + '>עולם ה-AI</a></li>'
        + '    <li><a href="/#about">על הקורס</a></li>'
        + '    <li><a href="/#program">תוכנית</a></li>'
        + '    <li><a href="/#tools">כלי AI</a></li>'
        + '    <li><a href="/#pricing">מחיר</a></li>'
        + '    <li><a href="/mission.html">המשימה שלנו</a></li>'
        + '  </ul>'
        + '  <div class="nav-cta-group">'
        + '    <a href="#" onclick="event.preventDefault();openRegisterPopup();" class="nav-cta" style="background:linear-gradient(135deg,var(--accent),#00b894);">הרשמה</a>'
        + '    <a href="/webinar-general.html" class="nav-cta" style="background:linear-gradient(135deg,var(--accent),#00b894);">וובינר חינמי</a>'
        + '    <a href="https://chat.whatsapp.com/LpbKfD25gYF6Tx2K9Lj5WG?mode=hqctcli" target="_blank" rel="noopener" class="nav-cta" style="background:linear-gradient(135deg,var(--primary),var(--primary-light));" onclick="if(window.gtag)gtag(\'event\',\'whatsapp_community_click\',{event_category:\'community\',event_label:\'nav_join\'})">הצטרפו לקהילה</a>'
        + '    <a href="/portal/" class="nav-cta" style="background:transparent;border:1.5px solid rgba(255,255,255,0.28);">אזור אישי</a>'
        + '  </div>'
        + '  <button class="mobile-menu-btn" id="menuBtn" aria-label="תפריט">&#9776;</button>'
        + '</nav>'
        + '<div class="mobile-menu-panel" id="mobileMenuPanel">'
        + '  <div class="mobile-menu-header">'
        + '    <span class="mobile-menu-logo">AI Lab</span>'
        + '    <button class="mobile-close-btn" id="menuCloseBtn" aria-label="סגור תפריט">&times;</button>'
        + '  </div>'
        + '  <ul class="mobile-menu-links">'
        + '    <li><a href="/blog/"><span class="menu-icon">&#x1F30D;</span> עולם ה-AI</a></li>'
        + '    <li><a href="/#about"><span class="menu-icon">&#x1F4A1;</span> על הקורס</a></li>'
        + '    <li><a href="/#program"><span class="menu-icon">&#x1F4D6;</span> תוכנית</a></li>'
        + '    <li><a href="/#tools"><span class="menu-icon">&#x1F916;</span> כלי AI</a></li>'
        + '    <li><a href="/#pricing"><span class="menu-icon">&#x1F4B0;</span> מחיר</a></li>'
        + '    <li><a href="/mission.html"><span class="menu-icon">&#x2728;</span> המשימה שלנו</a></li>'
        + '    <li class="mobile-cta mobile-cta-green"><a href="#" onclick="event.preventDefault();closeMobileMenu();openRegisterPopup();">הרשמה</a></li>'
        + '    <li class="mobile-cta mobile-cta-green"><a href="/webinar-general.html">וובינר חינמי</a></li>'
        + '    <li class="mobile-cta"><a href="https://chat.whatsapp.com/LpbKfD25gYF6Tx2K9Lj5WG?mode=hqctcli" target="_blank" rel="noopener" style="background:linear-gradient(135deg,var(--primary),var(--primary-light));color:#fff;" onclick="if(window.gtag)gtag(\'event\',\'whatsapp_community_click\',{event_category:\'community\',event_label:\'mobile_nav_join\'})">הצטרפו לקהילה</a></li>'
        + '    <li class="mobile-cta"><a href="/portal/" style="background:transparent;border:1.5px solid rgba(255,255,255,0.28);color:#fff;">אזור אישי</a></li>'
        + '  </ul>'
        + '</div>'
        + '<div class="mobile-overlay" id="mobileOverlay"></div>';

    // ---------- REGISTER POPUP HTML ----------
    var popupHTML = ''
        + '<div id="registerPopup" class="scroll-popup-overlay" onclick="if(event.target===this)closeRegisterPopup()">'
        + '  <div class="scroll-popup-box">'
        + '    <button class="scroll-popup-close" onclick="closeRegisterPopup()" aria-label="סגור">&times;</button>'
        + '    <div class="scroll-popup-header">'
        + '      <div class="scroll-popup-icon">🚀</div>'
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
        + '      <p>קורסי יזמות ובינה מלאכותית לילדים, נוער ומבוגרים</p>'
        + '      <p>מאיר לביא</p>'
        + '    </div>'
        + '    <div class="footer-section">'
        + '      <h4>יצירת קשר</h4>'
        + '      <a href="tel:054-6500795">054-6500795</a>'
        + '      <a href="mailto:laviemb@gmail.com">laviemb@gmail.com</a>'
        + '      <a href="https://wa.me/972546500795" target="_blank" onclick="if(window.gtag)gtag(\'event\',\'whatsapp_click\',{event_category:\'contact\',event_label:\'footer_link\'})">WhatsApp</a>'
        + '    </div>'
        + '    <div class="footer-section">'
        + '      <h4>קהילה</h4>'
        + '      <a href="https://chat.whatsapp.com/LpbKfD25gYF6Tx2K9Lj5WG?mode=hqctcli" target="_blank" rel="noopener" style="color:#25D366;font-weight:600;" onclick="if(window.gtag)gtag(\'event\',\'whatsapp_community_click\',{event_category:\'community\',event_label:\'footer_join\'})">קבוצת הוואטסאפ</a>'
        + '      <span style="color:var(--text-muted);font-size:0.85rem;">עדכונים, טיפים יומיים וקהילה</span>'
        + '    </div>'
        + '    <div class="footer-section">'
        + '      <h4>מידע</h4>'
        + '      <a href="/blog/">עולם ה-AI</a>'
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
            + '    <p class="lead-form-phone">או התקשרו ישירות: <a href="tel:054-6500795">054-6500795</a></p>'
            + '  </div>'
            + '</section>';
    }

    // ---------- INJECT INTO PAGE ----------
    function inject(id, html, before) {
        var el = document.getElementById(id);
        if (!el) return;
        if (before) {
            el.insertAdjacentHTML('beforebegin', html);
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

        // Wire up mobile menu now that nav exists
        var menuBtn = document.getElementById('menuBtn');
        var mobilePanel = document.getElementById('mobileMenuPanel');
        var mobileOverlay = document.getElementById('mobileOverlay');
        var menuCloseBtn = document.getElementById('menuCloseBtn');

        if (menuBtn && mobilePanel && mobileOverlay) {
            menuBtn.addEventListener('click', function () {
                mobilePanel.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
            });
            if (menuCloseBtn) menuCloseBtn.addEventListener('click', closeMobileMenu);
            mobileOverlay.addEventListener('click', closeMobileMenu);
            document.querySelectorAll('.mobile-menu-links a').forEach(function (a) {
                a.addEventListener('click', closeMobileMenu);
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
    window.openMobileMenu = function () {
        var p = document.getElementById('mobileMenuPanel');
        var o = document.getElementById('mobileOverlay');
        var b = document.getElementById('menuBtn');
        if (p) p.classList.add('open');
        if (o) o.classList.add('active');
        if (b) b.innerHTML = '&times;';
        document.body.style.overflow = 'hidden';
    };

    window.closeMobileMenu = function () {
        var p = document.getElementById('mobileMenuPanel');
        var o = document.getElementById('mobileOverlay');
        var b = document.getElementById('menuBtn');
        if (p) p.classList.remove('open');
        if (o) o.classList.remove('active');
        if (b) b.innerHTML = '&#9776;';
        document.body.style.overflow = '';
    };

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
        window.open('https://wa.me/972546500795?text=' + encodeURIComponent(msg), '_blank');
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
        window.open('https://wa.me/972546500795?text=' + encodeURIComponent(msg), '_blank');
    };
})();
