// ============================================
// ОПРЕДЕЛЕНИЕ БАЗОВОГО ПУТИ ДЛЯ GITHUB PAGES
// ============================================
let BASE_PATH = '';

function initBasePath() {
    // Определяем, находимся ли мы в репозитории GitHub Pages
    const pathname = window.location.pathname;
    
    // Если путь начинается с /profreelance (или названия вашего репозитория)
    if (pathname.startsWith('/profreelance/') || pathname === '/profreelance') {
        BASE_PATH = '/profreelance';
    } else if (pathname.startsWith('/portfolio/') || pathname === '/portfolio') {
        BASE_PATH = '/portfolio';
    } else {
        BASE_PATH = '';
    }
    
    // Для локальной разработки
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        BASE_PATH = '';
    }
}

// Функция для получения правильного пути
function getCorrectPath(path) {
    if (path.startsWith('http')) return path;
    if (path.startsWith('#')) return path;
    if (BASE_PATH && !path.startsWith(BASE_PATH)) {
        return BASE_PATH + path;
    }
    return path;
}

// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================
let currentSlide = 0;
let slideInterval = null;
let cart = [];
let currentUser = null;

// Данные услуг для каталога
const servicesData = [
    { id: 1, name: 'Разработка сайта под ключ', category: 'web', price: 25000, rating: 4.9, deadline: 14, author: 'Алексей К.', authorAvatar: 'АК', tags: ['React', 'Vue'] },
    { id: 2, name: 'Дизайн лендинга', category: 'design', price: 15000, rating: 4.8, deadline: 7, author: 'Анна М.', authorAvatar: 'АМ', tags: ['Figma', 'UI/UX'] },
    { id: 3, name: 'SEO продвижение', category: 'seo', price: 20000, rating: 4.7, deadline: 30, author: 'Иван П.', authorAvatar: 'ИП', tags: ['SEO', 'Аналитика'] },
    { id: 4, name: 'Контекстная реклама', category: 'marketing', price: 18000, rating: 4.9, deadline: 7, author: 'Елена К.', authorAvatar: 'ЕК', tags: ['Яндекс.Директ', 'Google Ads'] },
    { id: 5, name: 'Копирайтинг статей', category: 'copywriting', price: 5000, rating: 4.6, deadline: 3, author: 'Мария С.', authorAvatar: 'МС', tags: ['SEO-тексты', 'Блоги'] },
    { id: 6, name: 'Разработка Telegram бота', category: 'web', price: 30000, rating: 5.0, deadline: 10, author: 'Дмитрий В.', authorAvatar: 'ДВ', tags: ['Python', 'Aiogram'] }
];

let currentServices = [...servicesData];
let visibleCount = 6;
let currentSort = 'default';
let currentFilters = { categories: [], priceMin: null, priceMax: null, ratings: [], deadlines: [] };

// ============================================
// АДМИН ПАНЕЛЬ: ПЕРЕМЕННЫЕ
// ============================================
let adminUsers = [];
let currentUserFilter = 'all';
let currentUserSearch = '';
let currentUserPage = 1;
const USERS_PER_PAGE = 5;

// ============================================
// ЗАГРУЗКА И СОХРАНЕНИЕ КОРЗИНЫ
// ============================================
function loadCart() {
    const savedCart = localStorage.getItem('profreelance_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            cart = [];
        }
    } else {
        cart = [];
    }
    updateCartBadge();
}

function saveCartToStorage() {
    localStorage.setItem('profreelance_cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const badges = document.querySelectorAll('.badge');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    badges.forEach(badge => {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    });
}

// ============================================
// ДОБАВЛЕНИЕ В КОРЗИНУ
// ============================================
function addToCart(service) {
    const existingItem = cart.find(item => item.id === service.id);

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({
            id: service.id,
            name: service.name,
            price: service.price,
            author: service.author || 'ProFreelance',
            quantity: 1
        });
    }

    saveCartToStorage();
    showNotification('Товар добавлен в корзину');
}

// ============================================
// ФУНКЦИИ ДЛЯ СТРАНИЦЫ КОРЗИНЫ
// ============================================
function formatPrice(price) {
    return price.toLocaleString('ru-RU') + ' ₽';
}

function getCartData() {
    return cart;
}

function saveCartData(cartData) {
    cart = cartData;
    saveCartToStorage();
}

function getServicesDataForCart() {
    return [
        { id: 1, name: 'Landing Page на React', author: 'Алексей К.', price: 15000, deadline: 7 },
        { id: 2, name: 'UI/UX дизайн в Figma', author: 'Мария С.', price: 25000, deadline: 14 },
        { id: 3, name: 'Таргетинг ВКонтакте', author: 'Ольга Л.', price: 12000, deadline: 30 },
        { id: 4, name: 'SEO-продвижение', author: 'Дмитрий В.', price: 8000, deadline: 30 },
        { id: 5, name: 'Монтаж видео', author: 'Никита И.', price: 5000, deadline: 5 },
        { id: 6, name: 'Разработка Telegram бота', author: 'Артем К.', price: 20000, deadline: 10 }
    ];
}

function getServiceByIdForCart(id, services) {
    return services.find(s => s.id === parseInt(id));
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function getCountWord(n) {
    if (n % 10 === 1 && n % 100 !== 11) return 'услуга';
    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'услуги';
    return 'услуг';
}

function updateCartCountDisplay() {
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) {
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCountEl.textContent = `${totalItems} ${getCountWord(totalItems)}`;
    }
}

function updatePromoFeedbackDisplay(promoCode) {
    const promoFeedback = document.getElementById('promoFeedback');
    if (!promoFeedback) return;

    if (promoCode === 'DISCOUNT10') {
        promoFeedback.innerHTML = '<i class="fas fa-check-circle"></i> Промокод DISCOUNT10 применён! Скидка 10%';
        promoFeedback.className = 'promo-feedback success';
    } else if (promoCode === 'DISCOUNT20') {
        promoFeedback.innerHTML = '<i class="fas fa-check-circle"></i> Промокод DISCOUNT20 применён! Скидка 20%';
        promoFeedback.className = 'promo-feedback success';
    } else {
        promoFeedback.innerHTML = '';
        promoFeedback.className = 'promo-feedback';
    }
}

