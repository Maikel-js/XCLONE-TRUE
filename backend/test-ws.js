const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;

function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const req = http.request({
            host: HOST,
            port: PORT,
            method,
            path,
            headers: {
                'Content-Type': 'application/json',
                ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        }, (res) => {
            let chunks = '';
            res.on('data', (c) => chunks += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(chunks) }); }
                catch { resolve({ status: res.statusCode, body: chunks }); }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

function openWs(token) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(`ws://${HOST}:${PORT}/?token=${token}`, { perMessageDeflate: false });
        const messages = [];
        let resolveReady;
        const readyPromise = new Promise((r) => { resolveReady = r; });
        ws.on('message', (m) => {
            const parsed = JSON.parse(m.toString());
            messages.push(parsed);
            resolveReady(parsed);
        });
        ws.once('open', () => readyPromise.then((p) => resolve({ ws, ready: p, messages })));
        ws.once('error', reject);
    });
}

function waitFor(messages, type, timeoutMs = 3000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const tick = () => {
            const found = messages.find((m) => m.type === type);
            if (found) return resolve(found);
            if (Date.now() - start > timeoutMs) return reject(new Error(`Timeout esperando ${type}`));
            setTimeout(tick, 50);
        };
        tick();
    });
}

function uniqueEmail() {
    return `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@test.com`;
}

(async () => {
    const stamp = Date.now();

    console.log('--- Registro de usuarios ---');
    const aliceReg = await request('POST', '/auth/register', {
        username: `alice_${stamp}`,
        email: uniqueEmail(),
        displayName: 'Alice',
        password: 'secret123'
    });
    if (aliceReg.status >= 400) throw new Error('Registro Alice fallo: ' + JSON.stringify(aliceReg.body));
    const aliceLogin = await request('POST', '/auth/login', {
        email: aliceReg.body.email,
        password: 'secret123'
    });
    if (aliceLogin.status !== 200) throw new Error('Login Alice fallo');
    const aliceToken = aliceLogin.body.token;

    const bobReg = await request('POST', '/auth/register', {
        username: `bob_${stamp}`,
        email: uniqueEmail(),
        displayName: 'Bob',
        password: 'secret123'
    });
    if (bobReg.status >= 400) throw new Error('Registro Bob fallo: ' + JSON.stringify(bobReg.body));
    const bobLogin = await request('POST', '/auth/login', {
        email: bobReg.body.email,
        password: 'secret123'
    });
    if (bobLogin.status !== 200) throw new Error('Login Bob fallo');
    const bobToken = bobLogin.body.token;

    console.log('--- WS: conexion sin token (debe fallar) ---');
    const denied = await new Promise((resolve) => {
        const ws = new WebSocket(`ws://${HOST}:${PORT}/`, { perMessageDeflate: false });
        ws.on('open', () => { ws.close(); resolve({ ok: false, reason: 'se conecto sin token' }); });
        ws.on('unexpected-response', (_req, res) => resolve({ ok: res.statusCode === 401, status: res.statusCode }));
        ws.on('error', () => resolve({ ok: true, reason: 'error de conexion esperado' }));
    });
    console.log('  sin token ->', denied);
    if (!denied.ok) throw new Error('Se permitio conexion sin token');

    console.log('--- WS: conexion con token invalido (debe fallar) ---');
    const badToken = await new Promise((resolve) => {
        const ws = new WebSocket(`ws://${HOST}:${PORT}/?token=basura`, { perMessageDeflate: false });
        ws.on('open', () => { ws.close(); resolve({ ok: false }); });
        ws.on('unexpected-response', (_req, res) => resolve({ ok: res.statusCode === 401, status: res.statusCode }));
        ws.on('error', () => resolve({ ok: true }));
    });
    console.log('  token invalido ->', badToken);
    if (!badToken.ok) throw new Error('Se permitio conexion con token invalido');

    console.log('--- WS: abrir conexiones autenticadas ---');
    const aliceWs = await openWs(aliceToken);
    const bobWs = await openWs(bobToken);
    console.log('  Alice ready ->', aliceWs.ready);
    console.log('  Bob ready   ->', bobWs.ready);
    if (aliceWs.ready.type !== 'connection.ready' || bobWs.ready.type !== 'connection.ready') {
        throw new Error('Ready incorrecto');
    }

    console.log('--- POST: Bob crea un post ---');
    const post = await request('POST', '/posts', { content: 'Hola desde Bob' }, bobToken);
    if (post.status !== 201) throw new Error('Crear post fallo: ' + JSON.stringify(post.body));
    const postId = post.body.id;
    console.log('  postId =', postId);

    console.log('--- POST: Alice da like al post de Bob ---');
    const like = await request('POST', '/likes/like', { postId }, aliceToken);
    if (like.status !== 200 && like.status !== 201) throw new Error('Like fallo: ' + JSON.stringify(like.body));
    const likeEvt = await waitFor(bobWs.messages, 'post.liked');
    console.log('  Bob recibio ->', likeEvt);
    if (likeEvt.payload.postId !== postId) throw new Error('postId incorrecto en notificacion');
    if (likeEvt.payload.likerId === undefined) throw new Error('likerId ausente');

    console.log('--- POST: Alice sigue a Bob ---');
    const follow = await request('POST', '/follows/follow', { followingId: bobWs.ready.payload.userId }, aliceToken);
    if (follow.status !== 200 && follow.status !== 201) throw new Error('Follow fallo: ' + JSON.stringify(follow.body));
    const followEvt = await waitFor(bobWs.messages, 'user.followed');
    console.log('  Bob recibio ->', followEvt);
    if (!followEvt.payload.followerId) throw new Error('followerId ausente');

    console.log('--- WS: Alice intenta mandar JSON invalido ---');
    aliceWs.ws.send('esto no es json');
    const errEvt = await waitFor(aliceWs.messages, 'error');
    console.log('  Alice recibio ->', errEvt);
    if (!/JSON/.test(errEvt.payload.reason)) throw new Error('Error de parseo no llego');

    console.log('\nTODO OK');
    aliceWs.ws.close();
    bobWs.ws.close();
    setTimeout(() => process.exit(0), 200);
})().catch((e) => {
    console.error('FALLO:', e.message);
    process.exit(1);
});
