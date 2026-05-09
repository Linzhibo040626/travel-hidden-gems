import { json, hashPassword, createToken, verifyToken, getUser } from './_helpers.js';

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
        return json({});
    }

    try {
        // Auth routes
        if (path === '/api/auth/register' && request.method === 'POST') {
            return await handleRegister(request, env);
        }
        if (path === '/api/auth/login' && request.method === 'POST') {
            return await handleLogin(request, env);
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

        return json({ error: '未找到该接口' }, 404);
    } catch (err) {
        return json({ error: '服务器错误: ' + err.message }, 500);
    }
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
