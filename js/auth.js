const Auth = {
    getToken() {
        return localStorage.getItem('token');
    },

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isLoggedIn() {
        return !!this.getToken();
    },

    async login(username, password) {
        const data = await API.login(username, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ username: data.username, nickname: data.nickname || data.username, id: data.id, phone: data.phone || '' }));
        return data;
    },

    async register(username, password, phone, code) {
        return API.register(username, password, phone, code);
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    },

    updateNav() {
        const nav = document.getElementById('navActions');
        if (!nav) return;

        if (this.isLoggedIn()) {
            const user = this.getUser();
            const cached = localStorage.getItem('profileCache');
            let avatarSrc = '';
            if (cached) {
                try { avatarSrc = JSON.parse(cached).avatar || ''; } catch {}
            }
            if (!avatarSrc) {
                const ch = (user?.nickname || user?.username || 'U')[0].toUpperCase();
                avatarSrc = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23E8F6F8" width="100" height="100"/><text x="50" y="65" font-size="40" text-anchor="middle" fill="%231B5E6B">' + ch + '</text></svg>';
            }
            nav.innerHTML = `
                <a href="profile.html" class="nav-avatar-link">
                    <img class="nav-avatar" src="${avatarSrc}" alt="头像">
                </a>
            `;
        } else {
            nav.innerHTML = `
                <a href="login.html" class="btn btn-outline">登录</a>
                <a href="register.html" class="btn btn-primary">注册</a>
            `;
        }
    }
};

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showToast(message, type = '') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function formatTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';
    return d.toLocaleDateString('zh-CN');
}

function setupGlobalSearch() {
    const container = document.querySelector('.nav-search');
    if (!container) return;
    const input = container.querySelector('input');
    if (!input) return;
    const isSearchPage = window.location.pathname.includes('search.html');
    if (isSearchPage) return;

    if (!container.querySelector('.nav-search-btn')) {
        const btn = document.createElement('button');
        btn.className = 'nav-search-btn';
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
        btn.addEventListener('click', () => {
            const q = input.value.trim();
            window.location.href = 'search.html' + (q ? '?q=' + encodeURIComponent(q) : '');
        });
        container.appendChild(btn);
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const q = input.value.trim();
            window.location.href = 'search.html' + (q ? '?q=' + encodeURIComponent(q) : '');
        }
    });
}

document.addEventListener('DOMContentLoaded', setupGlobalSearch);

async function updateUnreadBadges() {
    if (!Auth.isLoggedIn()) return;
    const msgBadge = document.getElementById('badgeMessages');
    const notifBadge = document.getElementById('badgeNotifications');
    if (!msgBadge && !notifBadge) return;
    try {
        const [msgData, notifData] = await Promise.all([
            API.getMessagesUnreadCount(),
            API.getNotificationsUnreadCount()
        ]);
        if (msgBadge) {
            if (msgData.count > 0) {
                msgBadge.textContent = msgData.count > 99 ? '99+' : msgData.count;
                msgBadge.style.display = '';
            } else {
                msgBadge.style.display = 'none';
            }
        }
        if (notifBadge) {
            if (notifData.count > 0) {
                notifBadge.textContent = notifData.count > 99 ? '99+' : notifData.count;
                notifBadge.style.display = '';
            } else {
                notifBadge.style.display = 'none';
            }
        }
    } catch (e) {}
}

document.addEventListener('DOMContentLoaded', updateUnreadBadges);
