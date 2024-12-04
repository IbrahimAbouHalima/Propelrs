const http = require('http');
const socketIo = require('socket.io');

module.exports = (app) => {
    const server = http.createServer(app);
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
    server.listen(process.env.PORT || 3000, () => {
        console.log('WebSocket server is running');
    });
};