function renderSummaryForCart() {
    const summaryItemsContainer = document.getElementById('summaryItems');
    const totalPriceEl = document.getElementById('totalPrice');

    if (!summaryItemsContainer) return;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    let discountPercent = 0;
    let discountAmount = 0;
    let promoCode = localStorage.getItem('promoCode');

    if (promoCode === 'DISCOUNT10') {
        discountPercent = 10;
        discountAmount = Math.round(subtotal * 0.1);
    } else if (promoCode === 'DISCOUNT20') {
        discountPercent = 20;
        discountAmount = Math.round(subtotal * 0.2);
    }

    const afterDiscount = subtotal - discountAmount;
    const fee = Math.round(afterDiscount * 0.05);
    const finalTotal = afterDiscount + fee;

    let summaryHtml = `
    <div class="summary-line summary-subtotal">
      <span>Товары (${cart.reduce((sum, item) => sum + (item.quantity || 1), 0)} шт.)</span>
      <span>${formatPrice(subtotal)}</span>
    </div>
  `;

    if (discountAmount > 0) {
        summaryHtml += `
      <div class="summary-line summary-discount">
        <span>Скидка (${discountPercent}%)</span>
        <span class="discount-amount">-${formatPrice(discountAmount)}</span>
      </div>
    `;
    }

    summaryHtml += `
    <div class="summary-line summary-fee">
      <span>Комиссия платформы (5%)</span>
      <span>${formatPrice(fee)}</span>
    </div>
  `;

    summaryItemsContainer.innerHTML = summaryHtml;

    if (totalPriceEl) {
        totalPriceEl.textContent = formatPrice(finalTotal);
    }

    updatePromoFeedbackDisplay(promoCode);
}

function renderCartPage() {
    const cartContainer = document.getElementById('cartItemsContainer');
    const emptyMsg = document.getElementById('emptyCartMessage');
    const summaryCard = document.getElementById('summaryCard');
    const services = getServicesDataForCart();

    if (!cartContainer) return;

    if (cart.length === 0) {
        if (emptyMsg) emptyMsg.classList.remove('hidden');
        if (summaryCard) summaryCard.classList.add('hidden');
        cartContainer.innerHTML = '';
        updateCartCountDisplay();
        renderRecommendationsForCart();
        return;
    }

    if (emptyMsg) emptyMsg.classList.add('hidden');
    if (summaryCard) summaryCard.classList.remove('hidden');

    let cartHtml = '<div class="cart-list">';

    cart.forEach(item => {
        const service = getServiceByIdForCart(item.id, services);
        const itemName = service ? service.name : item.name;
        const itemAuthor = service ? service.author : (item.author || 'ProFreelance');
        const quantity = item.quantity || 1;
        const totalPrice = item.price * quantity;
        const avatarLetter = itemAuthor.charAt(0);

        cartHtml += `
      <div class="cart-item" data-id="${item.id}">
        <div class="item-avatar" style="background:linear-gradient(135deg,#1a5ce5,#3593F2);">${escapeHtml(avatarLetter)}</div>
        <div class="item-info">
          <div class="item-title">${escapeHtml(itemName)}</div>
          <div class="item-author"><i class="fas fa-user"></i>${escapeHtml(itemAuthor)}</div>
          <div class="item-params">
            <span class="item-param"><i class="fas fa-clock"></i>${service && service.deadline ? service.deadline + ' дн.' : '—'}</span>
          </div>
        </div>
        <div class="item-right">
          <div class="item-price">${formatPrice(totalPrice)}</div>
          <div class="cart-quantity-controls">
            <button class="qty-btn qty-minus" data-id="${item.id}"><i class="fas fa-minus"></i></button>
            <span class="qty-value">${quantity}</span>
            <button class="qty-btn qty-plus" data-id="${item.id}"><i class="fas fa-plus"></i></button>
            <button class="item-delete" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>
      </div>
    `;
    });
    cartHtml += '</div>';
    cartContainer.innerHTML = cartHtml;

    renderSummaryForCart();
    attachCartItemHandlers();
    updateCartCountDisplay();
    updateCartBadge();
    renderRecommendationsForCart();
}

function attachCartItemHandlers() {
    document.querySelectorAll('.item-delete').forEach(btn => {
        btn.removeEventListener('click', handleDeleteClick);
        btn.addEventListener('click', handleDeleteClick);
    });

    document.querySelectorAll('.qty-minus').forEach(btn => {
        btn.removeEventListener('click', handleMinusClick);
        btn.addEventListener('click', handleMinusClick);
    });

    document.querySelectorAll('.qty-plus').forEach(btn => {
        btn.removeEventListener('click', handlePlusClick);
        btn.addEventListener('click', handlePlusClick);
    });
}

function handleDeleteClick(e) {
    e.stopPropagation();
    const id = parseInt(this.dataset.id);
    cart = cart.filter(item => item.id !== id);
    saveCartToStorage();
    renderCartPage();
    showNotificationForCart('Товар удалён из корзины');
}

function handleMinusClick(e) {
    e.stopPropagation();
    const id = parseInt(this.dataset.id);
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex !== -1) {
        const currentQty = cart[itemIndex].quantity || 1;
        if (currentQty > 1) {
            cart[itemIndex].quantity = currentQty - 1;
            saveCartToStorage();
            renderCartPage();
            showNotificationForCart('Количество обновлено');
        } else if (currentQty === 1) {
            cart.splice(itemIndex, 1);
            saveCartToStorage();
            renderCartPage();
            showNotificationForCart('Товар удалён из корзины');
        }
    }
}

function handlePlusClick(e) {
    e.stopPropagation();
    const id = parseInt(this.dataset.id);
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex !== -1) {
        cart[itemIndex].quantity = (cart[itemIndex].quantity || 1) + 1;
        saveCartToStorage();
        renderCartPage();
        showNotificationForCart('Количество обновлено');
    }
}

function applyPromoCode() {
    const promoInput = document.getElementById('promoCode');
    const promoFeedback = document.getElementById('promoFeedback');

    if (!promoInput) return;

    let code = promoInput.value.trim().toUpperCase();

    if (cart.length === 0) {
        if (promoFeedback) {
            promoFeedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> Корзина пуста';
            promoFeedback.className = 'promo-feedback error';
        }
        return;
    }

    if (code === 'DISCOUNT10' || code === 'DISCOUNT20') {
        localStorage.setItem('promoCode', code);
        promoFeedback.innerHTML = `<i class="fas fa-check-circle"></i> Промокод ${code} применён! Скидка ${code === 'DISCOUNT10' ? '10' : '20'}%`;
        promoFeedback.className = 'promo-feedback success';
        promoInput.value = '';
        renderCartPage();
        showNotificationForCart('Промокод применён');
    } else if (code === '') {
        localStorage.removeItem('promoCode');
        promoFeedback.innerHTML = '<i class="fas fa-info-circle"></i> Промокод удалён';
        promoFeedback.className = 'promo-feedback';
        renderCartPage();
        showNotificationForCart('Промокод удалён');
    } else {
        promoFeedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> Неверный промокод. Доступны: DISCOUNT10, DISCOUNT20';
        promoFeedback.className = 'promo-feedback error';
    }
}

function checkoutCart() {
    if (cart.length === 0) {
        showNotificationForCart('Корзина пуста');
        return;
    }

    const totalPriceEl = document.getElementById('totalPrice');
    const total = totalPriceEl ? totalPriceEl.textContent : '0 ₽';

    showNotificationForCart(`Заказ оформлен на сумму ${total}. Спасибо за покупку!`);

    cart = [];
    localStorage.removeItem('profreelance_cart');
    localStorage.removeItem('promoCode');
    renderCartPage();
}

