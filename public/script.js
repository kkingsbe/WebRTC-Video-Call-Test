//Make it look like this https://dribbble.com/shots/18021022-Medical-CRM-Dashboard-Video-Call-with-Doctor

const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const ownVideo = document.getElementById('own-video')
const callerVideo = document.getElementById('caller-video')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream, true)

    myPeer.on('call', call => {
        console.log("Getting a call")
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream, false)
        })
        call.on('close', () => {
            video.remove()
        })
        peers[call.peer] = call
    })

    socket.on('user-connected', userId => {
        if(userId != myPeer.id) {
            console.log("User connected: " + userId)
            connectToNewUser(userId, stream)
        }
    })

    socket.emit('connection-request', ROOM_ID, myPeer.id)
})

socket.on('user-disconnected', userId => {
    if(peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function addVideoStream(video, stream, own) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    if(own) ownVideo.append(video)
    else callerVideo.append(video)
    //videoGrid.append(video)
}

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    console.log("Callin'")
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })
    
    peers[userId] = call
}