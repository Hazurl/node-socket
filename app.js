var http = require('http');
var fs = require('fs');

// Chargement de socket.io
var socketio = require('socket.io');


// Chargement du fichier index.html affiché au client
var server = http.createServer(function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

var io = socketio.listen(server);

io.sockets.on('connection', function (socket) {
    var user = {};

    socket.emit("need-pseudo");

    socket.on("set-pseudo", (pseudo) => {
        if (pseudo === "") {
            console.error("Invalid Pseudo");
            socket.emit("need-pseudo");
            return;
        }

        if (user.pseudo)
            socket.broadcast.emit("user-pseudo-changed", { old : user.pseudo, new : pseudo });
        else
            socket.broadcast.emit("user-connection", pseudo);

        user.pseudo = pseudo;
        socket.emit("pseudo-changed", pseudo);
    });

    socket.on("send-message", (message) => {
        if (!user.pseudo) {
            socket.emit("need-pseudo");
            return;
        }
        socket.broadcast.emit("reveive-message", {message : message, pseudo : user.pseudo } );
    });
});


server.listen(3000);