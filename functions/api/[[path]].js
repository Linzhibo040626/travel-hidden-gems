import { json, hashPassword, createToken, verifyToken, getUser, getSecret } from './_helpers.js';

let migrated = false;
async function runMigrations(env) {
    if (migrated) return;
    try {
        await env.DB.prepare("ALTER TABLE users ADD COLUMN nickname TEXT DEFAULT ''").run();
    } catch {}
    try {
        await env.DB.prepare("ALTER TABLE users ADD COLUMN qq TEXT DEFAULT ''").run();
    } catch {}
    try {
        await env.DB.prepare("ALTER TABLE users ADD COLUMN gender TEXT DEFAULT ''").run();
    } catch {}
    try {
        await env.DB.prepare("ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT ''").run();
    } catch {}
    try {
        await env.DB.prepare("ALTER TABLE users ADD COLUMN signature TEXT DEFAULT ''").run();
    } catch {}
    try {
        await env.DB.prepare("ALTER TABLE users ADD COLUMN phone TEXT DEFAULT ''").run();
    } catch {}
    try {
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS sms_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT NOT NULL,
            code TEXT NOT NULL,
            expires_at INTEGER NOT NULL,
            used INTEGER DEFAULT 0
        )`).run();
    } catch {}
    try {
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS friendships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            friend_id INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, friend_id)
        )`).run();
    } catch {}
    try {
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`).run();
    } catch {}
    try {
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            content TEXT NOT NULL,
            related_id INTEGER,
            is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`).run();
    } catch {}
    migrated = true;
}

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
        return json({});
    }

    await runMigrations(env);

    try {
        // Auth routes
        if (path === '/api/auth/register' && request.method === 'POST') {
            return await handleRegister(request, env);
        }
        if (path === '/api/auth/login' && request.method === 'POST') {
            return await handleLogin(request, env);
        }

        // SMS routes
        if (path === '/api/sms/send' && request.method === 'POST') {
            return await handleSendSms(request, env);
        }

        // Posts routes
        if (path === '/api/posts' && request.method === 'GET') {
            return await handleGetPosts(request, env);
        }
        if (path === '/api/posts' && request.method === 'POST') {
            return await handleCreatePost(request, env);
        }

        const postMatch = path.match(/^\/api\/posts\/(\d+)$/);
        if (postMatch && request.method === 'GET') {
            return await handleGetPost(postMatch[1], request, env);
        }
        if (postMatch && request.method === 'PUT') {
            return await handleUpdatePost(postMatch[1], request, env);
        }
        if (postMatch && request.method === 'DELETE') {
            return await handleDeletePost(postMatch[1], request, env);
        }

        const likeMatch = path.match(/^\/api\/posts\/(\d+)\/like$/);
        if (likeMatch && request.method === 'POST') {
            return await handleToggleLike(likeMatch[1], request, env);
        }

        const commentsMatch = path.match(/^\/api\/posts\/(\d+)\/comments$/);
        if (commentsMatch && request.method === 'GET') {
            return await handleGetComments(commentsMatch[1], env);
        }
        if (commentsMatch && request.method === 'POST') {
            return await handleAddComment(commentsMatch[1], request, env);
        }

        // User profile routes
        if (path === '/api/user/profile' && request.method === 'GET') {
            return await handleGetProfile(request, env);
        }
        if (path === '/api/user/profile' && request.method === 'POST') {
            return await handleUpdateProfile(request, env);
        }
        if (path === '/api/user/posts' && request.method === 'GET') {
            return await handleGetMyPosts(request, env);
        }

        // Friends routes
        if (path === '/api/friends' && request.method === 'GET') {
            return await handleGetFriends(request, env);
        }
        if (path === '/api/friends/request' && request.method === 'POST') {
            return await handleFriendRequest(request, env);
        }
        if (path === '/api/friends/respond' && request.method === 'POST') {
            return await handleFriendRespond(request, env);
        }
        if (path === '/api/users/search' && request.method === 'GET') {
            return await handleSearchUsers(request, env);
        }

        // Messages routes
        if (path === '/api/messages/conversations' && request.method === 'GET') {
            return await handleGetConversations(request, env);
        }
        if (path === '/api/messages/unread-count' && request.method === 'GET') {
            return await handleMessagesUnreadCount(request, env);
        }
        const msgMatch = path.match(/^\/api\/messages\/(\d+)$/);
        if (msgMatch && request.method === 'GET') {
            return await handleGetMessages(msgMatch[1], request, env);
        }
        if (msgMatch && request.method === 'POST') {
            return await handleSendMessage(msgMatch[1], request, env);
        }
        const msgReadMatch = path.match(/^\/api\/messages\/(\d+)\/read$/);
        if (msgReadMatch && request.method === 'POST') {
            return await handleMarkRead(msgReadMatch[1], request, env);
        }

        // Notifications routes
        if (path === '/api/notifications' && request.method === 'GET') {
            return await handleGetNotifications(request, env);
        }
        if (path === '/api/notifications/read' && request.method === 'POST') {
            return await handleMarkNotificationsRead(request, env);
        }
        if (path === '/api/notifications/unread-count' && request.method === 'GET') {
            return await handleNotificationsUnreadCount(request, env);
        }

        return json({ error: '未找到该接口' }, 404);
    } catch (err) {
        return json({ error: '服务器错误: ' + err.message }, 500);
    }
}

