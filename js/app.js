document.addEventListener('DOMContentLoaded', () => {
    Auth.updateNav();
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
        const input = document.getElementById('searchInput');
        if (input) input.value = searchQuery;
    }
    loadPosts();
    setupFilters();
    setupSearch();
});

async function loadPosts() {
    const params = {
        category: document.getElementById('filterCategory')?.value || '',
        region: document.getElementById('filterRegion')?.value || '',
        season: document.getElementById('filterSeason')?.value || '',
        search: document.getElementById('searchInput')?.value || ''
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

function setupSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;

    let timer;
    input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(loadPosts, 400);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            clearTimeout(timer);
            loadPosts();
        }
    });
}
