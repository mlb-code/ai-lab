// ===== PRODUCT DATA =====
const products = [
  // BAGS
  {
    id: 32, category: 'bags', name: 'תיק אימון ותחרות למבוגרים',
    desc: 'תיק רכיבה למבוגרים — עמיד, מרווח ואיכותי, מתאים לאימונים ולתחרויות. מגיע בצבעים כחול וורוד.',
    price: 350, emoji: '🎒', badge: null,
    images: ['תמונות לאתר/ק.avif', 'תמונות לאתר/ר.avif'],
    colors: ['#1B3A6B', '#FF69B4'],
    imageFit: 'contain'
  },
  {
    id: 31, category: 'bags', name: 'תיק אימון ותחרות לילדים',
    desc: 'תיק רכיבה לילדים — עמיד, קל ומרווח, מתאים לאימונים ולתחרויות. מגיע בצבעים כחול וורוד.',
    price: 300, emoji: '🎒', badge: null,
    images: ['תמונות לאתר/א.avif', 'תמונות לאתר/ו.avif'],
    colors: ['#1B3A6B', '#FF69B4'],
    imageFit: 'contain'
  },
  // CARE
  {
    id: 30, category: 'care', name: 'סט טיפוח לסוס 5 חלקים',
    desc: 'סט טיפוח לסוסים הכולל 5 כלים איכותיים: מברשות, מסרק, גרדן ועוד — מושלם לטיפול יומיומי.',
    price: 200, emoji: '✨', badge: null,
    images: ['תמונות לאתר/3.avif', 'תמונות לאתר/4.avif'],
    imageFit: 'contain'
  },
  {
    id: 29, category: 'care', name: 'סט טיפוח לסוסים 10 חלקים',
    desc: 'סט טיפוח מקצועי לסוסים הכולל 10 כלים איכותיים: מברשות, מסרקים, גרדנים ועוד — הכל בתיק נשיאה נוח.',
    price: 300, emoji: '✨', badge: null,
    images: ['תמונות לאתר/תיק טיפוח1.avif', 'תמונות לאתר/תיר טיפוח2.avif'],
    imageFit: 'contain'
  },
  // JACKET
  {
    id: 28, category: 'jacket', name: "ג'קט תחרויות לגברים",
    desc: "ג'קט תחרויות לגברים באיכות גבוהה, עיצוב אלגנטי ומקצועי לתחרויות רכיבה.",
    price: 400, emoji: '🧥', badge: null,
    image: 'תמונות לאתר/9.avif',
    sizes: ['XS', 'S', 'M', 'L']
  },
  {
    id: 27, category: 'jacket', name: "ג'קט תחרויות לנשים",
    desc: "ג'קט תחרויות לנשים באיכות גבוהה, עיצוב אלגנטי ומקצועי לתחרויות רכיבה.",
    price: 400, emoji: '🧥', badge: null,
    image: 'תמונות לאתר/7.avif',
    sizes: ['S', 'M', 'L']
  },
  // BOOTS
  {
    id: 26, category: 'boots', name: 'ווסט מגן',
    desc: 'ווסט מגן איכותי לרכיבה, מספק הגנה מקסימלית לגוף העליון באימונים ותחרויות.',
    price: 350, emoji: '🛡️', badge: null,
    images: ['תמונות לאתר/אפוד מגן1.avif', 'תמונות לאתר/אפוד מגן2.avif'],
    sizes: ['S', 'M', 'L'],
    imageFit: 'contain'
  },
  // RIDER
  {
    id: 25, category: 'rider', name: 'חולצת רכיבה ארוכה',
    desc: 'חולצת רכיבה ארוכה מבד נושם ואיכותי, מתאימה לאימונים ותחרויות בכל עונה.',
    price: 200, emoji: '👕', badge: null,
    images: ['תמונות לאתר/1.avif', 'תמונות לאתר/2.avif'],
    imagePositions: ['center', 'bottom'],
    colors: ['#1a1a1a', '#ffffff'],
    sizes: ['XS', 'S', 'M', 'L']
  },
  {
    id: 24, category: 'rider', name: 'חולצת רכיבה קצרה',
    desc: 'חולצת רכיבה לנשים מבד נושם ומגן מפני שמש, מתאימה לאימונים ותחרויות.',
    price: 200, emoji: '👚', badge: null,
    images: ['תמונות לאתר/חולצת רכיבה שחורה.avif', 'תמונות לאתר/חולצת רכיבה לבנה.avif'],
    colors: ['#1a1a1a', '#ffffff'],
    sizes: ['S', 'M', 'L']
  },
  {
    id: 23, category: 'rider', name: 'כפפות רכיבה מעור נושם',
    desc: 'כפפות רכיבה מעור נושם איכותי עם חיזוק כף יד, מתאימות לאימונים ותחרויות.',
    price: 200, emoji: '🧤', badge: null,
    image: 'תמונות לאתר/כפפות רוכבים.avif',
    sizes: ['S', 'M', 'L']
  },
  {
    id: 22, category: 'rider', name: 'מכנסי רכיבה לגברים',
    desc: 'מכנסי רכיבה לגברים עם בטנת Grip פנימית לאחיזה מושלמת, בד נמתח ונוח לאימונים ותחרויות.',
    price: 200, emoji: '👖', badge: null,
    images: ['תמונות לאתר/מכנסי רכיבה לגברים כחול.avif', 'תמונות לאתר/מכנסי רכיבה לגברים אפור.avif', 'תמונות לאתר/פ.avif'],
    colors: ['#1B3A6B', '#808080', '#1a1a1a'],
    sizes: ['S', 'M', 'L']
  },
  {
    id: 21, category: 'rider', name: 'מכנסי רכיבה לנשים',
    desc: 'מכנסי רכיבה לנשים עם בטנת Grip פנימית לאחיזה מושלמת, בד נמתח ונוח לאימונים ותחרויות.',
    price: 200, emoji: '👖', badge: null,
    images: ['תמונות לאתר/מכנסי רכיבה 1.avif', 'תמונות לאתר/מכנסי רכיבה 2.avif', 'תמונות לאתר/מכנסי רוכבים שחורים.avif', 'תמונות לאתר/מכנסי רוכבים כחולים.avif'],
    colors: ['#1a1a1a', '#1B3A6B'],
    sizes: ['XS', 'S', 'M', 'L']
  },
  {
    id: 19, category: 'rider', name: 'קסדת רכיבה מקצועית – דגם Elite-Shield',
    desc: 'קסדת רכיבה מוסמכת CE לתחרויות ואימונים. מערכת הידוק מתכווננת.',
    price: 250, emoji: '👕', image: 'תמונות לאתר/קסדת רוכבים.avif', badge: 'בטיחות'
  },
];