// --- SMS Handler ---

async function handleSendSms(request, env) {
    const { phone } = await request.json();
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        return json({ error: '请输入正确的手机号' }, 400);
    }

    const recent = await env.DB.prepare(
        'SELECT id FROM sms_codes WHERE phone = ? AND expires_at > ? AND used = 0 ORDER BY id DESC LIMIT 1'
    ).bind(phone, Date.now() + 4 * 60 * 1000).first();
    if (recent) {
        return json({ error: '验证码已发送，请60秒后再试' }, 429);
    }

    const code = '123456';
    const expiresAt = Date.now() + 5 * 60 * 1000;
    await env.DB.prepare('INSERT INTO sms_codes (phone, code, expires_at) VALUES (?, ?, ?)')
        .bind(phone, code, expiresAt).run();

    return json({ message: '验证码已发送' });
}

// --- Auth Handlers ---

async function handleRegister(request, env) {
    const { username, password, phone, code } = await request.json();
    if (!username || !password) {
        return json({ error: '账号和密码不能为空' }, 400);
    }
    if (username.length < 2 || username.length > 20) {
        return json({ error: '账号需要2-20个字符' }, 400);
    }
    if (password.length < 6) {
        return json({ error: '密码至少需要6位' }, 400);
    }
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        return json({ error: '请输入正确的手机号' }, 400);
    }
    if (!code) {
        return json({ error: '请输入验证码' }, 400);
    }

    const smsRecord = await env.DB.prepare(
        'SELECT id FROM sms_codes WHERE phone = ? AND code = ? AND expires_at > ? AND used = 0 ORDER BY id DESC LIMIT 1'
    ).bind(phone, code, Date.now()).first();
    if (!smsRecord) {
        return json({ error: '验证码错误或已过期' }, 400);
    }

    const existingUser = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
    if (existingUser) {
        return json({ error: '该账号已存在' }, 409);
    }

    const existingPhone = await env.DB.prepare('SELECT id FROM users WHERE phone = ?').bind(phone).first();
    if (existingPhone) {
        return json({ error: '该手机号已注册' }, 409);
    }

    const passwordHash = await hashPassword(password);
    await env.DB.prepare('INSERT INTO users (username, password_hash, phone, nickname) VALUES (?, ?, ?, ?)')
        .bind(username, passwordHash, phone, '旅行者' + username.slice(-4)).run();

    await env.DB.prepare('UPDATE sms_codes SET used = 1 WHERE id = ?').bind(smsRecord.id).run();

    return json({ message: '注册成功' }, 201);
}

async function handleLogin(request, env) {
    const { username, password } = await request.json();
    if (!username || !password) {
        return json({ error: '账号和密码不能为空' }, 400);
    }

    const user = await env.DB.prepare('SELECT id, username, nickname, phone, password_hash FROM users WHERE username = ?')
        .bind(username).first();

    if (!user) {
        return json({ error: '账号或密码错误' }, 401);
    }

    const passwordHash = await hashPassword(password);
    if (user.password_hash !== passwordHash) {
        return json({ error: '账号或密码错误' }, 401);
    }

    const token = await createToken({ id: user.id, username: user.username }, getSecret(env));
    return json({ token, username: user.username, nickname: user.nickname || user.username, id: user.id, phone: user.phone || '' });
}

