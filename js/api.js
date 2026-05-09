const API_BASE = '/api';

const API = {
    async request(path, options = {}) {
        const url = API_BASE + path;
        const headers = { 'Content-Type': 'application/json' };
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }
        const res = await fetch(url, { ...options, headers });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || '请求失败');
        }
        return data;
    },

    async register(username, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },

    async login(username, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },

    async getPosts(params = {}) {
        const query = new URLSearchParams();
        if (params.category) query.set('category', params.category);
        if (params.region) query.set('region', params.region);
        if (params.season) query.set('season', params.season);
        if (params.search) query.set('search', params.search);
        const qs = query.toString();
        return this.request('/posts' + (qs ? '?' + qs : ''));
    },

    async getPost(id) {
        return this.request('/posts/' + id);
    },

    async createPost(data) {
        return this.request('/posts', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async toggleLike(postId) {
        return this.request('/posts/' + postId + '/like', { method: 'POST' });
    },

    async getComments(postId) {
        return this.request('/posts/' + postId + '/comments');
    },

    async addComment(postId, content) {
        return this.request('/posts/' + postId + '/comments', {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    }
};
