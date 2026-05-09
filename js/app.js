document.addEventListener('DOMContentLoaded', () => {
    Auth.updateNav();
    loadPosts();
    setupFilters();
    initCarousel();
    loadCheckinStatus();

    const mapContainer = document.getElementById('mapContainer');
    if (mapContainer && typeof renderChinaMap === 'function') {
        renderChinaMap(mapContainer);
    }

    const clock = document.getElementById('heroClock');
    if (clock) {
        function updateClock() {
            const now = new Date();
            const beijing = new Date(now.getTime() + (now.getTimezoneOffset() + 480) * 60000);
            const y = beijing.getFullYear();
            const mo = String(beijing.getMonth() + 1).padStart(2, '0');
            const d = String(beijing.getDate()).padStart(2, '0');
            const h = String(beijing.getHours()).padStart(2, '0');
            const mi = String(beijing.getMinutes()).padStart(2, '0');
            const s = String(beijing.getSeconds()).padStart(2, '0');
            const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
            const w = weekdays[beijing.getDay()];
            clock.textContent = `${y}年${mo}月${d}日 星期${w} ${h}:${mi}:${s}`;
        }
        updateClock();
        setInterval(updateClock, 1000);
    }
});

function switchView(view) {
    const postsView = document.getElementById('viewPosts');
    const mapView = document.getElementById('viewMap');
    const btnPosts = document.getElementById('btnPosts');
    const btnMap = document.getElementById('btnMap');

    if (view === 'posts') {
        postsView.style.display = 'block';
        mapView.style.display = 'none';
        btnPosts.classList.add('active');
        btnMap.classList.remove('active');
    } else {
        postsView.style.display = 'none';
        mapView.style.display = 'block';
        btnPosts.classList.remove('active');
        btnMap.classList.add('active');
    }

    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
}

async function loadPosts() {
    const params = {
        category: document.getElementById('filterCategory')?.value || '',
        region: document.getElementById('filterRegion')?.value || '',
        season: document.getElementById('filterSeason')?.value || '',
        sort: document.getElementById('filterSort')?.value || ''
    };

    try {
        const posts = await API.getPosts(params);
        renderPosts(posts);
    } catch (err) {
        console.error('Failed to load posts:', err);
        renderPosts([]);
    }
}

function getFirstImage(imageUrl) {
    if (!imageUrl) return '';
    try {
        const parsed = JSON.parse(imageUrl);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    } catch {}
    return imageUrl;
}

function renderPosts(posts) {
    const grid = document.getElementById('postGrid');
    const empty = document.getElementById('emptyState');

    if (!grid) return;

    if (posts.length === 0) {
        grid.style.display = 'none';
        if (empty) empty.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    if (empty) empty.style.display = 'none';

    grid.innerHTML = posts.map(post => {
        const img = getFirstImage(post.image_url);
        return `
        <div class="post-card" onclick="window.location.href='post.html?id=${post.id}'">
            ${img
                ? `<img class="post-card-image" src="${escapeHtml(img)}" alt="${escapeHtml(post.title)}" loading="lazy">`
                : `<div class="post-card-image" style="display:flex;align-items:center;justify-content:center;font-size:3rem;background:linear-gradient(135deg,#E8F6F8,#D4EFE8);">&#127757;</div>`
            }
            <div class="post-card-body">
                <h3 class="post-card-title">${escapeHtml(post.title)}</h3>
                <div class="post-card-meta">
                    <span>&#128205; ${escapeHtml(post.location)}</span>
                    <span>&#128100; ${escapeHtml(post.nickname || '匿名')}</span>
                </div>
                <span class="post-card-tag">${escapeHtml(post.category)}</span>
                ${post.season ? `<span class="post-card-tag" style="margin-left:4px;">${escapeHtml(post.season)}</span>` : ''}
            </div>
            <div class="post-card-footer">
                <span>&#10084; ${post.likes_count || 0}</span>
                <span>${formatTime(post.created_at)}</span>
            </div>
        </div>
    `}).join('');
}

function setupFilters() {
    const filters = ['filterCategory', 'filterRegion', 'filterSeason', 'filterSort'];
    filters.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', loadPosts);
        }
    });
}

let currentSlide = 0;
let carouselTimer = null;

function initCarousel() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    carouselTimer = setInterval(nextSlide, 4000);
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    if (!slides.length) return;
    currentSlide = index;
    slides.forEach((s, i) => s.classList.toggle('active', i === currentSlide));
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    resetCarouselTimer();
}

function nextSlide() {
    const slides = document.querySelectorAll('.carousel-slide');
    if (!slides.length) return;
    goToSlide((currentSlide + 1) % slides.length);
}

function prevSlide() {
    const slides = document.querySelectorAll('.carousel-slide');
    if (!slides.length) return;
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
}

function resetCarouselTimer() {
    if (carouselTimer) clearInterval(carouselTimer);
    carouselTimer = setInterval(nextSlide, 4000);
}

// --- Checkin & Card Draw ---
async function loadCheckinStatus() {
    const panel = document.getElementById('checkinPanel');
    if (!panel) return;
    if (!Auth.isLoggedIn()) {
        document.getElementById('checkinBtn').textContent = '登录后签到';
        document.getElementById('checkinBtn').disabled = true;
        return;
    }
    try {
        const status = await API.getCheckinStatus();
        document.getElementById('streakCount').textContent = status.streak || 0;
        document.getElementById('availableDraws').textContent = status.available_draws || 0;
        if (status.checked_in_today) {
            const btn = document.getElementById('checkinBtn');
            btn.textContent = '今日已签到';
            btn.disabled = true;
            btn.classList.add('disabled');
        }
    } catch {}
}

async function doCheckin() {
    if (!Auth.isLoggedIn()) {
        showToast('请先登录', 'error');
        return;
    }
    try {
        const result = await API.checkin();
        document.getElementById('streakCount').textContent = result.streak || 0;
        document.getElementById('availableDraws').textContent = result.available_draws || 0;
        const btn = document.getElementById('checkinBtn');
        btn.textContent = '今日已签到';
        btn.disabled = true;
        btn.classList.add('disabled');
        showToast(`签到成功！获得${result.draws_earned}次抽卡`, 'success');
        openDrawModal();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

let drawnResult = null;

async function openDrawModal() {
    try {
        drawnResult = await API.drawCard();
        document.getElementById('drawnCity').textContent = drawnResult.city;
        document.getElementById('drawnProvince').textContent = drawnResult.province;
        document.getElementById('drawResultHint').textContent = '点击卡片翻转';
        document.getElementById('closeDrawBtn').style.display = 'none';
        document.getElementById('flipCardInner').classList.remove('flipped');
        document.getElementById('cardDrawModal').style.display = 'flex';
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function flipTheCard() {
    const inner = document.getElementById('flipCardInner');
    if (inner.classList.contains('flipped')) return;
    inner.classList.add('flipped');
    setTimeout(() => {
        let hint = drawnResult.is_duplicate ? '重复卡！可在集卡大赛中分解为碎片' : '新城市卡！';
        if (drawnResult.new_badge) {
            hint += ` 🎉 解锁徽章：${drawnResult.new_badge}`;
        }
        document.getElementById('drawResultHint').textContent = hint;
        document.getElementById('closeDrawBtn').style.display = 'inline-block';
    }, 600);
}

function closeDrawModal() {
    document.getElementById('cardDrawModal').style.display = 'none';
    const draws = parseInt(document.getElementById('availableDraws').textContent) - 1;
    document.getElementById('availableDraws').textContent = Math.max(0, draws);
}
