const express = require('express')
const app = express()

//Importar rutas
const userRoute = require('../backend/routes/user.route')

const postRoute = require('../backend/routes/post.route')

const likeRoute = require('../backend/routes/like.route')

const followRoute = require('../backend/routes/follow.route')

const authRoute = require('../backend/routes/auth.route')

//Rutas
const healthRoute = require('./routes/health.route')

app.use(express.json())

app.use('/health', healthRoute)
app.use('/users', userRoute)
app.use('/posts', postRoute)
app.use('/likes', likeRoute)
app.use('/follows', followRoute)
app.use('/auth', authRoute)

app.get('/', (req, res) => {
    res.send(`<h1>Bienvenido a la API de XClone</h1>
    <p>Para verificar el estado del servidor, accede a <a href="/health">/health</a></p>`)
})

module.exports = app