// ===== STATE =====
let currentFilter = 'all';
let selectedProduct = null;
let cart = []; // [{product, qty}]

// ===== RENDER PRODUCTS =====
function renderProducts(filter) {
  const grid = document.getElementById('productsGrid');
  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);

  grid.innerHTML = '';
  grid.innerHTML = filtered.map(p => `
    <div class="product-card" onclick="openModal(${p.id})">
      <div class="product-img" id="card-img-${p.id}">
        ${p.images
          ? `<img src="${p.images[0]}" alt="${p.name}" loading="lazy" class="card-slide-img" data-images='${JSON.stringify(p.images)}' data-positions='${JSON.stringify(p.imagePositions || [])}' data-idx="0" style="width:100%;height:100%;object-fit:${p.imageFit||'cover'};object-position:${(p.imagePositions||[])[0]||'center'};" />`
          : p.image
            ? `<img src="${p.image}" alt="${p.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;" />`
            : `<span>${p.emoji}</span>`}
        ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
      </div>
      <div class="product-body">
        <div class="product-category">${getCategoryName(p.category)}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <div class="product-price">₪${p.price.toLocaleString()} <span>/ יחידה</span></div>
          <button class="order-btn" onclick="event.stopPropagation(); addToCart(${p.id})">+ עגלה</button>
        </div>
      </div>
    </div>
  `).join('');
  startSlideshows();
}

