

// GLOBALS
PORT = process.env.PORT || 8080;


console.log('index.js');
console.log(__dirname);

var express = require('express');
app = express();
serv = require('http').Server(app);

app.get('/',function(req, res) {
    
    res.sendFile(__dirname+'/index.html');
});

app.get('/diceroller',function(req, res) {
    console.log('client requested diceroller');
    dcapp = require('./diceroller2/app.js');
    res.type = '.html';
    res.sendFile(__dirname+'/diceroller2/client/index.html');

    
});

app.get('/diceroller/diceclient.js', function(req, res){
//app.get('*diceclient.js', function(req, res){ // this one works
    console.log('client requesting diceclient');
    res.type = '.js';
    res.sendFile(__dirname+ '/diceroller2/client/diceclient.js');
});


app.use('/', express.static(__dirname));

serv.listen(PORT);



console.log('index.js -- end');