function renderRecommendationsForCart() {
    const recGrid = document.getElementById('recommendationsGrid');
    if (!recGrid) return;

    const services = getServicesDataForCart();
    const cartIds = cart.map(item => item.id);
    const recommended = services.filter(service => !cartIds.includes(service.id)).slice(0, 4);

    if (recommended.length === 0) {
        recGrid.innerHTML = '<p style="text-align:center; color:var(--text-gray);">Рекомендаций пока нет</p>';
        return;
    }

    let html = '';
    recommended.forEach(service => {
        html += `
      <div class="rec-card" data-id="${service.id}">
        <div class="rec-info">
          <div class="rec-title">${escapeHtml(service.name)}</div>
          <div class="rec-author">${escapeHtml(service.author)} ★★★★☆</div>
          <div class="rec-price">от ${formatPrice(service.price)}</div>
        </div>
        <button class="rec-btn add-to-cart-rec" data-id="${service.id}" data-name="${escapeHtml(service.name)}" data-price="${service.price}" data-author="${escapeHtml(service.author)}">В корзину</button>
      </div>
    `;
    });
    recGrid.innerHTML = html;

    document.querySelectorAll('.add-to-cart-rec').forEach(btn => {
        btn.removeEventListener('click', handleAddToCartFromRec);
        btn.addEventListener('click', handleAddToCartFromRec);
    });
}

function handleAddToCartFromRec(e) {
    e.stopPropagation();
    const id = parseInt(this.dataset.id);
    const name = this.dataset.name;
    const price = parseInt(this.dataset.price);
    const author = this.dataset.author;

    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({ id: id, name: name, price: price, author: author, quantity: 1 });
    }

    saveCartToStorage();
    renderCartPage();
    showNotificationForCart('Товар добавлен в корзину');
}

function showNotificationForCart(message) {
    const existing = document.querySelector('.cart-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

function initCartPage() {
    loadCart();
    renderCartPage();

    const applyBtn = document.getElementById('applyPromo');
    if (applyBtn) {
        applyBtn.removeEventListener('click', applyPromoCode);
        applyBtn.addEventListener('click', applyPromoCode);
    }

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.removeEventListener('click', checkoutCart);
        checkoutBtn.addEventListener('click', checkoutCart);
    }

    const promoInput = document.getElementById('promoCode');
    if (promoInput) {
        promoInput.removeEventListener('keypress', handlePromoEnter);
        promoInput.addEventListener('keypress', handlePromoEnter);
    }
}

function handlePromoEnter(e) {
    if (e.key === 'Enter') {
        applyPromoCode();
    }
}

// ============================================
// ОБЩИЕ ФУНКЦИИ (МОДАЛКИ, ТЕМА, МЕНЮ)
// ============================================
function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

function initCarousel() {
    const slidesContainer = document.getElementById('slides');
    const dots = document.querySelectorAll('.dot');
    const totalSlides = document.querySelectorAll('.slide').length;

    if (!slidesContainer || totalSlides === 0) return;

    function updateCarousel() {
        if (slidesContainer) {
            slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
    }

    function startSlideShow() {
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            clearInterval(slideInterval);
            currentSlide = index;
            updateCarousel();
            startSlideShow();
        });
    });

    startSlideShow();
}

function initPortfolioSlider() {
    const slidesContainer = document.getElementById('portfolioSlides');
    const dots = document.querySelectorAll('.p-dot');
    const slides = document.querySelectorAll('.portfolio-slide');

    if (!slidesContainer || slides.length === 0) return;

    let portfolioIndex = 0;

    function goToSlide(index) {
        portfolioIndex = index;
        slidesContainer.style.transform = `translateX(-${portfolioIndex * 100}%)`;
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === portfolioIndex);
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });

    setInterval(() => {
        portfolioIndex = (portfolioIndex + 1) % slides.length;
        goToSlide(portfolioIndex);
    }, 5000);
}

// ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ МОДАЛЬНЫХ ОКОН
window.openModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
};

window.closeModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
};

window.openRegisterModal = function() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
};

window.closeRegisterModal = function() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
};

window.openLoginModal = function() {
    window.closeRegisterModal();
    window.openModal();
};

window.switchToLogin = function() {
    window.closeRegisterModal();
    window.openModal();
};

window.switchToRegister = function() {
    window.closeModal();
    window.openRegisterModal();
};

function openFiltersModal() {
    const modal = document.getElementById('filtersModal');
    if (modal) {
        syncFiltersToModal();
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeFiltersModal() {
    const modal = document.getElementById('filtersModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function syncFiltersToModal() {
    document.querySelectorAll('#categoryFilters input').forEach(cb => {
        cb.checked = currentFilters.categories.includes(cb.value);
    });
    const minInput = document.getElementById('priceMin');
    const maxInput = document.getElementById('priceMax');
    if (minInput) minInput.value = currentFilters.priceMin || '';
    if (maxInput) maxInput.value = currentFilters.priceMax || '';
    document.querySelectorAll('#ratingFilters input').forEach(cb => {
        cb.checked = currentFilters.ratings.includes(cb.value);
    });
    document.querySelectorAll('#deadlineFilters input').forEach(cb => {
        cb.checked = currentFilters.deadlines.includes(cb.value);
    });
}

function syncFiltersToDesktop() {
    document.querySelectorAll('#categoryFiltersDesktop input').forEach(cb => {
        cb.checked = currentFilters.categories.includes(cb.value);
    });
    const minInput = document.getElementById('priceMinDesktop');
    const maxInput = document.getElementById('priceMaxDesktop');
    if (minInput) minInput.value = currentFilters.priceMin || '';
    if (maxInput) maxInput.value = currentFilters.priceMax || '';
    document.querySelectorAll('#ratingFiltersDesktop input').forEach(cb => {
        cb.checked = currentFilters.ratings.includes(cb.value);
    });
    document.querySelectorAll('#deadlineFiltersDesktop input').forEach(cb => {
        cb.checked = currentFilters.deadlines.includes(cb.value);
    });
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }

    // Подвал всегда остается темным
    const footer = document.querySelector('.footer');
    if (footer) {
        footer.classList.add('dark');
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
        if (isDark) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }

    // Подвал всегда остается темным
    const footer = document.querySelector('.footer');
    if (footer) {
        footer.classList.add('dark');
    }
}

function initMobileMenu() {
    const burgerBtn = document.getElementById('burgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenuBtn = document.getElementById('closeMenuBtn');

    if (!burgerBtn || !mobileMenu) return;

    function openMenu() {
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    }

    burgerBtn.addEventListener('click', openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
}

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    if (tabButtons.length === 0) return;

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            button.classList.add('active');
            const targetPanel = document.getElementById(targetTab);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });
}

window.switchAccountTab = function(tabName, btnElement) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');

    document.querySelectorAll('.tabs-bar .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    btnElement.classList.add('active');
};

function initAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    if (accordionHeaders.length === 0) return;

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.closest('.accordion-item');
            if (!item) return;

            const isActive = item.classList.contains('active');

            document.querySelectorAll('.accordion-item').forEach(acc => {
                acc.classList.remove('active');
            });

            if (!isActive) item.classList.add('active');
        });
    });
}

