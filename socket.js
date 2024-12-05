const http = require('http');
const socketIo = require('socket.io');

module.exports = (app) => {
    const server = http.createServer(app);
    const io = socketIo(server);
    io.on('connection', (socket) => {
        socket.on('sendMessage', (data) => {
            io.emit('newMessage', data);
        });
        socket.on('disconnect', () => {
        });
    });
    server.listen(process.env.PORT || 3000, () => {
        console.log('WebSocket server is running');
    });
};
