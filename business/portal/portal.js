/* === AI Lab Business Portal — Shared Auth + Helpers === */

// TODO: Replace with the dedicated Business students sheet (separate from youth).
// For now, points to the same Sheets API key but a placeholder sheet — update when
// the business students sheet is created.
const BIZ_SHEET_ID = 'REPLACE_WITH_BUSINESS_SHEET_ID';
const BIZ_API_KEY = 'REPLACE_WITH_KEY_WHEN_NEEDED';
const BIZ_SHEET_RANGE = 'Sheet1!A:F';
const BIZ_RECHECK_HOURS = 24;
const STORAGE_KEY = 'biz_auth';

// Mock students used until the real Sheet is configured.
// Phone : { name, level, courses (array of slugs), passwordHash? }
const MOCK_STUDENTS = {
    '0546500795': { name: 'מאיר', level: 'admin', courses: ['websites', 'automation', 'assistant', 'content'] },
    '0500000001': { name: 'תלמיד דמו', level: 'student', courses: ['websites'] }
};

function normalizePhone(p) {
    if (!p) return '';
    p = String(p).replace(/[-\s\(\)]/g, '');
    if (p.startsWith('+972')) p = '0' + p.slice(4);
    if (p.startsWith('972')) p = '0' + p.slice(3);
    if (!p.startsWith('0') && p.length === 9) p = '0' + p;
    return p;
}

async function checkPhoneInSheet(phone) {
    phone = normalizePhone(phone);
    if (phone.length < 9 || phone.length > 11) {
        return { valid: false, reason: 'invalid' };
    }

    // If sheet not configured yet → fall back to mock list
    if (BIZ_SHEET_ID === 'REPLACE_WITH_BUSINESS_SHEET_ID') {
        const mock = MOCK_STUDENTS[phone];
        if (!mock) return { valid: false, reason: 'not_found' };
        return { valid: true, ...mock };
    }

    try {
        const url = 'https://sheets.googleapis.com/v4/spreadsheets/' + BIZ_SHEET_ID +
                    '/values/' + BIZ_SHEET_RANGE + '?key=' + BIZ_API_KEY;
        const res = await fetch(url);
        if (!res.ok) throw new Error('sheets api error');
        const data = await res.json();
        const rows = data.values || [];
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (normalizePhone(row[0] || '') === phone) {
                const expires = row[2] || '';
                if (expires && new Date(expires) < new Date()) {
                    return { valid: false, reason: 'expired' };
                }
                const courses = (row[3] || '').split(',').map(s => s.trim()).filter(Boolean);
                return {
                    valid: true,
                    name: row[1] || '',
                    level: row[4] || 'student',
                    courses: courses.length ? courses : ['websites'],
                    password: (row[5] || '').trim()
                };
            }
        }
        return { valid: false, reason: 'not_found' };
    } catch (e) {
        console.error('biz auth error:', e);
        return { valid: false, reason: 'error' };
    }
}

function saveAuth(phone, data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        phone: normalizePhone(phone),
        name: data.name,
        level: data.level,
        courses: data.courses || [],
        loginTime: Date.now()
    }));
}

function loadAuth() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
        const data = JSON.parse(raw);
        const hours = (Date.now() - data.loginTime) / 36e5;
        if (hours > BIZ_RECHECK_HOURS) return data;
        return data;
    } catch (e) {
        return null;
    }
}

function clearAuth() {
    localStorage.removeItem(STORAGE_KEY);
}

function logout() {
    clearAuth();
    window.location.href = '/business/portal/';
}

function requireAuth(redirectIfMissing = true) {
    const auth = loadAuth();
    if (!auth) {
        if (redirectIfMissing) window.location.href = '/business/portal/';
        return null;
    }
    return auth;
}

function hasCourseAccess(auth, courseSlug) {
    if (!auth) return false;
    if (auth.level === 'admin') return true;
    return (auth.courses || []).includes(courseSlug);
}

// Renders the topbar user widget into element with id="topbarUser".
function renderUserWidget(auth) {
    const el = document.getElementById('topbarUser');
    if (!el || !auth) return;
    const initial = (auth.name || '?').charAt(0);
    el.innerHTML = `
        <div class="avatar">${initial}</div>
        <span class="name">${auth.name || ''}</span>
        <button class="logout-btn" onclick="logout()">יציאה</button>
    `;
}

// Reveal-on-scroll
document.addEventListener('DOMContentLoaded', () => {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('shown'); });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
});
