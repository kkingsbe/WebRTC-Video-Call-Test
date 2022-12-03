const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})
const {v4: uuidV4} = require('uuid')

io.on('connection', socket => {
    console.log("New connection!!!!!!!!!")
    
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