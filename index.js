console.log('index.js');
console.log(__dirname);

// GLOBALS
PORT = process.env.PORT || 8080;

var express = require('express');
app = express();
serv = require('http').Server(app);

app.get('/',function(req, res) {
    
    res.sendFile(__dirname+'/index.html');
});

app.get('/diceroller',function(req, res) {
    console.log('User requested diceroller');
    dcapp = require('./diceroller2/app.js');
    res.sendFile(__dirname+'/diceroller2/client/index.html');
});

app.use('/', express.static(__dirname));

serv.listen(PORT);



console.log('index.js -- end');