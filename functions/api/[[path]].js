import { json, hashPassword, createToken, verifyToken, getUser, getSecret } from './_helpers.js';

// --- City Card Data ---
const TOP_50_CITIES = [
    { city: '北京', province: '北京' }, { city: '上海', province: '上海' },
    { city: '广州', province: '广东' }, { city: '深圳', province: '广东' },
    { city: '成都', province: '四川' }, { city: '杭州', province: '浙江' },
    { city: '重庆', province: '重庆' }, { city: '武汉', province: '湖北' },
    { city: '西安', province: '陕西' }, { city: '苏州', province: '江苏' },
    { city: '南京', province: '江苏' }, { city: '天津', province: '天津' },
    { city: '长沙', province: '湖南' }, { city: '郑州', province: '河南' },
    { city: '东莞', province: '广东' }, { city: '青岛', province: '山东' },
    { city: '昆明', province: '云南' }, { city: '大连', province: '辽宁' },
    { city: '宁波', province: '浙江' }, { city: '厦门', province: '福建' },
    { city: '沈阳', province: '辽宁' }, { city: '济南', province: '山东' },
    { city: '哈尔滨', province: '黑龙江' }, { city: '福州', province: '福建' },
    { city: '佛山', province: '广东' }, { city: '合肥', province: '安徽' },
    { city: '无锡', province: '江苏' }, { city: '石家庄', province: '河北' },
    { city: '南宁', province: '广西' }, { city: '贵阳', province: '贵州' },
    { city: '太原', province: '山西' }, { city: '南昌', province: '江西' },
    { city: '珠海', province: '广东' }, { city: '温州', province: '浙江' },
    { city: '兰州', province: '甘肃' }, { city: '长春', province: '吉林' },
    { city: '烟台', province: '山东' }, { city: '泉州', province: '福建' },
    { city: '常州', province: '江苏' }, { city: '徐州', province: '江苏' },
    { city: '桂林', province: '广西' }, { city: '三亚', province: '海南' },
    { city: '丽江', province: '云南' }, { city: '拉萨', province: '西藏' },
    { city: '乌鲁木齐', province: '新疆' }, { city: '呼和浩特', province: '内蒙古' },
    { city: '海口', province: '海南' }, { city: '银川', province: '宁夏' },
    { city: '西宁', province: '青海' }, { city: '洛阳', province: '河南' },
];

