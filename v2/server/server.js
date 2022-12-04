const express = require('express')
const app = express()
const fs = require('fs')
const https = require('https')
const {PeerServer} = require("peer")

const key = fs.readFileSync("/etc/letsencrypt/live/ml360-testing.dev/privkey.pem")
const cert = fs.readFileSync("/etc/letsencrypt/live/ml360-testing.dev/fullchain.pem")

var options = {key, cert}
var serverPort = 443

var server = https.createServer(options, app)
var io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

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

server.listen(serverPort)

const peerServer = PeerServer({
    port: 3001,
    ssl: {
        key,
        cert
    }
})