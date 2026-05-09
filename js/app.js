document.addEventListener('DOMContentLoaded', () => {
    Auth.updateNav();
    loadPosts();
    setupFilters();

    const mapContainer = document.getElementById('mapContainer');
    if (mapContainer && typeof renderChinaMap === 'function') {
        renderChinaMap(mapContainer);
    }

    const btnProfile = document.getElementById('btnProfile');
    if (btnProfile && !Auth.isLoggedIn()) {
        btnProfile.style.display = 'none';
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            window.location.href = 'search.html';
        });
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
        season: document.getElementById('filterSeason')?.value || ''
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
    const filters = ['filterCategory', 'filterRegion', 'filterSeason'];
    filters.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', loadPosts);
        }
    });
}
