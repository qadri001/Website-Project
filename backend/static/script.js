let allProducts = [];
let cart = [];
let currentCategory = "All";
let currentPaymentMethod = 'cod';
let currentUser = null;
let placedOrders = [];

// ==================== Hero Slideshow ====================
let heroIndex = 0;
let heroTimer;

function initHero() {
    const slides = document.querySelectorAll('.hero-slide');
    const dotsEl = document.getElementById('hero-dots');
    slides.forEach((_, i) => {
        const d = document.createElement('span');
        d.className = 'hero-dot' + (i === 0 ? ' active' : '');
        d.onclick = () => goToSlide(i);
        dotsEl.appendChild(d);
    });
    startHeroTimer();
}

function startHeroTimer() {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => slideHero(1), 4500);
}

function slideHero(dir) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots   = document.querySelectorAll('.hero-dot');
    slides[heroIndex].classList.remove('active');
    dots[heroIndex].classList.remove('active');
    heroIndex = (heroIndex + dir + slides.length) % slides.length;
    slides[heroIndex].classList.add('active');
    dots[heroIndex].classList.add('active');
    startHeroTimer();
}

function goToSlide(i) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots   = document.querySelectorAll('.hero-dot');
    slides[heroIndex].classList.remove('active');
    dots[heroIndex].classList.remove('active');
    heroIndex = i;
    slides[heroIndex].classList.add('active');
    dots[heroIndex].classList.add('active');
    startHeroTimer();
}

// ==================== Auth State ====================
function setLoggedIn(name, email) {
    currentUser = { name, email };
    document.getElementById('auth-btn').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'inline-block';
    const greet = document.getElementById('user-greeting');
    greet.textContent = 'Hi, ' + name.split(' ')[0] + '!';
    greet.style.display = 'inline';
    document.getElementById('order-fullname').value = name;
    document.getElementById('order-email').value = email;
}

function logoutUser() {
    currentUser = null;
    placedOrders = [];
    document.getElementById('auth-btn').style.display = 'inline-block';
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('user-greeting').style.display = 'none';
    updateOrdersBadge();
}

// ==================== Load Products ====================
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/products')
        .then(res => res.json())
        .then(data => { allProducts = data; renderProducts(allProducts); })
        .catch(err => console.error("Fetch error:", err));
    initHero();
    // Activate first slide
    const firstSlide = document.querySelector('.hero-slide');
    if (firstSlide) firstSlide.classList.add('active');
});

// ==================== Category Filter ====================
function filterByCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.category === category) item.classList.add('active');
    });
    // Clear navbar search when switching categories
    const searchEl = document.getElementById('search-input');
    if (searchEl) searchEl.value = '';
    renderProducts(category === "All" ? allProducts
        : allProducts.filter(p => p.name.toLowerCase().includes(category.toLowerCase())));
}

// ==================== Render Products ====================
function renderProducts(products) {
    // Update sidebar category counts
    const categories = ['All','Laptop','Mobile','Watch','Earbuds','Power Bank','Tablet','Camera'];
    categories.forEach(cat => {
        const el = document.getElementById('cnt-' + cat);
        if (el) {
            const count = cat === 'All' ? allProducts.length
                : allProducts.filter(p => p.name.toLowerCase().includes(cat.toLowerCase())).length;
            el.textContent = count;
        }
    });

    // Update product count badge
    const badge = document.getElementById('product-count-badge');
    if (badge) badge.textContent = products.length + ' Product' + (products.length !== 1 ? 's' : '');

    if (products.length === 0) {
        document.getElementById('product-list').innerHTML = '<div style="text-align:center; padding:60px 20px; color:#888; grid-column:1/-1;"><div style="font-size:3rem; margin-bottom:12px;">🔍</div><p style="font-size:1.1rem; font-weight:600;">No products found</p><p style="font-size:0.9rem; margin-top:6px;">Try a different search or category</p></div>';
        return;
    }

    document.getElementById('product-list').innerHTML = products.map(p => `
        <div class="product-card">
            <div class="img-container">
                <img src="${p.image}" onerror="this.src='https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400';" alt="${p.name}">
                <div class="card-overlay-badge">In Stock ✓</div>
            </div>
            <div class="product-info">
                <h4>${p.name}</h4>
                <div style="display:flex; align-items:center; gap:6px; margin:4px 0;">
                    <span style="color:#f59e0b; font-size:0.8rem;">★★★★★</span>
                    <span style="font-size:0.75rem; color:#888;">(${Math.floor(Math.random()*180+20)} reviews)</span>
                </div>
                <p style="color:var(--order-orange); font-weight:800; font-size:1.15rem; margin:6px 0;">Rs. ${p.price.toLocaleString()}</p>
                <div class="card-btns">
                    <button class="add-btn" onclick="addToCart(${p.id})">&#128722; Add to Cart</button>
                </div>
            </div>
        </div>
    `).join('');
}

