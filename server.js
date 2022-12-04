const express = require('express')
const fs = require('fs')
const {fstat} = fs
const app = express()
const https = require('https')
const {v4: uuidV4} = require('uuid')

var options = {
    key: fstat.readFileSync("./file.pem"),
    cert: fstat.readFileSync("./file.crt")
}
var serverPort = 443

var server = https.createServer(options, app)
var io = require("socket.io")(server)

app.set('view engine', 'ejs')
app.use(express.static('public'))

//Create new room if user loads root url
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', {roomId: req.params.room})
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)

        socket.on('disconnect', () => {
            socket.to(roomId).emit("user-disconnected", userId)
        })
    })

    socket.on('connection-request', (roomId, userId) => {
        io.to(roomId).emit('user-connected', userId)
    })
})

server.listen(serverPort)