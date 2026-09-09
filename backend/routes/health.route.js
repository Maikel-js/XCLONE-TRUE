const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.send('Estado de servidor saludable')
})

module.exports = router