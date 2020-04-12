
var app = require('http').createServer()
var io = module.exports.io = require('socket.io')(app)

const PORT = process.env.PORT || 5000

const SocketManager = require('./socket-manager')

io.on('connection', SocketManager)

app.listen(PORT, () => {
    console.log('Connected to PORT: ' + PORT);
})