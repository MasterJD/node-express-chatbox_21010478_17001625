require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const socket = require('socket.io');

const PORT = process.env.PORT || 3001;

// App
app.use(express.static('public'))


// Routes
app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'public/index.html'))
})


// Listen on configured port
const server = app.listen(PORT, ()=>console.log(`Listening to requests on port ${PORT}`))

// Listens for client connections
const io = socket(server);

// Handle incoming signals and emit
io.on('connection', (socket) => {

    // Broadcast system message once a user has established connection
    io.sockets.emit('system', { name: 'System', id :socket.id})

    // Listen for chat-message from client, broadcast to everyone once received
    socket.on('chat-message', (data) => {
        io.sockets.emit('chat-message', data)
    })

    // Listen for name-change from client, broadcast to everyone once received
    socket.on('name-change', (data) => {
        io.sockets.emit('name-change', data)
    })
})