// ==================== Cart ====================
function addToCart(id) {
    const product = allProducts.find(p => p.id === id);
    if (product) { cart.push({...product, cartId: Date.now() + Math.random()}); updateUI(); showToast(product.name + ' added to cart!'); }
}

function removeFromCart(cartId) {
    cart = cart.filter(item => item.cartId !== cartId);
    updateUI();
}

function updateUI() {
    document.getElementById('cart-badge').innerText = cart.length;
    const list = document.getElementById('cart-items-list');
    list.innerHTML = cart.length === 0
        ? "<p style='padding:20px; color:#666;'>Your cart is empty.</p>"
        : cart.map(item => `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid #eee;">
                <span>${item.name}</span>
                <span style="font-weight:bold; color:var(--navy);">Rs. ${item.price.toLocaleString()}
                    <b onclick="removeFromCart(${item.cartId})" style="color:red; cursor:pointer; margin-left:10px; font-size:1.1rem;">&times;</b>
                </span>
            </div>`).join('');
    document.getElementById('pop-total-items').innerText = cart.length;
    document.getElementById('pop-total-price').innerText = `Rs. ${cart.reduce((s,i) => s+i.price, 0).toLocaleString()}`;
}

// ==================== Toast ====================
function showToast(msg) {
    let t = document.getElementById('pk-toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'pk-toast';
        t.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#001f3f;color:white;padding:12px 24px;border-radius:30px;font-size:0.95rem;z-index:9999;opacity:0;transition:opacity 0.3s;pointer-events:none;box-shadow:0 4px 15px rgba(0,0,0,0.3);white-space:nowrap;';
        document.body.appendChild(t);
    }
    t.textContent = msg; t.style.opacity = '1';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity = '0'; }, 2400);
}

// ==================== Modals ====================
function toggle(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = (el.style.display === 'none' || el.style.display === '') ? 'flex' : 'none';
}

function searchProducts() {
    const term = document.getElementById('search-input').value.toLowerCase();
    let f = allProducts.filter(p => p.name.toLowerCase().includes(term));
    if (currentCategory !== "All") f = f.filter(p => p.name.toLowerCase().includes(currentCategory.toLowerCase()));
    renderProducts(f);
}


// ==================== Checkout ====================
function showOrderSummary() {
    if (cart.length === 0) return showToast('Your cart is empty!');
    if (!currentUser) { toggle('cart-pop'); toggle('login-required-pop'); return; }
    const total = cart.reduce((s,i) => s+i.price, 0);
    document.getElementById('summary-total-items').innerText = cart.length;
    document.getElementById('summary-total-price').innerText = `Rs. ${total.toLocaleString()}`;
    document.getElementById('order-fullname').value = currentUser.name;
    document.getElementById('order-email').value = currentUser.email;
    toggle('cart-pop');
    toggle('order-summary-pop');
}

// ==================== Payment Method Toggle ====================
function selectPayment(method) {
    currentPaymentMethod = method;
    document.querySelectorAll('input[name="payment"]').forEach(r => r.checked = (r.value === method));
    document.getElementById('stripe-section').style.display    = method === 'stripe'    ? 'block' : 'none';
    document.getElementById('jazzcash-section').style.display  = method === 'jazzcash'  ? 'block' : 'none';
    document.getElementById('easypaisa-section').style.display = method === 'easypaisa' ? 'block' : 'none';
}

