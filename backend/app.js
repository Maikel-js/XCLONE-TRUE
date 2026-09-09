const express = require('express')
const app = express()
const PORT = 3000

//Rutas
const healthRoute = require('./routes/health.route')

app.use('/health', healthRoute)

app.get('/', (req, res) => {
    res.send(`<h1>Bienvenido a la API de XClone</h1>
    <p>Para verificar el estado del servidor, accede a <a href="/health">/health</a></p>`)
})

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`)
})