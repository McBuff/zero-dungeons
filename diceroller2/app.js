    var express = require('express');
var app = express();
var serv = require('http').Server(app);
 
app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
 
serv.listen(2000);
console.log("Server started.");

var io = require('socket.io')(serv,{});

SOCKETS = {}

USERS = {
    'DM':'dnd',
    'Deus':'dnd',
    'Ratnun':'dnd',
    'Dimur':'dnd',
}

USERCOLORS = ['Brown', 'CornflowerBlue', 'Chocolate', 'DarkGreen', 'Purple'];

DEBUGPWD = 'dnd';
LOGINSETTINGS = {mode:'FREEROOM', password:'DND'};
//LOGINSETTINGS = {mode:'ACCOUNTS', password:'DND'};

DICELOG = '';

function generateGUID(){
    var sGuid = "";
    for (var i = 0; i< 32; i++)
    {
        sGuid += Math.floor(Math.random() * 0xF).toString(0xF);
    }
    return sGuid;
}

function pullColor()
{
    console.log("pulling color");
    color = USERCOLORS.shift();    
    USERCOLORS.push(color);
    return color;    
}



var Player = function(socket){
    var self = {
    color : pullColor(),
    socket : socket,
    username : socket.username,
    }

    //add self to players list
    Player.list[socket.guid] = self;
    console.log('Created player with username ' + self.username);

    return self;

}
Player.onConnect = function(socket){
    var player = Player(socket);
}
Player.onDisconnect = function(socket){
    
    delete Player.list[socket.guid];
    
}

var updateClientPlayerlists = function (){
    playernames = [];

    for (var i in Player.list){
        var player = Player.list[i];
        playernames.push( {username:player.username, color:player.color});

    }
    console.log('sending player list to players');
    for(var i in SOCKETS){
        var socket = SOCKETS[i];
        socket.emit('setPlayerList', playernames);

    }
}

Player.list = {};

var authenticateUser = function(data, cb){

    if( LOGINSETTINGS.mode ==='FREEROOM'){
        console.log('Server is in ROOM mode');
        if(data.password === LOGINSETTINGS.password){
            console.log('user admitted');
            cb({result:true});    
        }
        else cb({result:false});
    }
    else if( LOGINSETTINGS.mode == 'ACCOUNTS'){
        if(USERS[data.username] === data.password){
            console.log('user authenticated succesfully')
            cb({result:true});
            
        }
        else cb({result:false});
    }
    
}

io.sockets.on('connection', function(socket){
    //console.log('socket connection');

    // handle user login

    socket.on('clientSignIn', function(data){
        console.log('user: ' + data.username + ' is attempting to log in.');

        authenticateUser(data, function(res){
            if(res.result === true){
                console.log('succes');
                // keep track of this socket
                socket.guid = generateGUID();
                SOCKETS[socket.guid] = socket;
                SOCKETS[socket.guid].username = data.username;
                
                Player.onConnect(socket);
                
                // send player active dicelog
                console.log('transfering dicelog: ' + DICELOG);
                
                socket.emit('transferDiceLog',{log:DICELOG.toString()} );
                
                updateClientPlayerlists();
                
                socket.emit('clientSignInResponse', {succes:true});
            }
            else {
                console.log('failed');
                socket.emit('clientSignInResponse', {succes:false});
            }
        });

    })

    socket.on('disconnect', function(){
        delete SOCKETS[socket.guid];
        Player.onDisconnect(socket);
        updateClientPlayerlists();
    });

    socket.on('rollDice', function(data){

        let player = Player.list[socket.guid]; // player who called the roll
        let msg = '';
        let dicetotal = 0;
        let diceresults = '';
        let diceused = '';
        for(var i in data.dice){
            let die = data.dice[i];
            console.log("rolling d" + die);
            let result = ( Math.floor((Math.random() * die)) +1);

            // generate message
            dicetotal += result;

            diceresults = [diceresults, result].join('+'); // add + between new elements
            diceused = [diceused, die].join('+d');
            
        }

        diceresults = diceresults.slice(1, diceresults.length);
        diceused    = diceused.slice(1, diceused.length);
        msg = `<b>${dicetotal}</b> -> ${diceresults} (${diceused})`;


        let color = player.color;
        let username = player.username;
        let d = new Date();
        let timestamp = '\t'+d.getHours() + ':' + d.getMinutes() + ':'+ d.getSeconds();
        let html = `<div><b style="color:${color};">${username}: </b>${msg} [${timestamp}]</div>`

        for(var i in SOCKETS){
            var s = SOCKETS[i];
            s.emit('addDiceRollResult', html);
        }

        // finally, add dice to the TOP of the log, ( for late joiners )
        //DICELOG.push(html);
        DICELOG = html + DICELOG;
        
        //socket.emit('addDiceRollResult', '<div>' + msg+ '</div>');
        console.log(msg);
    });
        
    

});
