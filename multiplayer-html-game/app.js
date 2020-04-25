
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

DEBUG = true;

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
    self.getDistance = function(pt){
        return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
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
    self.pressingAttack=false;
    self.mouseAngle=0;
    self.maxSpd=10;

    var super_update = self.update;

    self.update = function(){
        self.updateSpd();
        super_update();

        if(self.pressingAttack){
            self.shootBullet(self.mouseAngle);
        }

    };

    self.shootBullet = function(angle){
        console.log("created new bullet. Bulletcount: " + Object.keys(Bullet.list).length);
        var b = Bullet(self.id, angle);
        b.x = self.x;
        b.y = self.y;
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

        if(data.inputId === 'attack')
            player.pressingAttack = data.state;
        if(data.inputId === 'mouseAngle')
            player.mouseAngle = data.state;
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

var Bullet = function(parent, angle){
    var self = Entity();
    self.id = Math.random();
    self.parent = parent;
    self.spdX = Math.cos(angle/180*Math.PI) * 10;
    self.spdY = Math.sin(angle/180*Math.PI) * 10;

    self.timer = 0;
    self.toRemove = false;

    var super_update = self.update;
    self.update = function(){
        if(self.timer++ > 100)
            self.toRemove = true;
        super_update();

        for(var i in Player.list){
            var p = Player.list[i];
            
            if(self.getDistance(p) < 32 && p.id !== self.parent)// this works because player has an x and y var;
            {
                //handle collision. ex: hp--;
                self.toRemove = true;
            }
            
        }
    }

    Bullet.list[self.id] = self;
    return self;
}

Bullet.list = {};

// Updates every player in Player.list, note that this updates
// EVERY player. 
// returns pack data to send over socket.io
Bullet.update = function(){

    var pack = [];
    for( var i in Bullet.list)
    {
        var bullet = Bullet.list[i];
        bullet.update();

        if(bullet.toRemove) 
            delete Bullet.list[i];
        pack.push({
            x:bullet.x,
            y:bullet.y,
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

    socket.on('sendMsgToServer',function(data){
        var playerName = ("" + socket.id).slice(2,7);
        for( var i in SOCKET_LIST){
            SOCKET_LIST[i].emit('addToChat', playerName + ': ' + data);
        }
    });

    socket.on('evalServer', function(data){
        if(DEBUG){
            var res = eval(data);
            
        }
        else res = "Not allowed!"

        socket.emit('evalAnswer',res);
        
    });


})

// Update loopp (Node.js)
setInterval(function(){

    var pack = {
        player: Player.update(),
        bullet: Bullet.update()
    }
    // handle update for all, player objects and store pack data for emission.
    
    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];    
        socket.emit('newPositions', pack); // send all player positions, to every player

    }

},1000/25);