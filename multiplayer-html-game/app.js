
//#region Express handler

// I don't exactly know what this does, it's a hard copy paste from the tutorial.
// however, it seems to be a way for the app to load the CLIENT html and also a setup for the server.

// serv is the server, it listens to port 2000

// app.get is the entry point from a client perspective: if the user goes to mywebsite:2000 (without)
// any extras, they well be sent the /cleint/index.html
// if the qearyu starts with /client, the app.use is called and used express.static whatever

var express = require('express')
var app = express();
var serv = require('http').Server(app);


 app.get('/', function(req, res) {
     res.sendfile(__dirname+'/client/index.html');
    });

app.use('/client', express.static(__dirname+'/client'));

serv.listen('2000');
console.log('server started');

//#endregion

var SOCKET_LIST = {};

// loads io object with socketio data and server
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    socket.x = 0;
    socket.y = 0;

    SOCKET_LIST[socket.id] = socket;

    console.log('socket connection: ' + socket.id);

    socket.on('happy', function(data){
        console.log('happy: ' + data.reason);
    });

    socket.emit('serverMsg',{msg:'hello',});
})

setInterval(function(){
for(var i in SOCKET_LIST){
    var socket = SOCKET_LIST[i];
    socket.x++;
    socket.y++;

    socket.emit('newPosition', {
        x:socket.x,
        y:socket.y
    });
    
}

},1000/25);