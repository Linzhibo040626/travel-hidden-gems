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
        localStorage.setItem('user', JSON.stringify({ username: data.username, nickname: data.nickname || data.username, id: data.id }));
        return data;
    },

    async register(username, password) {
        return API.register(username, password);
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
            nav.innerHTML = `
                <span class="user-info">&#128100; ${escapeHtml(user?.nickname || user?.username || '')}</span>
                <button class="btn btn-outline" onclick="Auth.logout()">退出</button>
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
