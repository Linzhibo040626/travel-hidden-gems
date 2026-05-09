export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        if (request.method === 'OPTIONS') {
            return corsResponse(new Response(null, { status: 204 }));
        }

        try {
            if (path === '/api/auth/register' && request.method === 'POST') {
                return corsResponse(await handleRegister(request, env));
            }
            if (path === '/api/auth/login' && request.method === 'POST') {
                return corsResponse(await handleLogin(request, env));
            }
            if (path === '/api/posts' && request.method === 'GET') {
                return corsResponse(await handleGetPosts(request, env));
            }
            if (path === '/api/posts' && request.method === 'POST') {
                return corsResponse(await handleCreatePost(request, env));
            }
            if (path.match(/^\/api\/posts\/\d+$/) && request.method === 'GET') {
                const id = path.split('/').pop();
                return corsResponse(await handleGetPost(id, request, env));
            }
            if (path.match(/^\/api\/posts\/\d+\/like$/) && request.method === 'POST') {
                const id = path.split('/')[3];
                return corsResponse(await handleToggleLike(id, request, env));
            }
            if (path.match(/^\/api\/posts\/\d+\/comments$/) && request.method === 'GET') {
                const id = path.split('/')[3];
                return corsResponse(await handleGetComments(id, env));
            }
            if (path.match(/^\/api\/posts\/\d+\/comments$/) && request.method === 'POST') {
                const id = path.split('/')[3];
                return corsResponse(await handleAddComment(id, request, env));
            }

            return corsResponse(json({ error: '未找到该接口' }, 404));
        } catch (err) {
            return corsResponse(json({ error: '服务器错误: ' + err.message }, 500));
        }
    }
};

// --- Helpers ---

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

function corsResponse(response) {
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return new Response(response.body, {
        status: response.status,
        headers
    });
}

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createToken(payload, secret) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 3600 * 1000 }));
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(header + '.' + body));
    const sig = btoa(String.fromCharCode(...new Uint8Array(signature)));
    return header + '.' + body + '.' + sig;
}

async function verifyToken(token, secret) {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
        );
        const signatureBytes = Uint8Array.from(atob(parts[2]), c => c.charCodeAt(0));
        const valid = await crypto.subtle.verify('HMAC', key, signatureBytes, encoder.encode(parts[0] + '.' + parts[1]));
        if (!valid) return null;
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp < Date.now()) return null;
        return payload;
    } catch {
        return null;
    }
}

async function getUser(request, env) {
    const auth = request.headers.get('Authorization');
    if (!auth || !auth.startsWith('Bearer ')) return null;
    return verifyToken(auth.slice(7), env.JWT_SECRET);
}

// --- Auth Handlers ---

async function handleRegister(request, env) {
    const { username, password } = await request.json();
    if (!username || !password) {
        return json({ error: '用户名和密码不能为空' }, 400);
    }
    if (username.length < 2 || username.length > 20) {
        return json({ error: '用户名需要2-20个字符' }, 400);
    }
    if (password.length < 6) {
        return json({ error: '密码至少需要6位' }, 400);
    }

    const existing = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
    if (existing) {
        return json({ error: '用户名已存在' }, 409);
    }

    const passwordHash = await hashPassword(password);
    await env.DB.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
        .bind(username, passwordHash).run();

    return json({ message: '注册成功' }, 201);
}

async function handleLogin(request, env) {
    const { username, password } = await request.json();
    if (!username || !password) {
        return json({ error: '用户名和密码不能为空' }, 400);
    }

    const user = await env.DB.prepare('SELECT id, username, password_hash FROM users WHERE username = ?')
        .bind(username).first();

    if (!user) {
        return json({ error: '用户名或密码错误' }, 401);
    }

    const passwordHash = await hashPassword(password);
    if (user.password_hash !== passwordHash) {
        return json({ error: '用户名或密码错误' }, 401);
    }

    const token = await createToken({ id: user.id, username: user.username }, env.JWT_SECRET);
    return json({ token, username: user.username, id: user.id });
}

// --- Post Handlers ---

async function handleGetPosts(request, env) {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const region = url.searchParams.get('region');
    const season = url.searchParams.get('season');
    const search = url.searchParams.get('search');

    let sql = 'SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id';
    const conditions = [];
    const params = [];

    if (category) { conditions.push('posts.category = ?'); params.push(category); }
    if (region) { conditions.push('posts.region = ?'); params.push(region); }
    if (season) { conditions.push('posts.season = ?'); params.push(season); }
    if (search) { conditions.push('(posts.title LIKE ? OR posts.location LIKE ? OR posts.content LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

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
        'SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = ?'
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

    const { title, content, location, category, region, season, image_url } = await request.json();
    if (!title || !content || !location || !category) {
        return json({ error: '标题、内容、地点和分类为必填项' }, 400);
    }

    const result = await env.DB.prepare(
        'INSERT INTO posts (user_id, title, content, location, category, region, season, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(user.id, title, content, location, category, region || '', season || '', image_url || '').run();

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
        'SELECT comments.*, users.username FROM comments JOIN users ON comments.user_id = users.id WHERE comments.post_id = ? ORDER BY comments.created_at ASC'
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