const ALL_CITIES_BY_PROVINCE = {
    '北京': ['北京'], '天津': ['天津'], '上海': ['上海'], '重庆': ['重庆'],
    '河北': ['石家庄','唐山','秦皇岛','邯郸','邢台','保定','张家口','承德','沧州','廊坊','衡水'],
    '山西': ['太原','大同','阳泉','长治','晋城','朔州','晋中','运城','忻州','临汾','吕梁'],
    '内蒙古': ['呼和浩特','包头','乌海','赤峰','通辽','鄂尔多斯','呼伦贝尔','巴彦淖尔','乌兰察布','兴安盟','锡林郭勒盟','阿拉善盟'],
    '辽宁': ['沈阳','大连','鞍山','抚顺','本溪','丹东','锦州','营口','阜新','辽阳','盘锦','铁岭','朝阳','葫芦岛'],
    '吉林': ['长春','吉林','四平','辽源','通化','白山','松原','白城','延边'],
    '黑龙江': ['哈尔滨','齐齐哈尔','鸡西','鹤岗','双鸭山','大庆','伊春','佳木斯','七台河','牡丹江','黑河','绥化','大兴安岭'],
    '江苏': ['南京','无锡','徐州','常州','苏州','南通','连云港','淮安','盐城','扬州','镇江','泰州','宿迁'],
    '浙江': ['杭州','宁波','温州','嘉兴','湖州','绍兴','金华','衢州','舟山','台州','丽水'],
    '安徽': ['合肥','芜湖','蚌埠','淮南','马鞍山','淮北','铜陵','安庆','黄山','滁州','阜阳','宿州','六安','亳州','池州','宣城'],
    '福建': ['福州','厦门','莆田','三明','泉州','漳州','南平','龙岩','宁德'],
    '江西': ['南昌','景德镇','萍乡','九江','新余','鹰潭','赣州','吉安','宜春','抚州','上饶'],
    '山东': ['济南','青岛','淄博','枣庄','东营','烟台','潍坊','济宁','泰安','威海','日照','临沂','德州','聊城','滨州','菏泽'],
    '河南': ['郑州','开封','洛阳','平顶山','安阳','鹤壁','新乡','焦作','濮阳','许昌','漯河','三门峡','南阳','商丘','信阳','周口','驻马店'],
    '湖北': ['武汉','黄石','十堰','宜昌','襄阳','鄂州','荆门','孝感','荆州','黄冈','咸宁','随州','恩施'],
    '湖南': ['长沙','株洲','湘潭','衡阳','邵阳','岳阳','常德','张家界','益阳','郴州','永州','怀化','娄底','湘西'],
    '广东': ['广州','韶关','深圳','珠海','汕头','佛山','江门','湛江','茂名','肇庆','惠州','梅州','汕尾','河源','阳江','清远','东莞','中山','潮州','揭阳','云浮'],
    '广西': ['南宁','柳州','桂林','梧州','北海','防城港','钦州','贵港','玉林','百色','贺州','河池','来宾','崇左'],
    '海南': ['海口','三亚','三沙','儋州','五指山','琼海','文昌','万宁','东方','澄迈','临高','定安','屯昌','昌江','白沙','琼中','保亭','陵水','乐东'],
    '四川': ['成都','自贡','攀枝花','泸州','德阳','绵阳','广元','遂宁','内江','乐山','南充','眉山','宜宾','广安','达州','雅安','巴中','资阳','阿坝','甘孜','凉山'],
    '贵州': ['贵阳','六盘水','遵义','安顺','毕节','铜仁','黔西南','黔东南','黔南'],
    '云南': ['昆明','曲靖','玉溪','保山','昭通','丽江','普洱','临沧','楚雄','红河','文山','西双版纳','大理','德宏','怒江','迪庆'],
    '西藏': ['拉萨','日喀则','昌都','林芝','山南','那曲','阿里'],
    '陕西': ['西安','铜川','宝鸡','咸阳','渭南','延安','汉中','榆林','安康','商洛'],
    '甘肃': ['兰州','嘉峪关','金昌','白银','天水','武威','张掖','平凉','酒泉','庆阳','定西','陇南','临夏','甘南'],
    '青海': ['西宁','海东','海北','黄南','海南州','果洛','玉树','海西'],
    '宁夏': ['银川','石嘴山','吴忠','固原','中卫'],
    '新疆': ['乌鲁木齐','克拉玛依','吐鲁番','哈密','昌吉','博尔塔拉','巴音郭楞','阿克苏','克孜勒苏','喀什','和田','伊犁','塔城','阿勒泰'],
    '台湾': ['台湾'],
    '香港': ['香港'],
    '澳门': ['澳门'],
};

const TOP_50_SET = new Set(TOP_50_CITIES.map(c => c.city));
const OTHER_CITIES = [];
for (const [province, cities] of Object.entries(ALL_CITIES_BY_PROVINCE)) {
    for (const city of cities) {
        if (!TOP_50_SET.has(city)) {
            OTHER_CITIES.push({ city, province });
        }
    }
}

function drawCity() {
    if (Math.random() < 0.95) {
        return TOP_50_CITIES[Math.floor(Math.random() * TOP_50_CITIES.length)];
    }
    return OTHER_CITIES[Math.floor(Math.random() * OTHER_CITIES.length)];
}