function renderServices() {
    const grid = document.getElementById('servicesGrid');
    const foundCount = document.getElementById('foundCount');
    const totalCount = document.getElementById('totalServicesCount');

    if (!grid) return;

    const toShow = currentServices.slice(0, visibleCount);
    if (foundCount) foundCount.textContent = currentServices.length;
    if (totalCount) totalCount.textContent = currentServices.length + ' услуг';

    if (toShow.length === 0) {
        grid.innerHTML = `
      <div style="text-align:center; padding: 60px 20px; color: var(--text-gray);">
        <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>
        <p style="font-size: 1rem; font-weight: 600;">Ничего не найдено</p>
        <p style="font-size: 0.85rem; margin-top: 8px;">Попробуйте изменить параметры поиска или фильтры</p>
      </div>
    `;
        const loadBtn = document.getElementById('loadMoreBtn');
        if (loadBtn) loadBtn.style.display = 'none';
        return;
    }

    grid.innerHTML = toShow.map(s => `
    <div class="service-card" onclick="location.href='${getCorrectPath('usluga.html?id=' + s.id)}'">
      <div class="card-author">
        <div class="avatar">${s.authorAvatar}</div>
        <div>
          <div class="card-author-name">${s.author}</div>
          <div class="card-rating"><i class="fas fa-star"></i> ${s.rating}</div>
        </div>
      </div>
      <div class="card-title">${s.name}</div>
      <div class="tags">${s.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="card-footer">
        <div class="card-price">от ${s.price.toLocaleString('ru-RU')} ₽</div>
        <button class="btn-add-cart-small" onclick="event.stopPropagation(); addToCart({id:${s.id}, name:'${s.name.replace(/'/g, "\\'")}', price:${s.price}, author:'${s.author}'})">
          <i class="fas fa-cart-plus"></i> В корзину
        </button>
      </div>
    </div>
  `).join('');

    const loadBtn = document.getElementById('loadMoreBtn');
    if (loadBtn) {
        loadBtn.style.display = visibleCount >= currentServices.length ? 'none' : 'inline-block';
    }
}

function filterAndSortServices() {
    let filtered = [...servicesData];

    if (currentFilters.categories.length) {
        filtered = filtered.filter(s => currentFilters.categories.includes(s.category));
    }

    if (currentFilters.priceMin) {
        filtered = filtered.filter(s => s.price >= currentFilters.priceMin);
    }
    if (currentFilters.priceMax) {
        filtered = filtered.filter(s => s.price <= currentFilters.priceMax);
    }

    if (currentFilters.ratings.length) {
        filtered = filtered.filter(s => currentFilters.ratings.some(r => s.rating >= parseInt(r)));
    }

    if (currentFilters.deadlines.length) {
        filtered = filtered.filter(s => currentFilters.deadlines.some(d => s.deadline <= parseInt(d)));
    }

    if (currentSort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (currentSort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else if (currentSort === 'rating') filtered.sort((a, b) => b.rating - a.rating);

    currentServices = filtered;
    visibleCount = 6;
    renderServices();
}

function applyDesktopFilters() {
    currentFilters.categories = Array.from(document.querySelectorAll('#categoryFiltersDesktop input:checked')).map(cb => cb.value);
    const min = document.getElementById('priceMinDesktop');
    const max = document.getElementById('priceMaxDesktop');
    currentFilters.priceMin = min?.value ? parseInt(min.value) : null;
    currentFilters.priceMax = max?.value ? parseInt(max.value) : null;
    currentFilters.ratings = Array.from(document.querySelectorAll('#ratingFiltersDesktop input:checked')).map(cb => cb.value);
    currentFilters.deadlines = Array.from(document.querySelectorAll('#deadlineFiltersDesktop input:checked')).map(cb => cb.value);
    filterAndSortServices();
}

function applyMobileFilters() {
    currentFilters.categories = Array.from(document.querySelectorAll('#categoryFilters input:checked')).map(cb => cb.value);
    const min = document.getElementById('priceMin');
    const max = document.getElementById('priceMax');
    currentFilters.priceMin = min?.value ? parseInt(min.value) : null;
    currentFilters.priceMax = max?.value ? parseInt(max.value) : null;
    currentFilters.ratings = Array.from(document.querySelectorAll('#ratingFilters input:checked')).map(cb => cb.value);
    currentFilters.deadlines = Array.from(document.querySelectorAll('#deadlineFilters input:checked')).map(cb => cb.value);
    syncFiltersToDesktop();
    filterAndSortServices();
}

function resetAllFilters() {
    document.querySelectorAll('#categoryFiltersDesktop input').forEach(cb => cb.checked = false);
    document.querySelectorAll('#ratingFiltersDesktop input').forEach(cb => cb.checked = false);
    document.querySelectorAll('#deadlineFiltersDesktop input').forEach(cb => cb.checked = false);
    const minD = document.getElementById('priceMinDesktop');
    const maxD = document.getElementById('priceMaxDesktop');
    if (minD) minD.value = '';
    if (maxD) maxD.value = '';

    document.querySelectorAll('#categoryFilters input').forEach(cb => cb.checked = false);
    document.querySelectorAll('#ratingFilters input').forEach(cb => cb.checked = false);
    document.querySelectorAll('#deadlineFilters input').forEach(cb => cb.checked = false);
    const minM = document.getElementById('priceMin');
    const maxM = document.getElementById('priceMax');
    if (minM) minM.value = '';
    if (maxM) maxM.value = '';

    currentFilters = { categories: [], priceMin: null, priceMax: null, ratings: [], deadlines: [] };
    currentSort = 'default';
    document.querySelectorAll('.sort-pill').forEach(btn => btn.classList.toggle('active', btn.dataset.sort === 'default'));

    const search = document.getElementById('searchInput');
    if (search) search.value = '';

    filterAndSortServices();
}

function initCatalog() {
    const search = document.getElementById('searchInput');
    if (search) {
        search.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            if (!q) {
                filterAndSortServices();
            } else {
                currentServices = servicesData.filter(s =>
                    s.name.toLowerCase().includes(q) ||
                    s.author.toLowerCase().includes(q) ||
                    s.tags.some(t => t.toLowerCase().includes(q))
                );
                visibleCount = 6;
                renderServices();
            }
        });
    }

    document.querySelectorAll('.sort-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sort-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSort = btn.dataset.sort;
            filterAndSortServices();
        });
    });

    const loadBtn = document.getElementById('loadMoreBtn');
    if (loadBtn) {
        loadBtn.addEventListener('click', () => {
            visibleCount += 6;
            renderServices();
        });
    }

    const applyDesktop = document.getElementById('applySidebarFilters');
    if (applyDesktop) {
        applyDesktop.addEventListener('click', () => {
            applyDesktopFilters();
            showNotification('Фильтры применены');
        });
    }

    const resetDesktop = document.getElementById('resetSidebarFilters');
    if (resetDesktop) {
        resetDesktop.addEventListener('click', () => {
            resetAllFilters();
            showNotification('Фильтры сброшены');
        });
    }

    const applyMobile = document.getElementById('applyFiltersBtn');
    if (applyMobile) {
        applyMobile.addEventListener('click', () => {
            applyMobileFilters();
            closeFiltersModal();
            showNotification('Фильтры применены');
        });
    }

    const resetMobile = document.getElementById('resetFiltersBtn');
    if (resetMobile) {
        resetMobile.addEventListener('click', () => {
            resetAllFilters();
            closeFiltersModal();
            showNotification('Фильтры сброшены');
        });
    }

    filterAndSortServices();
}

