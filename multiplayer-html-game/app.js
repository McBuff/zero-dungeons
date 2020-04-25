
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
//var PLAYER_LIST = {};

var Entity = function(id){
    var self = {
        x:250,
        y:250,
        spdX:0,
        spdY:0,
        id:""
    }
    
    self.update = function(){
        self.updatePosition();
    }
    self.updatePosition = function(){
        self.x += self.spdX;
        self.y += self.spdY;

    }

    return self;
};

var Player = function(id){
    var self = Entity();
    self.id = id;
    self.number = "" + Math.floor(10 * Math.random()); 
    self.pressingRight=false;
    self.pressingLeft=false;
    self.pressingUp=false;
    self.pressingDown=false;
    self.maxSpd=10;

    var super_update = self.update;

    self.update = function(){
        self.updateSpd();
        super_update();

    };

    
    self.updateSpd = function(){
        if(self.pressingRight)
            self.spdX = self.maxSpd;
        else if(self.pressingLeft)
            self.spdX = self.maxSpd * -1;
        else
            self.spdX = 0;

        if(self.pressingUp)
            self.spdY = self.maxSpd * -1;
        else if(self.pressingDown)
            self.spdY = self.maxSpd;
        else
            self.spdY = 0;

    }
    Player.list[id] = self;
    return self;
}
Player.list = {};

Player.onConnect = function(socket){
    var player = Player(socket.id);
    socket.on('keyPress',function(data){
        if(data.inputId === 'left')
            player.pressingLeft = data.state;
        else if(data.inputId === 'right')
            player.pressingRight = data.state;
        else if(data.inputId === 'up')
            player.pressingUp = data.state;
        else if(data.inputId === 'down')
            player.pressingDown = data.state;
    });


}

Player.onDisconnect =function(socket){

    console.log("player disconnected")
    delete Player.list[socket.id];
    
}

// Updates every player in Player.list, note that this updates
// EVERY player. 
// returns pack data to send over socket.io
Player.update = function(){
    var pack = [];
    for( var i in Player.list)
    {
        var player = Player.list[i];
        player.update();
        pack.push({
            x:player.x,
            y:player.y,
            number:player.number
        })
    }
    return pack;
}

// loads io object with socketio data and server
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){


    // On player connection, assign a socket to it and store it in global list
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    console.log('Player connected: ' + socket.id);

    // Create player object that will be controlled through socket
    Player.onConnect(socket);    

    // On Disconnect, delete  it's socket & let player destroy itself
    socket.on('disconnect', function(){
        delete SOCKET_LIST[socket.id];
        //delete PLAYER_LIST[socket.id];
        Player.onDisconnect(socket);
        
    });


})

// Update loopp (Node.js)
setInterval(function(){

    // handle update for all, player objects and store pack data for emission.
    var pack = Player.update();
    
    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];    
        socket.emit('newPositions', pack); // send all player positions, to every player

    }

},1000/25);