function getCategoryName(cat) {
  const names = {
    jacket: "ג'קט תחרויות", bags: 'תיקים לאימון',
    care: 'טיפוח',
    boots: 'אפוד מגן', rider: 'ציוד רוכב'
  };
  return names[cat] || cat;
}

// ===== FILTER =====
function filterProducts(cat) {
  currentFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    const map = { all:'הכל', jacket:"ג'קט תחרויות", bags:'תיקים לאימון', care:'טיפוח', boots:'אפוד מגן', rider:'ציוד רוכב' };
    if (btn.textContent === (map[cat] || cat)) btn.classList.add('active');
  });
  renderProducts(cat);

  // Scroll to products section
  document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== REVIEWS DATA =====
const reviewsPool = [
  { name: 'נועה כ.', stars: 5, text: 'מוצר מדהים! איכות מעולה, הגיע מהר והתאים בדיוק לציפיות שלי.' },
  { name: 'יוסי ל.', stars: 5, text: 'שירות אישי מצוין, ענו לי מהר בוואטסאפ ועזרו לי לבחור. ממליץ בחום!' },
  { name: 'מיכל ר.', stars: 5, text: 'קניתי כבר כמה פעמים מהחנות הזאת, תמיד מרוצה. המוצרים איכותיים מאוד.' },
  { name: 'דן ש.', stars: 5, text: 'הגיע מהר, אריזה מושלמת. הסוס שלי אוהב! בהחלט אחזור לקנות עוד.' },
  { name: 'שירה מ.', stars: 5, text: 'מחיר טוב לאיכות כזאת. השוויתי עם חנויות אחרות וזה הכי טוב שמצאתי.' },
  { name: 'אבי ג.', stars: 5, text: 'מגיע בדיוק כמו בתמונה, חזק ועמיד. עובד מצוין לאימונים.' },
  { name: 'לילה ב.', stars: 4, text: 'מוצר טוב מאוד, התאים לסוס שלי. המשלוח לקח יומיים בלבד!' },
  { name: 'רון ה.', stars: 5, text: 'פנייה ראשונה לחנות ובטוח לא אחרונה. שירות ומוצר ברמה גבוהה.' },
];

function getReviews(productId) {
  const start = (productId * 3) % reviewsPool.length;
  const picks = [];
  for (let i = 0; i < 4; i++) picks.push(reviewsPool[(start + i) % reviewsPool.length]);
  return picks;
}