// --- Post Handlers ---

async function handleGetPosts(request, env) {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const region = url.searchParams.get('region');
    const season = url.searchParams.get('season');
    const search = url.searchParams.get('search');

    let sql = 'SELECT posts.*, COALESCE(users.nickname, users.username) as nickname FROM posts JOIN users ON posts.user_id = users.id';
    const conditions = [];
    const params = [];

    if (category) { conditions.push('posts.category = ?'); params.push(category); }
    if (region) { conditions.push('posts.region = ?'); params.push(region); }
    if (season) { conditions.push('posts.season = ?'); params.push(season); }
    if (search) {
        conditions.push('(posts.title LIKE ? OR posts.location LIKE ? OR posts.content LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY posts.created_at DESC LIMIT 50';

    const stmt = env.DB.prepare(sql);
    const result = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
    return json(result.results || []);
}

async function handleGetPost(id, request, env) {
    const user = await getUser(request, env);
    const post = await env.DB.prepare(
        'SELECT posts.*, COALESCE(users.nickname, users.username) as nickname FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = ?'
    ).bind(id).first();

    if (!post) {
        return json({ error: '帖子不存在' }, 404);
    }

    let userLiked = false;
    if (user) {
        const like = await env.DB.prepare('SELECT id FROM likes WHERE post_id = ? AND user_id = ?')
            .bind(id, user.id).first();
        userLiked = !!like;
    }

    return json({ ...post, user_liked: userLiked });
}

async function handleCreatePost(request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const { title, content, location, category, region, season, image_url, images } = await request.json();
    if (!title || !content || !location || !category) {
        return json({ error: '标题、内容、地点和分类为必填项' }, 400);
    }

    const imageData = images && images.length > 0 ? JSON.stringify(images) : (image_url || '');

    const result = await env.DB.prepare(
        'INSERT INTO posts (user_id, title, content, location, category, region, season, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(user.id, title, content, location, category, region || '', season || '', imageData).run();

    return json({ id: result.meta.last_row_id, message: '发布成功' }, 201);
}

async function handleToggleLike(postId, request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const existing = await env.DB.prepare('SELECT id FROM likes WHERE post_id = ? AND user_id = ?')
        .bind(postId, user.id).first();

    if (existing) {
        await env.DB.prepare('DELETE FROM likes WHERE id = ?').bind(existing.id).run();
        await env.DB.prepare('UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?').bind(postId).run();
        const post = await env.DB.prepare('SELECT likes_count FROM posts WHERE id = ?').bind(postId).first();
        return json({ liked: false, likes_count: post.likes_count });
    } else {
        await env.DB.prepare('INSERT INTO likes (post_id, user_id) VALUES (?, ?)').bind(postId, user.id).run();
        await env.DB.prepare('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?').bind(postId).run();
        const post = await env.DB.prepare('SELECT likes_count FROM posts WHERE id = ?').bind(postId).first();
        return json({ liked: true, likes_count: post.likes_count });
    }
}

async function handleGetComments(postId, env) {
    const result = await env.DB.prepare(
        'SELECT comments.*, COALESCE(users.nickname, users.username) as nickname FROM comments JOIN users ON comments.user_id = users.id WHERE comments.post_id = ? ORDER BY comments.created_at ASC'
    ).bind(postId).all();
    return json(result.results || []);
}

async function handleAddComment(postId, request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const { content } = await request.json();
    if (!content || !content.trim()) {
        return json({ error: '评论内容不能为空' }, 400);
    }

    await env.DB.prepare('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)')
        .bind(postId, user.id, content.trim()).run();

    return json({ message: '评论成功' }, 201);
}

// --- User Profile Handlers ---

async function handleGetProfile(request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const profile = await env.DB.prepare(
        'SELECT id, username, nickname, phone, qq, gender, avatar, signature, created_at FROM users WHERE id = ?'
    ).bind(user.id).first();

    if (!profile) return json({ error: '用户不存在' }, 404);
    return json(profile);
}

async function handleUpdateProfile(request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const { qq, gender, signature, avatar, nickname } = await request.json();

    let sql, params;
    if (avatar) {
        sql = 'UPDATE users SET nickname = ?, qq = ?, gender = ?, signature = ?, avatar = ? WHERE id = ?';
        params = [nickname || '', qq || '', gender || '', signature || '', avatar, user.id];
    } else {
        sql = 'UPDATE users SET nickname = ?, qq = ?, gender = ?, signature = ? WHERE id = ?';
        params = [nickname || '', qq || '', gender || '', signature || '', user.id];
    }

    await env.DB.prepare(sql).bind(...params).run();
    return json({ message: '资料更新成功' });
}

async function handleGetMyPosts(request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const result = await env.DB.prepare(
        'SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(user.id).all();

    return json(result.results || []);
}

async function handleDeletePost(postId, request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const post = await env.DB.prepare('SELECT user_id FROM posts WHERE id = ?').bind(postId).first();
    if (!post) return json({ error: '帖子不存在' }, 404);
    if (post.user_id !== user.id) return json({ error: '只能删除自己的帖子' }, 403);

    await env.DB.prepare('DELETE FROM comments WHERE post_id = ?').bind(postId).run();
    await env.DB.prepare('DELETE FROM likes WHERE post_id = ?').bind(postId).run();
    await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(postId).run();

    return json({ message: '删除成功' });
}

async function handleUpdatePost(postId, request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const post = await env.DB.prepare('SELECT user_id FROM posts WHERE id = ?').bind(postId).first();
    if (!post) return json({ error: '帖子不存在' }, 404);
    if (post.user_id !== user.id) return json({ error: '只能编辑自己的帖子' }, 403);

    const { title, content, location, category, region, season, image_url, images } = await request.json();
    if (!title || !content || !location || !category) {
        return json({ error: '标题、内容、地点和分类为必填项' }, 400);
    }

    const imageData = images && images.length > 0 ? JSON.stringify(images) : (image_url || '');

    await env.DB.prepare(
        'UPDATE posts SET title = ?, content = ?, location = ?, category = ?, region = ?, season = ?, image_url = ? WHERE id = ?'
    ).bind(title, content, location, category, region || '', season || '', imageData, postId).run();

    return json({ message: '更新成功' });
}

// --- Friends Handlers ---

async function handleSearchUsers(request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    if (!q || q.trim().length < 1) return json([]);

    const result = await env.DB.prepare(
        'SELECT id, username, nickname, avatar FROM users WHERE (username LIKE ? OR nickname LIKE ?) AND id != ? LIMIT 20'
    ).bind(`%${q}%`, `%${q}%`, user.id).all();

    return json(result.results || []);
}

async function handleGetFriends(request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const result = await env.DB.prepare(`
        SELECT u.id, u.username, u.nickname, u.avatar, f.created_at as friend_since
        FROM friendships f
        JOIN users u ON (CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END) = u.id
        WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted'
    `).bind(user.id, user.id, user.id).all();

    return json(result.results || []);
}

async function handleFriendRequest(request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const { target_user_id } = await request.json();
    if (!target_user_id) return json({ error: '请指定用户' }, 400);
    if (target_user_id === user.id) return json({ error: '不能添加自己为好友' }, 400);

    const target = await env.DB.prepare('SELECT id, username FROM users WHERE id = ?').bind(target_user_id).first();
    if (!target) return json({ error: '用户不存在' }, 404);

    const existing = await env.DB.prepare(
        'SELECT id, status FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)'
    ).bind(user.id, target_user_id, target_user_id, user.id).first();

    if (existing) {
        if (existing.status === 'accepted') return json({ error: '你们已经是好友了' }, 400);
        if (existing.status === 'pending') return json({ error: '已发送过申请，请等待对方回复' }, 400);
    }

    await env.DB.prepare('INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, ?)')
        .bind(user.id, target_user_id, 'pending').run();

    const senderName = user.username;
    await env.DB.prepare('INSERT INTO notifications (user_id, type, content, related_id) VALUES (?, ?, ?, ?)')
        .bind(target_user_id, 'friend_request', `${senderName} 请求添加你为好友`, user.id).run();

    return json({ message: '好友申请已发送' });
}

async function handleFriendRespond(request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const { friendship_id, action } = await request.json();
    if (!friendship_id || !['accept', 'reject'].includes(action)) {
        return json({ error: '参数错误' }, 400);
    }

    const friendship = await env.DB.prepare(
        'SELECT * FROM friendships WHERE id = ? AND friend_id = ? AND status = ?'
    ).bind(friendship_id, user.id, 'pending').first();

    if (!friendship) return json({ error: '申请不存在或已处理' }, 404);

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    await env.DB.prepare('UPDATE friendships SET status = ? WHERE id = ?').bind(newStatus, friendship_id).run();

    if (action === 'accept') {
        const responder = await env.DB.prepare('SELECT nickname, username FROM users WHERE id = ?').bind(user.id).first();
        const name = responder.nickname || responder.username;
        await env.DB.prepare('INSERT INTO notifications (user_id, type, content, related_id) VALUES (?, ?, ?, ?)')
            .bind(friendship.user_id, 'friend_accepted', `${name} 接受了你的好友申请`, user.id).run();
    }

    return json({ message: action === 'accept' ? '已添加好友' : '已拒绝申请' });
}

// --- Messages Handlers ---

async function handleGetConversations(request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const result = await env.DB.prepare(`
        SELECT
            u.id as user_id, u.username, u.nickname, u.avatar,
            m.content as last_message, m.created_at as last_time,
            (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND receiver_id = ? AND is_read = 0) as unread_count
        FROM users u
        INNER JOIN (
            SELECT
                CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as other_id,
                MAX(id) as max_id
            FROM messages
            WHERE sender_id = ? OR receiver_id = ?
            GROUP BY other_id
        ) latest ON u.id = latest.other_id
        INNER JOIN messages m ON m.id = latest.max_id
        ORDER BY m.created_at DESC
    `).bind(user.id, user.id, user.id, user.id).all();

    return json(result.results || []);
}

async function handleGetMessages(userId, request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const result = await env.DB.prepare(`
        SELECT id, sender_id, receiver_id, content, is_read, created_at
        FROM messages
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
        ORDER BY created_at ASC LIMIT 100
    `).bind(user.id, parseInt(userId), parseInt(userId), user.id).all();

    return json(result.results || []);
}

async function handleSendMessage(userId, request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const { content } = await request.json();
    if (!content || !content.trim()) return json({ error: '消息不能为空' }, 400);

    const targetId = parseInt(userId);
    const friendship = await env.DB.prepare(
        'SELECT id FROM friendships WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) AND status = ?'
    ).bind(user.id, targetId, targetId, user.id, 'accepted').first();

    if (!friendship) return json({ error: '只能给好友发消息' }, 403);

    await env.DB.prepare('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)')
        .bind(user.id, targetId, content.trim()).run();

    return json({ message: '发送成功' }, 201);
}

async function handleMarkRead(userId, request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    await env.DB.prepare('UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0')
        .bind(parseInt(userId), user.id).run();

    return json({ message: '已标记已读' });
}

async function handleMessagesUnreadCount(request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const result = await env.DB.prepare('SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0')
        .bind(user.id).first();

    return json({ count: result.count || 0 });
}

// --- Notifications Handlers ---

async function handleGetNotifications(request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const result = await env.DB.prepare(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
    ).bind(user.id).all();

    const notifications = result.results || [];
    for (const n of notifications) {
        if (n.type === 'friend_request' && !n.is_read) {
            const friendship = await env.DB.prepare(
                'SELECT id, status FROM friendships WHERE user_id = ? AND friend_id = ? AND status = ?'
            ).bind(n.related_id, user.id, 'pending').first();
            n.friendship_id = friendship ? friendship.id : null;
        }
    }

    return json(notifications);
}

async function handleMarkNotificationsRead(request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    await env.DB.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0')
        .bind(user.id).run();

    return json({ message: '已全部标记已读' });
}

async function handleNotificationsUnreadCount(request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const result = await env.DB.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0')
        .bind(user.id).first();

    return json({ count: result.count || 0 });
}