function initFeedbackForm() {
    const form = document.getElementById('feedbackForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Спасибо! Ваше сообщение отправлено');
            form.reset();
        });
    }
}

function initMap() {
    const mapContainer = document.getElementById('map');
    if (mapContainer && typeof L !== 'undefined') {
        const lat = 55.758236;
        const lng = 37.617278;
        const map = L.map('map').setView([lat, lng], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        L.marker([lat, lng]).addTo(map)
            .bindPopup('ProFreelance Solutions<br>г. Москва, ул. Тверская, д. 15, офис 405')
            .openPopup();
    }
}

function initStatsCounter() {
    const aboutStats = document.querySelector('.about-stats');
    if (!aboutStats) return;

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const text = stat.textContent;
                    const targetNum = parseInt(text.replace(/\D/g, ''));
                    const suffix = text.replace(/[0-9]/g, '');
                    let current = 0;
                    const duration = 2000;
                    const step = targetNum / (duration / 16);

                    const timer = setInterval(() => {
                        current += step;
                        if (current >= targetNum) {
                            stat.textContent = targetNum + suffix;
                            clearInterval(timer);
                        } else {
                            stat.textContent = Math.floor(current) + suffix;
                        }
                    }, 16);
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    statsObserver.observe(aboutStats);
}

function initBackTop() {
    const backBtn = document.getElementById('backTop');
    if (backBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) backBtn.classList.add('visible');
            else backBtn.classList.remove('visible');
        });
        backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
}

// ============================================
// АККОРДЕОН ДЛЯ ФИЛЬТРОВ КАТАЛОГА
// ============================================
function initCatalogAccordion() {
    const headers = document.querySelectorAll('.sidebar-header');

    if (headers.length === 0) return;

    headers.forEach(header => {
        header.removeEventListener('click', header._accordionHandler);

        const handler = function(e) {
            e.stopPropagation();
            const content = this.nextElementSibling;
            const isActive = this.classList.contains('active');

            if (!isActive) {
                this.classList.add('active');
                if (content) content.classList.add('open');
            } else {
                this.classList.remove('active');
                if (content) content.classList.remove('open');
            }
        };

        header._accordionHandler = handler;
        header.addEventListener('click', handler);
    });

    const firstHeader = document.querySelector('.sidebar-header');
    if (firstHeader && !firstHeader.classList.contains('active')) {
        firstHeader.classList.add('active');
        const firstContent = firstHeader.nextElementSibling;
        if (firstContent) firstContent.classList.add('open');
    }
}

function initMobileFilterToggle() {
    const toggleBtn = document.getElementById('filterToggleBtn');
    const sidebar = document.getElementById('catalogSidebar');
    const mobileFilterBtn = document.getElementById('mobileFilterBtn');
    const toggleIcon = document.getElementById('filterToggleIcon');

    if (toggleBtn && sidebar) {
        toggleBtn.removeEventListener('click', toggleBtn._toggleHandler);

        const handler = function() {
            sidebar.classList.toggle('open');
            if (toggleIcon) {
                toggleIcon.style.transform = sidebar.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0)';
            }
        };

        toggleBtn._toggleHandler = handler;
        toggleBtn.addEventListener('click', handler);
    }

    if (mobileFilterBtn && sidebar) {
        mobileFilterBtn.removeEventListener('click', mobileFilterBtn._mobileHandler);

        const handler = function() {
            sidebar.classList.toggle('open');
        };

        mobileFilterBtn._mobileHandler = handler;
        mobileFilterBtn.addEventListener('click', handler);
    }
}

// ============================================
// СИСТЕМА РЕГИСТРАЦИИ И АВТОРИЗАЦИИ
// ============================================
function loadCurrentUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            return currentUser;
        } catch (e) {
            currentUser = null;
            return null;
        }
    }
    return null;
}

function saveCurrentUser(user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
}

window.logoutUser = function() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showNotification('Вы вышли из аккаунта');
    setTimeout(() => {
        window.location.reload();
    }, 1000);
};

function getUsers() {
    const users = localStorage.getItem('registeredUsers');
    if (users) {
        return JSON.parse(users);
    }
    return [];
}

function saveUsers(users) {
    localStorage.setItem('registeredUsers', JSON.stringify(users));
}

window.registerUser = function(name, email, password, phone) {
    const users = getUsers();

    if (users.find(u => u.email === email)) {
        showNotification('Пользователь с таким email уже существует', 'error');
        return false;
    }

    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        phone: phone || '',
        type: 'client',
        avatar: name.charAt(0).toUpperCase(),
        registeredAt: new Date().toLocaleDateString('ru-RU'),
        orders: []
    };

    users.push(newUser);
    saveUsers(users);
    saveCurrentUser(newUser);
    showNotification('Регистрация прошла успешно!');
    return true;
};

window.loginUser = function(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        saveCurrentUser(user);
        showNotification('Добро пожаловать, ' + user.name + '!');
        return true;
    } else {
        showNotification('Неверный email или пароль', 'error');
        return false;
    }
};

function loadUserDataToCabinet() {
    const user = loadCurrentUser();
    if (!user) return;

    const avatarEl = document.querySelector('.profile-avatar');
    const nameEl = document.querySelector('.profile-name');
    const sinceEl = document.querySelector('.profile-since');
    const statNumbers = document.querySelectorAll('.profile-stat-num');

    if (avatarEl) avatarEl.textContent = user.avatar;
    if (nameEl) nameEl.textContent = user.name;
    if (sinceEl) sinceEl.textContent = 'С нами с: ' + user.registeredAt;

    // Заполняем форму профиля данными пользователя
    const profileName = document.getElementById('profileName');
    const profileLastName = document.getElementById('profileLastName');
    const profileEmail = document.getElementById('profileEmail');
    const profilePhone = document.getElementById('profilePhone');
    const profileAbout = document.getElementById('profileAbout');

    if (profileName) {
        const nameParts = user.name.split(' ');
        profileName.value = nameParts[0] || user.name;
        if (profileLastName && nameParts[1]) profileLastName.value = nameParts[1];
    }
    if (profileEmail) profileEmail.value = user.email;
    if (profilePhone) profilePhone.value = user.phone || '';

    // Статистика
    if (statNumbers[0]) statNumbers[0].textContent = user.orders?.length || 0;
    if (statNumbers[1]) statNumbers[1].textContent = user.orders?.filter(o => o.status === 'done').length || 0;
    if (statNumbers[2]) statNumbers[2].textContent = (user.orders?.reduce((sum, o) => sum + o.amount, 0) || 0).toLocaleString() + ' ₽';

    updateOrdersTable(user.orders || []);
    updateFavoritesList(user.favorites || []);
}

