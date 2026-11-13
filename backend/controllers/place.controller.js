const placeService = require('../services/place.service')

async function searchPlaces(req, res) {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : ''
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 25)

    if (query.length < 2) {
        return res.status(400).json({
            error: "La busqueda debe tener al menos 2 caracteres"
        })
    }

    try{
        const places = await placeService.searchPlaces(query, limit);
        res.status(200).json(places)
    }catch (error) {
        console.error("Error buscando lugares:", error)

        res.status(502).json({
            error: "No se pudo buscar lugares ahora mismo"
        })
    }
}

module.exports = {
    searchPlaces
}