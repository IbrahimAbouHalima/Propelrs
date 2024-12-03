const http = require('http');
const socketIo = require('socket.io');

module.exports = (server) => {
    const io = socketIo(server);

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('sendMessage', (data) => {
            console.log('Message received:', data);

            io.emit('newMessage', data);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};