// ==================== Card Formatting ====================
function formatCardNumber(input) {
    let val = input.value.replace(/\D/g,'').substring(0,16);
    input.value = val.replace(/(.{4})/g,'$1 ').trim();
    detectCardType(val);
}
function formatExpiry(input) {
    let val = input.value.replace(/\D/g,'').substring(0,4);
    if (val.length >= 3) val = val.substring(0,2) + ' / ' + val.substring(2);
    input.value = val;
}
function detectCardType(num) {
    const d = document.getElementById('card-type-icon');
    if (!d) return; d.innerHTML = '';
    if (num.startsWith('4')) d.innerHTML = `<svg width="36" height="22" viewBox="0 0 48 30" xmlns="http://www.w3.org/2000/svg" style="border-radius:4px;border:1px solid #ddd;"><rect width="48" height="30" rx="3" fill="#1A1F71"/><text x="5" y="21" font-family="Arial" font-size="14" font-weight="900" fill="white" font-style="italic">VISA</text></svg>`;
    else if (/^5[1-5]/.test(num)||/^2[2-7]/.test(num)) d.innerHTML = `<svg width="36" height="22" viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg" style="border-radius:4px;border:1px solid #ddd;"><rect width="44" height="30" rx="3" fill="#252525"/><circle cx="16" cy="15" r="9" fill="#EB001B"/><circle cx="28" cy="15" r="9" fill="#F79E1B"/><path d="M22 7.5a9 9 0 0 1 0 15A9 9 0 0 1 22 7.5z" fill="#FF5F00"/></svg>`;
}
function validateCard() {
    const num=document.getElementById('card-number').value.replace(/\s/g,'');
    const exp=document.getElementById('card-expiry').value;
    const cvv=document.getElementById('card-cvv').value;
    const name=document.getElementById('card-name').value.trim();
    if (num.length < 13 || num.length > 16) return setCardError('Please enter a valid card number.');
    if (!exp.match(/^\d{2} \/ \d{2}$/)) return setCardError('Please enter expiry as MM / YY.');
    if (cvv.length < 3) return setCardError('Please enter a valid CVV code.');
    if (!name) return setCardError('Please enter the name on card.');
    let sum=0,alt=false;
    for (let i=num.length-1;i>=0;i--) { let n=parseInt(num[i]); if(alt){n*=2;if(n>9)n-=9;} sum+=n; alt=!alt; }
    if (sum%10!==0) return setCardError('Card number is invalid. Please check and try again.');
    document.getElementById('card-errors').style.display='none';
    return true;
}
function setCardError(msg) {
    const e=document.getElementById('card-errors');
    e.textContent=msg; e.style.display='block'; return false;
}

// ==================== Place Order ====================
async function confirmOrder() {
    if (!currentUser) { toggle('order-summary-pop'); toggle('login-required-pop'); return; }
    const fullname = document.getElementById('order-fullname').value.trim();
    const email    = document.getElementById('order-email').value.trim();
    const mobile   = document.getElementById('order-mobile').value.trim();
    const address  = document.getElementById('order-address').value.trim();
    if (!fullname || !email || !mobile || !address) return showToast('Please fill in all required fields.');

    const total   = cart.reduce((s,i) => s+i.price, 0);
    const items   = cart.map(i => ({id:i.id, name:i.name, price:i.price}));
    const payload = { fullname, email, mobile, address, total, items };
    const method  = document.querySelector('input[name="payment"]:checked').value;

    if (method === 'stripe') {
        if (!validateCard()) return;
        payload.card_number = document.getElementById('card-number').value.replace(/\s/g,'');
        payload.card_expiry = document.getElementById('card-expiry').value;
        payload.card_cvv    = document.getElementById('card-cvv').value;
        payload.card_name   = document.getElementById('card-name').value.trim();
    }
    if (method === 'jazzcash') {
        const jm = document.getElementById('jazzcash-mobile').value.trim();
        if (!jm) return showToast('Please enter your JazzCash mobile number.');
        payload.mobile = jm;
    }
    if (method === 'easypaisa') {
        const em = document.getElementById('easypaisa-mobile').value.trim();
        if (!em) return showToast('Please enter your EasyPaisa mobile number.');
        payload.mobile = em;
    }

    setLoading(true);
    try {
        if (method === 'cod')            await placeCOD(payload);
        else if (method === 'stripe')    await placeStripe(payload);
        else if (method === 'jazzcash')  await placeJazzCash(payload);
        else if (method === 'easypaisa') await placeEasyPaisa(payload);
    } catch(err) { showToast('Error: ' + err.message); }
    finally { setLoading(false); }
}

