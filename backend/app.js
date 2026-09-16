const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

//Importar rutas
const userRoute = require('./routes/user.route')

const postRoute = require('./routes/post.route')

const likeRoute = require('./routes/like.route')

const followRoute = require('./routes/follow.route')

const authRoute = require('./routes/auth.route')

const feedRoute = require('./routes/feed.route')

//Rutas
const healthRoute = require('./routes/health.route')

app.use('/health', healthRoute)
app.use('/users', userRoute)
app.use('/posts', postRoute)
app.use('/likes', likeRoute)
app.use('/follows', followRoute)
app.use('/auth', authRoute)
app.use('/feeds', feedRoute)

app.get('/', (req, res) => {
    res.send(`<h1>Bienvenido a la API de XClone</h1>
    <p>Para verificar el estado del servidor, accede a <a href="/health">/health</a></p>`)
})

module.exports = app