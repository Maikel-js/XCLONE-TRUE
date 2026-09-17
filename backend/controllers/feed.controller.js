const feedService = require('../services/feed.service')

async function getFeed(req, res) {
    const userId = req.userId

    let limit = parseInt(req.query.limit, 10);
    if (Number.isNaN(limit)) {
        limit = 20
    }

    if (limit < 1) {
        limit = 1
    }

    if (limit > 50) {
        limit = 50
    }

    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : null;

    const rawMode = typeof req.query.mode === 'string' ? req.query.mode : 'for-you';
    const mode = rawMode === 'following' ? 'following' : 'for-you';

    try {

        const result = await feedService.getUserFeed(userId, { limit, cursor, mode });
        res.json(result);

    } catch (error) {
        if (error.message === 'Cursor invalido') {
            return res.status(400).json({
                error: 'Cursor inválido'
            })
        }
        res.status(500).json({
            error: 'Error del servidor'
        })
    }
}

module.exports = { getFeed }