function setLoading(on) {
    document.getElementById('pay-btn').disabled = on;
    document.getElementById('pay-spinner').style.display = on ? 'block' : 'none';
    document.getElementById('pay-btn').style.opacity = on ? '0.6' : '1';
}

async function placeCOD(payload) {
    const res  = await fetch('/api/pay/cod', {method:'POST', headers:jsonHeaders(), body:JSON.stringify(payload)});
    const data = await res.json();
    if (data.success) showSuccess(data.order_ref, 'Order placed! Pay cash on delivery.', 'Cash on Delivery', payload);
    else showToast(data.message);
}
async function placeStripe(payload) {
    const res  = await fetch('/api/pay/stripe', {method:'POST', headers:jsonHeaders(), body:JSON.stringify(payload)});
    const data = await res.json();
    if (data.success) showSuccess(data.order_ref, 'Card payment successful!', 'Visa/Mastercard', payload);
    else showToast('Payment: ' + (data.message || 'failed'));
}
async function placeJazzCash(payload) {
    const res  = await fetch('/api/pay/jazzcash', {method:'POST', headers:jsonHeaders(), body:JSON.stringify(payload)});
    const data = await res.json();
    if (data.success) showSuccess(data.order_ref, 'JazzCash payment approved!', 'JazzCash', payload);
    else showToast('JazzCash: ' + (data.message || 'Payment failed.'));
}
async function placeEasyPaisa(payload) {
    const res  = await fetch('/api/pay/easypaisa', {method:'POST', headers:jsonHeaders(), body:JSON.stringify(payload)});
    const data = await res.json();
    if (data.success) showSuccess(data.order_ref, 'EasyPaisa request sent! Approve on your phone.', 'EasyPaisa', payload);
    else showToast('EasyPaisa: ' + (data.message || 'Payment failed.'));
}

// ==================== Orders Badge + Modal ====================
function updateOrdersBadge() {
    const badge = document.getElementById('orders-tab-badge');
    if (placedOrders.length > 0) { badge.textContent = placedOrders.length; badge.style.display = 'flex'; }
    else badge.style.display = 'none';
}