function updateOrdersTable(orders) {
    const tbody = document.querySelector('.orders-table tbody');
    if (!tbody) return;

    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px;">У вас пока нет заказов<\/td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => `
    <tr>
      <td class="order-num">#${order.id}</td>
      <td><div class="order-service-name">${escapeHtml(order.service)}</div><div class="order-exec"><i class="fas fa-user"></i> ${escapeHtml(order.executor)}</div></td>
      <td>${order.date}</td>
      <td><span class="status-badge ${order.status === 'in_work' ? 'status-in-work' : 'status-done'}"><i class="fas ${order.status === 'in_work' ? 'fa-circle' : 'fa-check-circle'}"></i> ${order.status === 'in_work' ? 'В работе' : 'Выполнен'}</span></td>
      <td>${order.amount.toLocaleString()} ₽</td>
      <td><div class="action-btns"><button class="btn-sm btn-sm-primary" onclick="viewOrder(${order.id})">${order.status === 'in_work' ? 'Открыть' : 'Просмотр'}</button></div></td>
    </tr>
  `).join('');
}

function updateFavoritesList(favorites) {
    const favoritesList = document.querySelector('.favorites-list');
    if (!favoritesList) return;

    if (!favorites || favorites.length === 0) {
        favoritesList.innerHTML = '<p style="text-align:center; padding:20px;">У вас пока нет избранных услуг</p>';
        return;
    }

    favoritesList.innerHTML = favorites.map(fav => `
    <div class="favorite-item">
      <div class="favorite-avatar" style="background:linear-gradient(135deg,#1a5ce5,#3593F2);">${fav.avatar}</div>
      <div class="favorite-info">
        <div class="favorite-title">${escapeHtml(fav.title)}</div>
        <div class="favorite-meta">${escapeHtml(fav.author)} · от ${fav.price.toLocaleString()} ₽</div>
      </div>
      <button class="btn-open" onclick="window.location.href='${getCorrectPath('usluga.html?id=' + fav.id)}'">Открыть</button>
    </div>
  `).join('');
}

window.saveProfileSettings = function() {
    const user = loadCurrentUser();
    if (!user) return;

    const nameInput = document.getElementById('profileName');
    const lastNameInput = document.getElementById('profileLastName');
    const emailInput = document.getElementById('profileEmail');
    const phoneInput = document.getElementById('profilePhone');

    if (nameInput) {
        const lastName = lastNameInput ? lastNameInput.value : '';
        user.name = lastName ? nameInput.value + ' ' + lastName : nameInput.value;
    }
    if (emailInput) user.email = emailInput.value;
    if (phoneInput) user.phone = phoneInput.value;

    user.avatar = (user.name.charAt(0) || 'U').toUpperCase();

    const allUsers = getUsers();
    const userIndex = allUsers.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        allUsers[userIndex] = user;
        saveUsers(allUsers);
    }
    saveCurrentUser(user);
    loadUserDataToCabinet();
    showNotification('Профиль обновлён');
};

window.saveAccountSettings = function() {
    const user = loadCurrentUser();
    if (!user) return;

    const emailToggle = document.getElementById('emailNotificationsToggle');
    if (emailToggle && !user.settings) {
        user.settings = { emailNotifications: emailToggle.checked, twoFactorEnabled: false };
    } else if (emailToggle && user.settings) {
        user.settings.emailNotifications = emailToggle.checked;
    }

    const allUsers = getUsers();
    const userIndex = allUsers.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        allUsers[userIndex] = user;
        saveUsers(allUsers);
    }
    saveCurrentUser(user);
    showNotification('Настройки сохранены');
};

window.deleteAccount = function() {
    if (confirm('Вы уверены, что хотите удалить аккаунт? Это действие необратимо!')) {
        const user = loadCurrentUser();
        if (user) {
            const allUsers = getUsers();
            const newUsers = allUsers.filter(u => u.id !== user.id);
            saveUsers(newUsers);
            localStorage.removeItem('currentUser');
            showNotification('Аккаунт удалён');
            setTimeout(() => {
                window.location.href = getCorrectPath('/index.html');
            }, 1500);
        }
    }
};

window.viewOrder = function(orderId) {
    showNotification('Открыт заказ #' + orderId);
};

// ============================================
// АДМИН ПАНЕЛЬ: УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ
// ============================================
function initAdminPanel() {
    loadAdminUsers();
    initAdminTabs();
    initUserControls();
    renderUsersTable();
    updateUsersCount();
}

function loadAdminUsers() {
    const saved = localStorage.getItem('admin_users');
    if (saved) {
        adminUsers = JSON.parse(saved);
    } else {
        adminUsers = [
            { id: 1, name: 'Алексей Козлов', email: 'a.kozlov@mail.ru', phone: '+7 (999) 123-45-67', type: 'freelancer', status: 'active', date: '14 марта 2021', avatar: 'АК' },
            { id: 2, name: 'Мария Соколова', email: 'm.sokolova@yandex.ru', phone: '+7 (916) 234-56-78', type: 'freelancer', status: 'active', date: '7 июня 2022', avatar: 'МС' },
            { id: 3, name: 'Андрей Иванченко', email: 'andrey@example.com', phone: '+7 (903) 345-67-89', type: 'client', status: 'active', date: '15 января 2024', avatar: 'АИ' },
            { id: 4, name: 'Екатерина Демидова', email: 'katya@demo.ru', phone: '+7 (912) 456-78-90', type: 'freelancer', status: 'blocked', date: '10 февраля 2023', avatar: 'ЕД' },
            { id: 5, name: 'Дмитрий Петров', email: 'dpetrov@mail.ru', phone: '+7 (926) 567-89-01', type: 'client', status: 'active', date: '20 марта 2024', avatar: 'ДП' },
            { id: 6, name: 'Ольга Смирнова', email: 'olga@example.com', phone: '+7 (999) 678-90-12', type: 'freelancer', status: 'active', date: '5 апреля 2023', avatar: 'ОС' },
            { id: 7, name: 'Иван Николаев', email: 'ivan.n@mail.ru', phone: '+7 (915) 789-01-23', type: 'client', status: 'blocked', date: '1 декабря 2023', avatar: 'ИН' },
        ];
        saveAdminUsers();
    }
}

function saveAdminUsers() {
    localStorage.setItem('admin_users', JSON.stringify(adminUsers));
    updateUsersCount();
}

function updateUsersCount() {
    const countEl = document.getElementById('usersCount');
    const totalUsersWidget = document.getElementById('totalUsersWidget');
    if (countEl) countEl.textContent = adminUsers.length;
    if (totalUsersWidget) totalUsersWidget.textContent = adminUsers.length.toLocaleString();
}

function initAdminTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            document.getElementById(`${tabId}Pane`).classList.add('active');
            if (tabId === 'users') {
                renderUsersTable();
            }
        });
    });
}

function initUserControls() {
    const searchInput = document.getElementById('userSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentUserSearch = e.target.value.toLowerCase();
            currentUserPage = 1;
            renderUsersTable();
        });
    }

    const filterBtns = document.querySelectorAll('.filter-chip-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentUserFilter = btn.dataset.filter;
            currentUserPage = 1;
            renderUsersTable();
        });
    });

    const addBtn = document.getElementById('addUserBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => openUserModal());
    }
}

function getFilteredUsers() {
    let filtered = [...adminUsers];

    if (currentUserSearch) {
        filtered = filtered.filter(u =>
            u.name.toLowerCase().includes(currentUserSearch) ||
            u.email.toLowerCase().includes(currentUserSearch) ||
            (u.phone && u.phone.includes(currentUserSearch))
        );
    }

    switch (currentUserFilter) {
        case 'active':
            filtered = filtered.filter(u => u.status === 'active');
            break;
        case 'blocked':
            filtered = filtered.filter(u => u.status === 'blocked');
            break;
        case 'freelancer':
            filtered = filtered.filter(u => u.type === 'freelancer');
            break;
        case 'client':
            filtered = filtered.filter(u => u.type === 'client');
            break;
        default:
            break;
    }

    return filtered;
}

function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    const paginationDiv = document.getElementById('usersPagination');
    if (!tbody) return;

    const filtered = getFilteredUsers();
    const totalPages = Math.ceil(filtered.length / USERS_PER_PAGE);
    const start = (currentUserPage - 1) * USERS_PER_PAGE;
    const paginatedUsers = filtered.slice(start, start + USERS_PER_PAGE);

    if (paginatedUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px;">Пользователи не найдены<\/td></tr>';
        if (paginationDiv) paginationDiv.innerHTML = '';
        return;
    }

    tbody.innerHTML = paginatedUsers.map(user => `
    <tr data-user-id="${user.id}">
      <td><div class="user-cell"><div class="user-av" style="background:linear-gradient(135deg,#1a5ce5,#3593F2);">${user.avatar}</div><div><div class="user-name">${escapeHtml(user.name)}</div><div class="user-email">${escapeHtml(user.email)}</div></div></div></td>
      <td><span class="type-badge ${user.type === 'freelancer' ? 'type-freelancer' : 'type-client'}">${user.type === 'freelancer' ? 'Фрилансер' : 'Заказчик'}</span></td>
      <td><span class="${user.status === 'active' ? 'status-badge-active' : 'status-badge-blocked'}">${user.status === 'active' ? 'Активный' : 'Заблокирован'}</span></td>
      <td>${user.phone || '—'}</td>
      <td>${user.date}</td>
      <td><div class="action-buttons"><button class="btn-icon-sm edit" onclick="editUser(${user.id})" title="Редактировать"><i class="fas fa-edit"></i></button>${user.status === 'active' ? '<button class="btn-icon-sm block" onclick="toggleBlockUser(' + user.id + ')" title="Заблокировать"><i class="fas fa-ban"></i></button>' : '<button class="btn-icon-sm edit" onclick="toggleBlockUser(' + user.id + ')" title="Разблокировать" style="color:var(--success);"><i class="fas fa-check-circle"></i></button>'}<button class="btn-icon-sm delete" onclick="deleteUser(${user.id})" title="Удалить"><i class="fas fa-trash-alt"></i></button></div></td>
    </tr>
  `).join('');

    if (paginationDiv && totalPages > 1) {
        let paginationHtml = `<button class="pagination-btn" ${currentUserPage === 1 ? 'disabled' : ''} onclick="changeUserPage(${currentUserPage - 1})">‹</button>`;
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `<button class="pagination-btn ${i === currentUserPage ? 'active' : ''}" onclick="changeUserPage(${i})">${i}</button>`;
        }
        paginationHtml += `<button class="pagination-btn" ${currentUserPage === totalPages ? 'disabled' : ''} onclick="changeUserPage(${currentUserPage + 1})">›</button>`;
        paginationHtml += `<span style="margin-left:10px; font-size:0.7rem;">${filtered.length} пользователей</span>`;
        paginationDiv.innerHTML = paginationHtml;
    } else if (paginationDiv) {
        paginationDiv.innerHTML = `<span style="font-size:0.7rem;">${filtered.length} пользователей</span>`;
    }
}

function changeUserPage(page) {
    currentUserPage = page;
    renderUsersTable();
}

function openUserModal(userId = null) {
    const modal = document.getElementById('userModal');
    const title = document.getElementById('modalTitle');

    if (!modal) return;

    if (userId) {
        const user = adminUsers.find(u => u.id === userId);
        if (user) {
            title.textContent = 'Редактировать пользователя';
            document.getElementById('editUserId').value = user.id;
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userPhone').value = user.phone || '';
            document.getElementById('userType').value = user.type;
            document.getElementById('userStatus').value = user.status;
        }
    } else {
        title.textContent = 'Добавить пользователя';
        document.getElementById('editUserId').value = '';
        document.getElementById('userForm').reset();
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

window.editUser = function(id) {
    openUserModal(id);
};

window.toggleBlockUser = function(id) {
    const user = adminUsers.find(u => u.id === id);
    if (user) {
        user.status = user.status === 'active' ? 'blocked' : 'active';
        saveAdminUsers();
        renderUsersTable();
        showAdminNotification(`Пользователь ${user.status === 'active' ? 'разблокирован' : 'заблокирован'}`);
    }
};

window.deleteUser = function(id) {
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
        adminUsers = adminUsers.filter(u => u.id !== id);
        saveAdminUsers();
        renderUsersTable();
        showAdminNotification('Пользователь удалён');
    }
};

function showAdminNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 300);
    }, 2500);
}

function checkAdminAccess() {
    if (window.location.pathname.includes('/admin.html')) {
        const isAdmin = localStorage.getItem('isAdmin');
        if (!isAdmin) {
            window.location.href = getCorrectPath('/index.html');
        }
    }
}

window.adminLogout = function() {
    localStorage.removeItem('isAdmin');
    window.location.href = getCorrectPath('/index.html');
};

// Обработчик клика по overlay для закрытия модальных окон
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('open');
        document.body.style.overflow = '';
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(modal => {
            modal.classList.remove('open');
        });
        document.body.style.overflow = '';
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) mobileMenu.classList.remove('open');
    }
});

// ============================================
// АДМИН ПАНЕЛЬ: ВХОД ПО ЛОГИНУ admin И ПАРОЛЮ admin
// ============================================

// Функция для входа в админку
window.adminLogin = function(email, password) {
    if (email === 'admin' && password === 'admin') {
        localStorage.setItem('isAdmin', 'true');
        showNotification('Добро пожаловать в панель администратора!');
        setTimeout(() => {
            // Используем относительный путь
            window.location.href = 'assets/pages/admin.html';
        }, 500);
        return true;
    } else {
        showNotification('Неверный логин или пароль администратора', 'error');
        return false;
    }
};

// Функция для входа в админку с модального окна
window.openAdminLoginModal = function() {
    window.openModal();
    setTimeout(() => {
        const emailField = document.getElementById('loginEmail');
        const passField = document.getElementById('loginPassword');
        if (emailField) emailField.value = 'admin';
        if (passField) passField.value = 'admin';
    }, 200);
};

// Функция для проверки, на какой странице мы находимся (для относительных путей)
function isOnPage(pageName) {
    const path = window.location.pathname;
    return path.includes(pageName) || path.endsWith(pageName);
}

// ============================================
// ЗАПУСК ВСЕХ МОДУЛЕЙ
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем базовый путь
    initBasePath();
    
    loadCart();
    initTheme();
    initMobileMenu();
    initCarousel();
    initPortfolioSlider();
    initTabs();
    initAccordion();
    initCatalog();
    initMap();
    initFeedbackForm();
    initStatsCounter();
    initBackTop();
    checkAdminAccess();
    updateCartBadge();

    // Инициализация аккордеона для каталога
    if (isOnPage('catalog') || isOnPage('catalog.html')) {
        setTimeout(() => {
            initCatalogAccordion();
            initMobileFilterToggle();
        }, 100);
    }

    // Инициализация страницы корзины
    if (isOnPage('corzina') || isOnPage('corzina.html')) {
        initCartPage();
    }

    // Инициализация админки
    if (isOnPage('admin') || isOnPage('/admin.html')) {
        initAdminPanel();
    }

    // Инициализация личного кабинета
    if (isOnPage('cabinet') || isOnPage('cabinet.html')) {
        const user = loadCurrentUser();
        const headerLoginBtn = document.getElementById('headerLoginBtn');
        const headerLogoutBtn = document.getElementById('headerLogoutBtn');

        if (user) {
            if (headerLoginBtn) headerLoginBtn.style.display = 'none';
            if (headerLogoutBtn) headerLogoutBtn.style.display = 'block';
            loadUserDataToCabinet();
        } else {
            if (headerLoginBtn) headerLoginBtn.style.display = 'block';
            if (headerLogoutBtn) headerLogoutBtn.style.display = 'none';
            const ordersCard = document.querySelector('.orders-card');
            if (ordersCard) {
                ordersCard.innerHTML = '<div style="text-align:center; padding:60px;"><i class="fas fa-lock" style="font-size:48px; margin-bottom:16px;"></i><p>Пожалуйста, войдите в аккаунт, чтобы просмотреть личный кабинет</p><button class="btn-primary" onclick="openLoginModal()" style="margin-top:16px;">Войти</button></div>';
            }
        }
    }

    // Обработчики для кнопок входа/выхода на ВСЕХ страницах
    const headerLoginBtn = document.getElementById('headerLoginBtn');
    const headerLogoutBtn = document.getElementById('headerLogoutBtn');
    const mobileHeaderLoginBtn = document.getElementById('mobileHeaderLoginBtn');
    const mobileHeaderLogoutBtn = document.getElementById('mobileHeaderLogoutBtn');
    const user = loadCurrentUser();

    if (headerLoginBtn && headerLogoutBtn) {
        if (user) {
            headerLoginBtn.style.display = 'none';
            headerLogoutBtn.style.display = 'block';
            if (headerLogoutBtn) headerLogoutBtn.onclick = window.logoutUser;
        } else {
            headerLoginBtn.style.display = 'block';
            headerLogoutBtn.style.display = 'none';
            headerLoginBtn.onclick = function() { window.openLoginModal(); };
        }
    }

    if (mobileHeaderLoginBtn && mobileHeaderLogoutBtn) {
        if (user) {
            mobileHeaderLoginBtn.style.display = 'none';
            mobileHeaderLogoutBtn.style.display = 'block';
            mobileHeaderLogoutBtn.onclick = window.logoutUser;
        } else {
            mobileHeaderLoginBtn.style.display = 'block';
            mobileHeaderLogoutBtn.style.display = 'none';
            mobileHeaderLoginBtn.onclick = function() { window.openLoginModal(); };
        }
    }

    // Кнопки входа/регистрации в модалках
    const doLoginBtn = document.getElementById('doLoginBtn');
    if (doLoginBtn) {
        doLoginBtn.onclick = function() {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            // Проверка на администратора
            if (email === 'admin' && password === 'admin') {
                window.adminLogin(email, password);
                return;
            }

            if (window.loginUser(email, password)) {
                window.closeModal();
                window.location.reload();
            }
        };
    }

    const doRegisterBtn = document.getElementById('doRegisterBtn');
    if (doRegisterBtn) {
        doRegisterBtn.onclick = function() {
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const phone = document.getElementById('regPhone').value;
            const password = document.getElementById('regPassword').value;
            const confirm = document.getElementById('regPasswordConfirm').value;

            if (!name || !email || !password) {
                showNotification('Заполните все обязательные поля', 'error');
                return;
            }
            if (password !== confirm) {
                showNotification('Пароли не совпадают', 'error');
                return;
            }
            if (password.length < 4) {
                showNotification('Пароль должен содержать минимум 4 символа', 'error');
                return;
            }

            if (window.registerUser(name, email, password, phone)) {
                window.closeRegisterModal();
                window.location.reload();
            }
        };
    }

    // Закрытие модальных окон по кнопкам
    const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
    if (closeAuthModalBtn) closeAuthModalBtn.onclick = window.closeModal;

    const closeRegisterModalBtn = document.getElementById('closeRegisterModalBtn');
    if (closeRegisterModalBtn) closeRegisterModalBtn.onclick = window.closeRegisterModal;

    // Переключение между формами
    const switchToRegisterBtn = document.getElementById('switchToRegisterBtn');
    if (switchToRegisterBtn) {
        switchToRegisterBtn.onclick = function(e) {
            e.preventDefault();
            window.switchToRegister();
        };
    }

    const switchToLoginBtn = document.getElementById('switchToLoginBtn');
    if (switchToLoginBtn) {
        switchToLoginBtn.onclick = function(e) {
            e.preventDefault();
            window.switchToLogin();
        };
    }

    // Кнопки в личном кабинете
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) saveProfileBtn.onclick = window.saveProfileSettings;

    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) saveSettingsBtn.onclick = window.saveAccountSettings;

    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) deleteAccountBtn.onclick = window.deleteAccount;

    const enable2FABtn = document.getElementById('enable2FABtn');
    if (enable2FABtn) {
        enable2FABtn.onclick = function() {
            showNotification('Функция будет доступна soon');
        };
    }

    // Тема
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
});