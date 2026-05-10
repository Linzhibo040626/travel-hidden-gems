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
        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error('服务器响应异常，请稍后重试');
        }
        if (!res.ok) {
            throw new Error(data.error || '请求失败');
        }
        return data;
    },

    async register(username, password, phone, code) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, phone, code })
        });
    },

    async sendSmsCode(phone) {
        return this.request('/sms/send', {
            method: 'POST',
            body: JSON.stringify({ phone })
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
        if (params.sort) query.set('sort', params.sort);
        if (params.page) query.set('page', params.page);
        if (params.limit) query.set('limit', params.limit);
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

    async updatePost(id, data) {
        return this.request('/posts/' + id, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async toggleLike(postId) {
        return this.request('/posts/' + postId + '/like', { method: 'POST' });
    },

    async toggleFavorite(postId) {
        return this.request('/posts/' + postId + '/favorite', { method: 'POST' });
    },

    async getComments(postId) {
        return this.request('/posts/' + postId + '/comments');
    },

    async addComment(postId, content, replyTo) {
        return this.request('/posts/' + postId + '/comments', {
            method: 'POST',
            body: JSON.stringify({ content, reply_to: replyTo || undefined })
        });
    },

    async getProfile() {
        return this.request('/user/profile');
    },

    async updateProfile(data) {
        return this.request('/user/profile', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async getMyPosts() {
        return this.request('/user/posts');
    },

    async deletePost(postId) {
        return this.request('/posts/' + postId, { method: 'DELETE' });
    },

    // Friends
    async searchUsers(q) {
        return this.request('/users/search?q=' + encodeURIComponent(q));
    },
    async getFriends() {
        return this.request('/friends');
    },
    async sendFriendRequest(targetUserId) {
        return this.request('/friends/request', {
            method: 'POST',
            body: JSON.stringify({ target_user_id: targetUserId })
        });
    },
    async respondFriendRequest(friendshipId, action) {
        return this.request('/friends/respond', {
            method: 'POST',
            body: JSON.stringify({ friendship_id: friendshipId, action })
        });
    },

    // Messages
    async getConversations() {
        return this.request('/messages/conversations');
    },
    async getMessages(userId) {
        return this.request('/messages/' + userId);
    },
    async sendMessage(userId, content) {
        return this.request('/messages/' + userId, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    },
    async markRead(userId) {
        return this.request('/messages/' + userId + '/read', { method: 'POST' });
    },
    async getMessagesUnreadCount() {
        return this.request('/messages/unread-count');
    },

    // Notifications
    async getNotifications() {
        return this.request('/notifications');
    },
    async markNotificationsRead() {
        return this.request('/notifications/read', { method: 'POST' });
    },
    async getNotificationsUnreadCount() {
        return this.request('/notifications/unread-count');
    },

    // Checkin & Cards
    async checkin() {
        return this.request('/checkin', { method: 'POST' });
    },
    async getCheckinStatus() {
        return this.request('/checkin/status');
    },
    async drawCard() {
        return this.request('/cards/draw', { method: 'POST' });
    },
    async getCollection() {
        return this.request('/cards/collection');
    },
    async decomposeCard(cityName) {
        return this.request('/cards/decompose', { method: 'POST', body: JSON.stringify({ city_name: cityName }) });
    },
    async fragmentDraw() {
        return this.request('/cards/fragment-draw', { method: 'POST' });
    }
};
