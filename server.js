const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const {v4: uuidV4} = require('uuid')

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

server.listen(3000)