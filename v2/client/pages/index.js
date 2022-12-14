import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {useEffect, useState} from "react"
const { io } = require("socket.io-client");

export default function Home() {
  const ROOM_ID = 0
  const SERVER_URL = "ml360-testing.dev"

  function init() {
    const socket = io.connect(`https://${SERVER_URL}:443`)
    import('peerjs').then(({ default: Peer }) => {
      const myPeer = new Peer(undefined, {
        host: SERVER_URL,
        port: '3001',
      })
      
      myPeer.on('open', id => {
        console.log("MY ID IS " + id)
        socket.emit('join-room', ROOM_ID, id)
      })

      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      }).then(stream => {
        addVideoStream(myVideo, stream, true)
        
        myPeer.on('open', id => {
          socket.emit('join-room', ROOM_ID, id)
        })
    
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
                connectToNewUser(myPeer, userId, stream)
            }
        })
    
        socket.emit('connection-request', ROOM_ID, myPeer.id)
      })
    });

    socket.on('user-disconnected', userId => {
      if(peers[userId]) peers[userId].close()
    })

    const myVideo = document.createElement('video')
    myVideo.muted = true
  }

  useEffect(() => {
    if(typeof(document) != "undefined") {
      init()
    }
  }, [])

  
  const peers = {}

  function addVideoStream(video, stream, own) {
    const ownVideo = document.getElementById('own-video')
    const callerVideo = document.getElementById('caller-video')

    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    if(own) ownVideo.append(video)
    else callerVideo.append(video)
    //videoGrid.append(video)
  }

  function connectToNewUser(myPeer, userId, stream) {
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

  return (
    <div className={styles.container}>
      <div id="caller-video"></div>
      <div id="own-video"></div>
    </div>
  )
}