function starsHtml(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

// ===== MODAL =====
function openModal(productId) {
  selectedProduct = products.find(p => p.id === productId);
  if (!selectedProduct) return;

  const p = selectedProduct;
  const reviews = getReviews(p.id);
  const avgRating = (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1);
  const totalReviews = 18 + (p.id * 7) % 40;

  const imgPositions = p.imagePositions || [];
  const imgHtml = p.images
    ? `<img src="${p.images[0]}" alt="${p.name}" class="pm-image" id="pmMainImg" style="object-position:${imgPositions[0]||'center'}" />
       <div class="pm-thumbs">
         ${p.images.map((src, i) => `<img src="${src}" class="pm-thumb ${i===0?'active':''}" style="object-position:${imgPositions[i]||'center'}" onclick="switchModalImg(this,'${src}','${imgPositions[i]||'center'}')" />`).join('')}
       </div>`
    : p.image
      ? `<img src="${p.image}" alt="${p.name}" class="pm-image" />`
      : `<div class="pm-emoji">${p.emoji}</div>`;

  const sizesHtml = p.sizes ? `
    <div class="pm-section">
      <div class="pm-label">בחר מידה:</div>
      <div class="pm-sizes">
        ${p.sizes.map((s, i) => `
          <button class="size-btn ${i === 0 ? 'selected' : ''}" onclick="selectSize(this)">${s}</button>
        `).join('')}
      </div>
    </div>` : '';

  const colorsHtml = p.colors ? `
    <div class="pm-section">
      <div class="pm-label">בחר צבע:</div>
      <div class="pm-colors" id="pmColors">
        ${p.colors.map((c, i) => `
          <button class="color-swatch ${i === 0 ? 'selected' : ''}"
            style="background:${c};${c === '#ffffff' ? 'border:2px solid #ccc;' : ''}"
            onclick="selectColor(this, '${c}')" title="${c}"></button>
        `).join('')}
      </div>
      <div class="pm-color-name" id="pmColorName">שחור</div>
    </div>` : '';

  const reviewsHtml = reviews.map(r => `
    <div class="pm-review">
      <div class="pm-review-header">
        <span class="pm-review-name">${r.name}</span>
        <span class="pm-review-stars">${starsHtml(r.stars)}</span>
      </div>
      <p class="pm-review-text">${r.text}</p>
    </div>
  `).join('');

  document.getElementById('productModalContent').innerHTML = `
    <div class="pm-img-wrap">
      ${imgHtml}
      ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
    </div>
    <div class="pm-body">
      <div class="pm-category">${getCategoryName(p.category)}</div>
      <h2 class="pm-name">${p.name}</h2>
      <div class="pm-rating">
        <span class="pm-stars">${starsHtml(5)}</span>
        <span class="pm-rating-num">${avgRating}</span>
        <span class="pm-rating-count">(${totalReviews} ביקורות)</span>
      </div>
      <div class="pm-price">₪${p.price.toLocaleString()} <span>/ יחידה</span></div>
      <div class="pm-section">
        <div class="pm-label">תיאור המוצר:</div>
        <p class="pm-desc">${p.desc}</p>
      </div>
      ${sizesHtml}
      ${colorsHtml}
      <div class="pm-qty-row">
        <div class="pm-label">כמות:</div>
        <div class="pm-qty-controls">
          <button class="qty-btn" onclick="pmChangeQty(-1)">−</button>
          <span class="qty-num" id="pmQty">1</span>
          <button class="qty-btn" onclick="pmChangeQty(1)">+</button>
        </div>
      </div>
      <button class="btn btn-primary btn-full" style="margin-top:16px;" onclick="addToCartFromModal()">🛒 הוסף לעגלה</button>
      <div class="pm-reviews-section">
        <h4 class="pm-reviews-title">ביקורות לקוחות ⭐</h4>
        ${reviewsHtml}
      </div>
    </div>
  `;

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

let pmQty = 1;
let pmSelectedColor = null;

function selectSize(btn) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function switchModalImg(thumb, src, position) {
  const main = document.getElementById('pmMainImg');
  main.src = src;
  main.style.objectPosition = position || 'center';
  document.querySelectorAll('.pm-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}

function pmChangeQty(delta) {
  pmQty = Math.max(1, pmQty + delta);
  document.getElementById('pmQty').textContent = pmQty;
}

function selectColor(btn, color) {
  document.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  pmSelectedColor = color;
  const names = { '#1a1a1a': 'שחור', '#8B0000': 'אדום כהה', '#1B3A6B': 'כחול נייבי', '#2d5a27': 'ירוק', '#ffffff': 'לבן', '#FF69B4': 'ורוד' };
  document.getElementById('pmColorName').textContent = names[color] || color;
}

function addToCartFromModal() {
  if (!selectedProduct) return;
  const existing = cart.find(i => i.product.id === selectedProduct.id);
  if (existing) existing.qty += pmQty;
  else cart.push({ product: selectedProduct, qty: pmQty });
  updateCartBadge();
  closeModal();
  showToast(`✅ ${selectedProduct.name} (${pmQty} יח׳) נוסף לעגלה`);
  pmQty = 1;
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  pmQty = 1;
}

// ===== CONTACT SUBMIT =====
function submitContact(e) {
  e.preventDefault();
  const inputs = e.target.querySelectorAll('input, textarea');
  const name = inputs[0].value.trim();
  const phone = inputs[1].value.trim();
  const message = inputs[2] ? inputs[2].value.trim() : '';

  let msg = `📩 *פנייה חדשה מ-HORSE FASHION*\n\n`;
  msg += `👤 שם: ${name}\n📞 טלפון: ${phone}`;
  if (message) msg += `\n\n💬 הודעה: ${message}`;

  window.open(`https://wa.me/972559139557?text=${encodeURIComponent(msg)}`, '_blank');
  showToast('✅ ההודעה נשלחה בוואטסאפ!');
  e.target.reset();
}

// ===== TOAST =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ===== CART =====
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(i => i.product.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ product, qty: 1 });
  }
  updateCartBadge();
  showToast('✅ ' + product.name + ' נוסף לעגלה');
}

function updateCartBadge() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById('cartBadge').textContent = total;
}

