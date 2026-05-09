// Shared helpers for all API routes

export function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}

export async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function createToken(payload, secret) {
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

export async function verifyToken(token, secret) {
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

export async function getUser(request, env) {
    const auth = request.headers.get('Authorization');
    if (!auth || !auth.startsWith('Bearer ')) return null;
    return verifyToken(auth.slice(7), env.JWT_SECRET);
}