let migrated = false;
async function runMigrations(env) {
    if (migrated) return;
    const stmts = [
        env.DB.prepare("ALTER TABLE users ADD COLUMN nickname TEXT DEFAULT ''"),
        env.DB.prepare("ALTER TABLE users ADD COLUMN qq TEXT DEFAULT ''"),
        env.DB.prepare("ALTER TABLE users ADD COLUMN gender TEXT DEFAULT ''"),
        env.DB.prepare("ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT ''"),
        env.DB.prepare("ALTER TABLE users ADD COLUMN signature TEXT DEFAULT ''"),
        env.DB.prepare("ALTER TABLE users ADD COLUMN phone TEXT DEFAULT ''"),
        env.DB.prepare("ALTER TABLE posts ADD COLUMN favorites_count INTEGER DEFAULT 0"),
        env.DB.prepare("ALTER TABLE posts ADD COLUMN comments_count INTEGER DEFAULT 0"),
        env.DB.prepare("ALTER TABLE comments ADD COLUMN reply_to INTEGER DEFAULT NULL"),
    ];
    for (const s of stmts) { try { await s.run(); } catch {} }
    await env.DB.batch([
        env.DB.prepare(`CREATE TABLE IF NOT EXISTS sms_codes (id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT NOT NULL, code TEXT NOT NULL, expires_at INTEGER NOT NULL, used INTEGER DEFAULT 0)`),
        env.DB.prepare(`CREATE TABLE IF NOT EXISTS friendships (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, friend_id INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, friend_id))`),
        env.DB.prepare(`CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, sender_id INTEGER NOT NULL, receiver_id INTEGER NOT NULL, content TEXT NOT NULL, is_read INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
        env.DB.prepare(`CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, type TEXT NOT NULL, content TEXT NOT NULL, related_id INTEGER, is_read INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`),
        env.DB.prepare(`CREATE TABLE IF NOT EXISTS favorites (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL, user_id INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(post_id, user_id))`),
        env.DB.prepare(`CREATE TABLE IF NOT EXISTS checkins (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, checkin_date TEXT NOT NULL, streak INTEGER NOT NULL DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, checkin_date))`),
        env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_cards (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, city_name TEXT NOT NULL, province TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 1, first_drawn_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, city_name))`),
        env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_fragments (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL UNIQUE, count INTEGER NOT NULL DEFAULT 0)`),
        env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_badges (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, badge_type TEXT NOT NULL, badge_name TEXT NOT NULL, earned_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, badge_type, badge_name))`),
        env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_draws (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL UNIQUE, available_draws INTEGER NOT NULL DEFAULT 0)`),
    ]);
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

        // Batch seed route (temporary)
        if (path === '/api/seed-posts' && request.method === 'POST') {
            return await handleSeedPosts(request, env);
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

        const favMatch = path.match(/^\/api\/posts\/(\d+)\/favorite$/);
        if (favMatch && request.method === 'POST') {
            return await handleToggleFavorite(favMatch[1], request, env);
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

        // Checkin & Card routes
        if (path === '/api/checkin' && request.method === 'POST') {
            return await handleCheckin(request, env);
        }
        if (path === '/api/checkin/status' && request.method === 'GET') {
            return await handleCheckinStatus(request, env);
        }
        if (path === '/api/cards/draw' && request.method === 'POST') {
            return await handleCardDraw(request, env);
        }
        if (path === '/api/cards/collection' && request.method === 'GET') {
            return await handleGetCollection(request, env);
        }
        if (path === '/api/cards/decompose' && request.method === 'POST') {
            return await handleDecompose(request, env);
        }
        if (path === '/api/cards/fragment-draw' && request.method === 'POST') {
            return await handleFragmentDraw(request, env);
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

async function handleSeedPosts(request, env) {
    const { posts, secret } = await request.json();
    if (secret !== 'biechuyo-seed-2024') return json({ error: 'forbidden' }, 403);
    let adminUser = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind('official').first();
    if (!adminUser) {
        const passwordHash = await hashPassword('official123456');
        await env.DB.prepare('INSERT INTO users (username, password_hash, phone, nickname) VALUES (?, ?, ?, ?)')
            .bind('official', passwordHash, '10000000000', '别处游官方').run();
        adminUser = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind('official').first();
    }
    let count = 0;
    for (const p of posts) {
        const imageData = p.images && p.images.length > 0 ? JSON.stringify(p.images) : '';
        await env.DB.prepare(
            'INSERT INTO posts (user_id, title, content, location, category, region, season, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(adminUser.id, p.title, p.content, p.location, p.category, p.region || '', p.season || '', imageData).run();
        count++;
    }
    return json({ message: `成功创建${count}篇帖子` });
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
    const sort = url.searchParams.get('sort');

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

    if (sort === 'likes') {
        sql += ' ORDER BY posts.likes_count DESC, posts.created_at DESC';
    } else if (sort === 'favorites') {
        sql += ' ORDER BY posts.favorites_count DESC, posts.created_at DESC';
    } else if (sort === 'comments') {
        sql += ' ORDER BY posts.comments_count DESC, posts.created_at DESC';
    } else {
        sql += ' ORDER BY posts.created_at DESC';
    }
    sql += ' LIMIT 50';

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
    let userFavorited = false;
    if (user) {
        const [like, fav] = await Promise.all([
            env.DB.prepare('SELECT id FROM likes WHERE post_id = ? AND user_id = ?').bind(id, user.id).first(),
            env.DB.prepare('SELECT id FROM favorites WHERE post_id = ? AND user_id = ?').bind(id, user.id).first()
        ]);
        userLiked = !!like;
        userFavorited = !!fav;
    }

    return json({ ...post, user_liked: userLiked, user_favorited: userFavorited });
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

async function handleToggleFavorite(postId, request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const existing = await env.DB.prepare('SELECT id FROM favorites WHERE post_id = ? AND user_id = ?')
        .bind(postId, user.id).first();

    if (existing) {
        await env.DB.prepare('DELETE FROM favorites WHERE id = ?').bind(existing.id).run();
        await env.DB.prepare('UPDATE posts SET favorites_count = favorites_count - 1 WHERE id = ?').bind(postId).run();
        const post = await env.DB.prepare('SELECT favorites_count FROM posts WHERE id = ?').bind(postId).first();
        return json({ favorited: false, favorites_count: post.favorites_count });
    } else {
        await env.DB.prepare('INSERT INTO favorites (post_id, user_id) VALUES (?, ?)').bind(postId, user.id).run();
        await env.DB.prepare('UPDATE posts SET favorites_count = favorites_count + 1 WHERE id = ?').bind(postId).run();
        const post = await env.DB.prepare('SELECT favorites_count FROM posts WHERE id = ?').bind(postId).first();
        return json({ favorited: true, favorites_count: post.favorites_count });
    }
}

async function handleGetComments(postId, env) {
    const result = await env.DB.prepare(
        `SELECT c.*, COALESCE(u.nickname, u.username) as nickname,
         COALESCE(ru.nickname, ru.username) as reply_to_nickname
         FROM comments c
         JOIN users u ON c.user_id = u.id
         LEFT JOIN comments rc ON c.reply_to = rc.id
         LEFT JOIN users ru ON rc.user_id = ru.id
         WHERE c.post_id = ? ORDER BY c.created_at ASC`
    ).bind(postId).all();
    return json(result.results || []);
}

async function handleAddComment(postId, request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const { content, reply_to } = await request.json();
    if (!content || !content.trim()) {
        return json({ error: '评论内容不能为空' }, 400);
    }

    await env.DB.prepare('INSERT INTO comments (post_id, user_id, content, reply_to) VALUES (?, ?, ?, ?)')
        .bind(postId, user.id, content.trim(), reply_to || null).run();
    await env.DB.prepare('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?').bind(postId).run();

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

// --- Checkin & Card Handlers ---

function getTodayDate() {
    const now = new Date();
    const beijing = new Date(now.getTime() + (now.getTimezoneOffset() + 480) * 60000);
    return beijing.toISOString().split('T')[0];
}

function getYesterdayDate() {
    const now = new Date();
    const beijing = new Date(now.getTime() + (now.getTimezoneOffset() + 480) * 60000 - 86400000);
    return beijing.toISOString().split('T')[0];
}

async function handleCheckin(request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const today = getTodayDate();
    const existing = await env.DB.prepare('SELECT id FROM checkins WHERE user_id = ? AND checkin_date = ?')
        .bind(user.id, today).first();
    if (existing) return json({ error: '今日已签到' }, 400);

    const yesterday = getYesterdayDate();
    const yesterdayCheckin = await env.DB.prepare('SELECT streak FROM checkins WHERE user_id = ? AND checkin_date = ?')
        .bind(user.id, yesterday).first();
    const streak = yesterdayCheckin ? yesterdayCheckin.streak + 1 : 1;

    await env.DB.prepare('INSERT INTO checkins (user_id, checkin_date, streak) VALUES (?, ?, ?)')
        .bind(user.id, today, streak).run();

    let drawsEarned = 1;
    if (streak % 3 === 0) drawsEarned = 2;

    const drawsRow = await env.DB.prepare('SELECT available_draws FROM user_draws WHERE user_id = ?').bind(user.id).first();
    if (drawsRow) {
        await env.DB.prepare('UPDATE user_draws SET available_draws = available_draws + ? WHERE user_id = ?')
            .bind(drawsEarned, user.id).run();
    } else {
        await env.DB.prepare('INSERT INTO user_draws (user_id, available_draws) VALUES (?, ?)')
            .bind(user.id, drawsEarned).run();
    }

    const updated = await env.DB.prepare('SELECT available_draws FROM user_draws WHERE user_id = ?').bind(user.id).first();
    return json({ streak, draws_earned: drawsEarned, available_draws: updated.available_draws });
}

async function handleCheckinStatus(request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const today = getTodayDate();
    const todayCheckin = await env.DB.prepare('SELECT streak FROM checkins WHERE user_id = ? AND checkin_date = ?')
        .bind(user.id, today).first();

    let streak = 0;
    if (todayCheckin) {
        streak = todayCheckin.streak;
    } else {
        const yesterday = getYesterdayDate();
        const yc = await env.DB.prepare('SELECT streak FROM checkins WHERE user_id = ? AND checkin_date = ?')
            .bind(user.id, yesterday).first();
        if (yc) streak = yc.streak;
    }

    const drawsRow = await env.DB.prepare('SELECT available_draws FROM user_draws WHERE user_id = ?').bind(user.id).first();
    return json({
        checked_in_today: !!todayCheckin,
        streak,
        available_draws: drawsRow ? drawsRow.available_draws : 0
    });
}

async function checkAndAwardBadges(userId, province, env) {
    const provinceCities = ALL_CITIES_BY_PROVINCE[province];
    if (!provinceCities) return null;

    const collected = await env.DB.prepare(
        'SELECT COUNT(DISTINCT city_name) as cnt FROM user_cards WHERE user_id = ? AND province = ?'
    ).bind(userId, province).first();

    if (collected.cnt >= provinceCities.length) {
        const existingBadge = await env.DB.prepare(
            'SELECT id FROM user_badges WHERE user_id = ? AND badge_type = ? AND badge_name = ?'
        ).bind(userId, 'province', province).first();
        if (!existingBadge) {
            await env.DB.prepare('INSERT INTO user_badges (user_id, badge_type, badge_name) VALUES (?, ?, ?)')
                .bind(userId, 'province', province).run();

            const totalProvinces = Object.keys(ALL_CITIES_BY_PROVINCE).length;
            const earnedProvinces = await env.DB.prepare(
                "SELECT COUNT(*) as cnt FROM user_badges WHERE user_id = ? AND badge_type = 'province'"
            ).bind(userId).first();
            if (earnedProvinces.cnt >= totalProvinces) {
                const nationalExists = await env.DB.prepare(
                    "SELECT id FROM user_badges WHERE user_id = ? AND badge_type = 'national'"
                ).bind(userId).first();
                if (!nationalExists) {
                    await env.DB.prepare("INSERT INTO user_badges (user_id, badge_type, badge_name) VALUES (?, 'national', '国章')")
                        .bind(userId).run();
                    return '国章';
                }
            }
            return province + '省章';
        }
    }
    return null;
}

async function performDraw(userId, env) {
    const { city, province } = drawCity();

    const existingCard = await env.DB.prepare('SELECT id, count FROM user_cards WHERE user_id = ? AND city_name = ?')
        .bind(userId, city).first();

    let isDuplicate = false;
    if (existingCard) {
        await env.DB.prepare('UPDATE user_cards SET count = count + 1 WHERE id = ?').bind(existingCard.id).run();
        isDuplicate = true;
    } else {
        await env.DB.prepare('INSERT INTO user_cards (user_id, city_name, province) VALUES (?, ?, ?)')
            .bind(userId, city, province).run();
    }

    const newBadge = await checkAndAwardBadges(userId, province, env);
    return { city, province, is_duplicate: isDuplicate, new_badge: newBadge };
}

async function handleCardDraw(request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const drawsRow = await env.DB.prepare('SELECT available_draws FROM user_draws WHERE user_id = ?').bind(user.id).first();
    if (!drawsRow || drawsRow.available_draws < 1) {
        return json({ error: '没有可用的抽卡次数' }, 400);
    }

    await env.DB.prepare('UPDATE user_draws SET available_draws = available_draws - 1 WHERE user_id = ?').bind(user.id).run();
    const result = await performDraw(user.id, env);
    const updated = await env.DB.prepare('SELECT available_draws FROM user_draws WHERE user_id = ?').bind(user.id).first();
    return json({ ...result, available_draws: updated.available_draws });
}

async function handleGetCollection(request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const [cards, fragments, badges, draws] = await Promise.all([
        env.DB.prepare('SELECT city_name, province, count FROM user_cards WHERE user_id = ? ORDER BY province, city_name').bind(user.id).all(),
        env.DB.prepare('SELECT count FROM user_fragments WHERE user_id = ?').bind(user.id).first(),
        env.DB.prepare('SELECT badge_type, badge_name, earned_at FROM user_badges WHERE user_id = ?').bind(user.id).all(),
        env.DB.prepare('SELECT available_draws FROM user_draws WHERE user_id = ?').bind(user.id).first(),
    ]);

    const provinceProgress = {};
    for (const [prov, cities] of Object.entries(ALL_CITIES_BY_PROVINCE)) {
        provinceProgress[prov] = { total: cities.length, collected: 0, cities };
    }
    for (const card of (cards.results || [])) {
        if (provinceProgress[card.province]) {
            provinceProgress[card.province].collected++;
        }
    }

    return json({
        cards: cards.results || [],
        fragments: fragments ? fragments.count : 0,
        badges: badges.results || [],
        available_draws: draws ? draws.available_draws : 0,
        province_progress: provinceProgress
    });
}

async function handleDecompose(request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const { city_name } = await request.json();
    if (!city_name) return json({ error: '请指定城市' }, 400);

    const card = await env.DB.prepare('SELECT id, count FROM user_cards WHERE user_id = ? AND city_name = ?')
        .bind(user.id, city_name).first();
    if (!card || card.count < 2) {
        return json({ error: '该城市卡数量不足，无法分解' }, 400);
    }

    await env.DB.prepare('UPDATE user_cards SET count = count - 1 WHERE id = ?').bind(card.id).run();

    const fragRow = await env.DB.prepare('SELECT count FROM user_fragments WHERE user_id = ?').bind(user.id).first();
    if (fragRow) {
        await env.DB.prepare('UPDATE user_fragments SET count = count + 1 WHERE user_id = ?').bind(user.id).run();
    } else {
        await env.DB.prepare('INSERT INTO user_fragments (user_id, count) VALUES (?, 1)').bind(user.id).run();
    }

    const updated = await env.DB.prepare('SELECT count FROM user_fragments WHERE user_id = ?').bind(user.id).first();
    return json({ fragments_count: updated.count });
}

async function handleFragmentDraw(request, env) {
    const user = await getUser(request, env);
    if (!user) return json({ error: '请先登录' }, 401);

    const fragRow = await env.DB.prepare('SELECT count FROM user_fragments WHERE user_id = ?').bind(user.id).first();
    if (!fragRow || fragRow.count < 3) {
        return json({ error: '碎片不足，需要3个碎片' }, 400);
    }

    await env.DB.prepare('UPDATE user_fragments SET count = count - 3 WHERE user_id = ?').bind(user.id).run();
    const result = await performDraw(user.id, env);
    const updatedFrag = await env.DB.prepare('SELECT count FROM user_fragments WHERE user_id = ?').bind(user.id).first();
    return json({ ...result, fragments_count: updatedFrag.count });
}