function openCart() {
  document.getElementById('cartOverlay').classList.add('open');
  document.getElementById('cartPanel').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCart();
}

function closeCart() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartPanel').classList.remove('open');
  document.body.style.overflow = '';
}

function renderCart() {
  const itemsEl = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmpty');
  const footerEl = document.getElementById('cartFooter');

  if (cart.length === 0) {
    itemsEl.innerHTML = '';
    emptyEl.style.display = 'flex';
    footerEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  footerEl.style.display = 'block';

  itemsEl.innerHTML = cart.map(({ product: p, qty }) => `
    <div class="cart-item">
      <div class="cart-item-emoji">${p.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${p.name}</div>
        <div class="cart-item-price">₪${(p.price * qty).toLocaleString()}</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty(${p.id}, -1)">−</button>
        <span class="qty-num">${qty}</span>
        <button class="qty-btn" onclick="changeQty(${p.id}, 1)">+</button>
        <button class="cart-item-remove" onclick="removeFromCart(${p.id})">🗑</button>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  document.getElementById('cartTotal').textContent = '₪' + total.toLocaleString();
}

function changeQty(productId, delta) {
  const item = cart.find(i => i.product.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(productId);
  else { updateCartBadge(); renderCart(); }
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.product.id !== productId);
  updateCartBadge();
  renderCart();
}

function submitCartOrder(e) {
  e.preventDefault();
  const name = document.getElementById('cartName').value.trim();
  const phone = document.getElementById('cartPhone').value.trim();
  const notes = document.getElementById('cartNotes').value.trim();
  if (!name || !phone) { alert('אנא מלא שם וטלפון'); return; }

  const itemsText = cart.map(i => `• ${i.product.name} x${i.qty} — ₪${(i.product.price * i.qty).toLocaleString()}`).join('\n');
  const total = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  let msg = `🛒 *הזמנה חדשה מ-HORSE FASHION*\n\n`;
  msg += `👤 שם: ${name}\n📞 טלפון: ${phone}\n\n`;
  msg += `*פריטים:*\n${itemsText}\n\n`;
  msg += `💰 סה"כ: ₪${total.toLocaleString()}`;
  if (notes) msg += `\n\n📝 הערות: ${notes}`;

  window.open(`https://wa.me/972559139557?text=${encodeURIComponent(msg)}`, '_blank');

  cart = [];
  updateCartBadge();
  closeCart();
  showToast('✅ ההזמנה נשלחה בוואטסאפ!');
}

// ===== MOBILE MENU =====
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('open');
}

// ===== SCROLL ANIMATIONS =====
function observeElements() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.feature-card, .category-card, .about-content, .contact-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ===== IMAGE SLIDESHOW =====
let slideshowIntervals = [];

function startSlideshows() {
  slideshowIntervals.forEach(clearInterval);
  slideshowIntervals = [];
  document.querySelectorAll('.card-slide-img').forEach(img => {
    const imgs = JSON.parse(img.dataset.images);
    const positions = JSON.parse(img.dataset.positions || '[]');
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % imgs.length;
      img.style.opacity = '0';
      setTimeout(() => {
        img.src = imgs[idx];
        img.style.objectPosition = positions[idx] || 'center';
        img.style.opacity = '1';
      }, 300);
    }, 2500);
    slideshowIntervals.push(interval);
  });
}

// ===== UPDATE CATEGORY COUNTS =====
function updateCategoryCounts() {
  ['jacket', 'bags', 'care', 'boots', 'rider'].forEach(cat => {
    const count = products.filter(p => p.category === cat).length;
    const el = document.getElementById('count-' + cat);
    if (el) el.textContent = count + ' מוצרים';
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderProducts('all');
  updateCategoryCounts();
  observeElements();
});