function renderOrdersModal() {
    const el = document.getElementById('orders-modal-list');
    if (!currentUser || placedOrders.length === 0) {
        el.innerHTML = '<p style="color:#888; text-align:center; padding:30px 0;">No orders yet. Start shopping!</p>';
        return;
    }
    el.innerHTML = placedOrders.map(o => `
        <div style="background:#f8faff; border:1px solid #dde; border-radius:12px; padding:16px; margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-weight:800; color:var(--navy); font-size:1rem; letter-spacing:0.5px;">${o.ref}</span>
                <span style="font-size:0.78rem; background:#e8f0fe; color:#1a73e8; padding:3px 10px; border-radius:20px; font-weight:600;">${o.method}</span>
            </div>
            <p style="font-size:0.82rem; color:#888; margin-bottom:8px;">&#128337; ${o.date}</p>
            <div style="border-top:1px solid #eee; padding-top:8px; margin-bottom:8px;">
                ${o.items.map(i => `<div style="display:flex; justify-content:space-between; font-size:0.88rem; margin-bottom:3px; color:#444;"><span>&#8226; ${i.name}</span><span style="font-weight:600;">Rs. ${i.price.toLocaleString()}</span></div>`).join('')}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:0.88rem; color:#555;">${o.items.length} item(s)</span>
                <span style="font-weight:800; color:var(--order-orange); font-size:1.1rem;">Rs. ${o.total.toLocaleString()}</span>
            </div>
        </div>
    `).join('');
}

// Override toggle for orders-pop to also render
const _origToggle = toggle;
function toggle(id) {
    if (id === 'orders-pop') renderOrdersModal();
    const el = document.getElementById(id);
    if (el) el.style.display = (el.style.display === 'none' || el.style.display === '') ? 'flex' : 'none';
}

// ==================== Success ====================
function showSuccess(orderRef, message, paymentMethod, payload) {
    placedOrders.unshift({
        ref: orderRef, message, method: paymentMethod,
        total: payload.total, items: payload.items,
        date: new Date().toLocaleString('en-PK', {dateStyle:'medium', timeStyle:'short'})
    });
    updateOrdersBadge();
    cart = []; updateUI();
    toggle('order-summary-pop');
    document.getElementById('success-message').innerText   = message;
    document.getElementById('success-order-ref').innerText = orderRef;
    toggle('success-pop');
}
function closeSuccess() { toggle('success-pop'); }

// ==================== Auth ====================
let isLogin = true;
function toggleAuthMode() {
    isLogin = !isLogin;
    document.getElementById('auth-title').innerText = isLogin ? 'Login to PK Mart' : 'Create Account';
    document.getElementById('reg-name').style.display = isLogin ? 'none' : 'block';
    document.getElementById('toggle-msg').innerText = isLogin ? 'New here? Create Account' : 'Already have an account? Login';
}
function processAuth() {
    const email = document.getElementById('auth-email').value.trim();
    const pass  = document.getElementById('auth-pass').value.trim();
    if (!email || !pass) return showToast('Please enter email and password.');
    if (isLogin) {
        fetch('/api/login', {method:'POST', headers:jsonHeaders(), body:JSON.stringify({email, password:pass})})
            .then(r=>r.json()).then(d => {
                showToast(d.message);
                if (d.success) {
                    toggle('auth-pop');
                    const name = d.message.replace('Welcome ','').replace('!','') || email.split('@')[0];
                    setLoggedIn(name, email);
                }
            });
    } else {
        const name = document.getElementById('reg-name').value.trim();
        if (!name) return showToast('Please enter your full name.');
        fetch('/api/signup', {method:'POST', headers:jsonHeaders(), body:JSON.stringify({name, email, password:pass})})
            .then(r=>r.json()).then(d => { showToast(d.message); if (d.success) toggleAuthMode(); });
    }
}
function jsonHeaders() { return {'Content-Type':'application/json'}; }

/* ── Send Message Form ── */
function sendMessage() {
    const name    = (document.getElementById('msg-name')?.value || '').trim();
    const contact = (document.getElementById('msg-contact')?.value || '').trim();
    const subject = (document.getElementById('msg-subject')?.value || '').trim();
    const body    = (document.getElementById('msg-body')?.value || '').trim();
    const fb      = document.getElementById('msg-feedback');

    if (!name || !contact || !body) {
        fb.style.display = 'block';
        fb.style.color = '#e63946';
        fb.textContent = '⚠️ Please fill in your name, contact, and message.';
        return;
    }

    // Build WhatsApp message
    const waText = encodeURIComponent(
        `Hello PK Mart!\n\nName: ${name}\nContact: ${contact}\nSubject: ${subject || 'General Inquiry'}\n\nMessage:\n${body}`
    );
    window.open(`https://wa.me/923014254060?text=${waText}`, '_blank');

    fb.style.display = 'block';
    fb.style.color = '#059669';
    fb.textContent = '✅ Opening WhatsApp with your message…';

    // Reset form
    setTimeout(() => {
        ['msg-name','msg-contact','msg-subject','msg-body'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        fb.style.display = 'none';
    }, 3000);
}
