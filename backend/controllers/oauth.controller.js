const oauthService = require('../services/oauth.service');

const FRONTEND_URL = () => (process.env.FRONTEND_URL || 'http://localhost:3001').replace(/\/$/, '');
const cookieName = (provider) => `xclone_oauth_${provider}`;

function cookieOptions(maxAge) {
    return [
        'HttpOnly',
        'SameSite=Lax',
        'Path=/auth/oauth',
        `Max-Age=${maxAge}`,
        ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
    ].join('; ');
}

async function start(req, res) {
    const { provider } = req.params;
    const state = oauthService.randomValue();
    const nonce = oauthService.randomValue();
    const verifier = oauthService.randomValue();
    try {
        const authorizationUrl = await oauthService.createAuthorizationUrl(provider, state, nonce, verifier);
        res.setHeader('Set-Cookie', `${cookieName(provider)}=${state}.${nonce}.${verifier}; ${cookieOptions(600)}`);
        return res.redirect(302, authorizationUrl);
    } catch (error) {
        console.error('[oauth] No se pudo iniciar el flujo:', error.message);
        return res.redirect(`${FRONTEND_URL()}/login?oauthError=configuration`);
    }
}

function callbackError(res, code) {
    return res.redirect(302, `${FRONTEND_URL()}/login?oauthError=${code}`);
}

async function callback(req, res) {
    const { provider } = req.params;
    const cookie = (req.headers.cookie || '').split('; ').find((part) => part.startsWith(`${cookieName(provider)}=`));
    res.setHeader('Set-Cookie', `${cookieName(provider)}=; ${cookieOptions(0)}`);
    const [expectedState, nonce, verifier] = cookie ? decodeURIComponent(cookie.slice(cookie.indexOf('=') + 1)).split('.') : [];

    if (req.query.error || !req.query.code || !req.query.state || !expectedState || req.query.state !== expectedState) {
        return callbackError(res, 'cancelled');
    }

    try {
        const token = await oauthService.authenticate(provider, req.query.code, verifier, nonce);
        // The fragment is never sent to the frontend server or included in referrer headers.
        return res.redirect(302, `${FRONTEND_URL()}/callback#token=${encodeURIComponent(token)}`);
    } catch (error) {
        console.error('[oauth] Falló el callback:', error.message);
        if (error.message.includes('Ya existe una cuenta')) return callbackError(res, 'account_exists');
        if (error.message.includes('no está verificado')) return callbackError(res, 'email_unverified');
        if (error.message.includes('no compartió un correo')) return callbackError(res, 'email_missing');
        if (error.message.includes('rechazó la autenticación')) return callbackError(res, 'provider_rejected');
        return callbackError(res, 'failed');
    }
}

module.exports = { start, callback };
