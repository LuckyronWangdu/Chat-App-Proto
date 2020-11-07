const http = require('http')
const path = require('path')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generatemessage, generatelocationmessage } = require('./utils/messages')
const { adduser, removeuser, getuser, getusersinroom } = require('./utils/users')
const { get } = require('https')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New Websocket connection')

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = adduser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generatemessage('App Bot', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generatemessage('App Bot', `${user.username} has joined`))
        io.to(user.room).emit('roomdata', {
            room: user.room,
            users: getusersinroom(user.room)
        })
        callback()

    })

    socket.on('sendmessage', (message, callback) => {

        const user = getuser(socket.id)

        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity prohibited!')
        }
        io.to(user.room).emit('message', generatemessage(user.username, message))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeuser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generatemessage('App Bot', `${user.username} has left!`))
            io.to(user.room).emit('roomdata', {
                room: user.room,
                users: getusersinroom(user.room)
            })
        }
    })

    socket.on('sharelocation', (coords, callback) => {
        const user = getuser(socket.id)
        io.to(user.room).emit('locationmessage', generatelocationmessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
})

server.listen(port, () => {
    console.log('Server is up on port ' + port)
})