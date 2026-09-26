const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prismaClient');
const { emitUserLoggedIn, emitUserRegistered } = require('../websocket/wsEvents');

const PROVIDERS = {
    google: {
        clientId: () => process.env.GOOGLE_CLIENT_ID,
        clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
        discovery: 'https://accounts.google.com/.well-known/openid-configuration',
        scopes: 'openid email profile',
    },
    microsoft: {
        clientId: () => process.env.MICROSOFT_CLIENT_ID,
        clientSecret: () => process.env.MICROSOFT_CLIENT_SECRET,
        discovery: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID || 'common'}/v2.0/.well-known/openid-configuration`,
        scopes: 'openid email profile',
    },
};

const randomValue = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url');

function getProvider(provider) {
    const config = PROVIDERS[provider];
    if (!config) throw new Error('Proveedor OAuth no válido');
    if (!config.clientId() || !config.clientSecret()) {
        throw new Error(`Falta configurar las credenciales OAuth de ${provider}`);
    }
    return config;
}

function callbackUrl(provider) {
    const base = process.env.OAUTH_CALLBACK_BASE_URL || process.env.API_PUBLIC_URL;
    if (!base) throw new Error('Falta configurar API_PUBLIC_URL para OAuth');
    return `${base.replace(/\/$/, '')}/auth/oauth/${provider}/callback`;
}

async function getDiscovery(config) {
    const response = await fetch(config.discovery);
    if (!response.ok) throw new Error('No se pudo obtener la configuración OIDC');
    return response.json();
}

async function createAuthorizationUrl(provider, state, nonce, verifier) {
    const config = getProvider(provider);
    const discovery = await getDiscovery(config);
    const url = new URL(discovery.authorization_endpoint);
    url.search = new URLSearchParams({
        client_id: config.clientId(),
        redirect_uri: callbackUrl(provider),
        response_type: 'code',
        response_mode: 'query',
        scope: config.scopes,
        state,
        nonce,
        code_challenge: crypto.createHash('sha256').update(verifier).digest('base64url'),
        code_challenge_method: 'S256',
    }).toString();
    return url.toString();
}

async function exchangeCode(provider, code, verifier) {
    const config = getProvider(provider);
    const discovery = await getDiscovery(config);
    const response = await fetch(discovery.token_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: config.clientId(),
            client_secret: config.clientSecret(),
            code,
            code_verifier: verifier,
            grant_type: 'authorization_code',
            redirect_uri: callbackUrl(provider),
        }),
    });
    if (!response.ok) throw new Error('El proveedor rechazó la autenticación');
    const tokens = await response.json();
    if (!tokens.id_token) throw new Error('El proveedor no devolvió un id_token');
    return { idToken: tokens.id_token, discovery, config };
}

async function verifyIdToken(idToken, provider, nonce, discovery, config) {
    const decoded = jwt.decode(idToken, { complete: true });
    if (!decoded?.header?.kid || decoded.header.alg !== 'RS256') {
        throw new Error('id_token no válido');
    }

    const keysResponse = await fetch(discovery.jwks_uri);
    if (!keysResponse.ok) throw new Error('No se pudieron validar las claves OIDC');
    const { keys } = await keysResponse.json();
    const jwk = keys.find((key) => key.kid === decoded.header.kid && key.use === 'sig');
    if (!jwk) throw new Error('Clave OIDC desconocida');

    const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });
    const untrustedClaims = decoded.payload;
    let issuer = discovery.issuer;
    if (provider === 'microsoft') {
        if (!/^[0-9a-f-]{36}$/i.test(untrustedClaims.tid || '')) throw new Error('Tenant Microsoft no válido');
        issuer = issuer.replace('{tenantid}', untrustedClaims.tid);
    }
    const claims = jwt.verify(idToken, publicKey, {
        algorithms: ['RS256'],
        audience: config.clientId(),
        issuer,
    });
    if (claims.nonce !== nonce || !claims.sub) throw new Error('La respuesta OIDC no coincide con la sesión');
    return claims;
}

async function makeUsername(email) {
    const localPart = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 5) || 'user';
    for (let attempt = 0; attempt < 10; attempt += 1) {
        const username = `${localPart}_${crypto.randomBytes(2).toString('hex')}`.slice(0, 10);
        const existing = await prisma.user.findUnique({ where: { username }, select: { id: true } });
        if (!existing) return username;
    }
    throw new Error('No se pudo asignar un nombre de usuario');
}

async function findOrCreateUser(provider, claims) {
    const account = await prisma.oAuthAccount.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId: claims.sub } },
        include: { user: true },
    });
    if (account) return { user: account.user, created: false };

    const email = (claims.email || claims.preferred_username || claims.upn || '').toLowerCase();
    if (!email || !email.includes('@')) throw new Error('El proveedor no compartió un correo válido');

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('Ya existe una cuenta con este correo. Inicia sesión con tu contraseña.');
    }

    const username = await makeUsername(email);
    const passwordHash = await bcrypt.hash(randomValue(), 10);
    try {
        const user = await prisma.$transaction(async (tx) => {
            const created = await tx.user.create({
                data: {
                    username,
                    email,
                    displayName: claims.name || email.split('@')[0],
                    passwordHash,
                },
            });
            await tx.oAuthAccount.create({
                data: { provider, providerAccountId: claims.sub, userId: created.id },
            });
            return created;
        });
        return { user, created: true };
    } catch (error) {
        if (error.code === 'P2002') {
            const racedAccount = await prisma.oAuthAccount.findUnique({
                where: { provider_providerAccountId: { provider, providerAccountId: claims.sub } },
                include: { user: true },
            });
            if (racedAccount) return { user: racedAccount.user, created: false };
        }
        throw error;
    }
}

async function authenticate(provider, code, verifier, nonce) {
    const { idToken, discovery, config } = await exchangeCode(provider, code, verifier);
    const claims = await verifyIdToken(idToken, provider, nonce, discovery, config);
    if (provider === 'google' && claims.email_verified !== true) {
        throw new Error('El correo de Google no está verificado');
    }
    const { user, created } = await findOrCreateUser(provider, claims);
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    try {
        if (created) {
            emitUserRegistered({ userId: user.id, username: user.username, displayName: user.displayName });
        } else {
            emitUserLoggedIn({ userId: user.id, username: user.username });
        }
    } catch (error) {
        console.error('[oauth] No se pudo emitir el evento de usuario:', error.message);
    }
    return token;
}

module.exports = { createAuthorizationUrl, authenticate, randomValue };
