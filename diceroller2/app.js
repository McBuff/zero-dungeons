app.get('/audio/oof.mp3', function(req, res) {
	res.sendFile(__dirname + '/client/audio/oof.mp3');
});
app.get('/audio/tada.mp3', function(req, res) {
	res.sendFile(__dirname + '/client/audio/tada.mp3');
});

app.get('/audio/diceroll_1_1.mp3', function(req, res) {
	res.sendFile(__dirname + '/client/audio/diceroll_1_1.mp3');
});

app.get('/audio/diceroll_1_2.mp3', function(req, res) {
	res.sendFile(__dirname + '/client/audio/diceroll_1_2.mp3');
});

app.get('/audio/diceroll_1_3.mp3', function(req, res) {
	res.sendFile(__dirname + '/client/audio/diceroll_1_3.mp3');
});
app.get('/audio/diceroll_4_1.mp3', function(req, res) {
	res.sendFile(__dirname + '/client/audio/diceroll_4_1.mp3');
});
app.get('/audio/diceroll_4_2.mp3', function(req, res) {
	res.sendFile(__dirname + '/client/audio/diceroll_4_2.mp3');
});

app.get('/diceroller/img/:im', function(req, res) {
	// if user requests ANY image, send it, unless it doesn't exist, then send placeholder.
	console.log('user requested image: ' + req.params.im);
	// check if file exists, otherwis
	const fs = require('fs');

	let _filepath = __dirname + '/client/img/' + req.params.im;
	if (fs.existsSync(_filepath) === false) {
		console.debug('User requested an image that does not exists, sending placeholder.png');
		_filepath = __dirname + '/client/img/' + 'placeholder.png';
	}
	res.sendFile(_filepath);
});

app.get('/diceroller/dice.css', function(req, res) {
	console.log('client requested dice.css');
	res.sendFile(__dirname + '/client/dice.css');
});
app.get('/diceroller/simplelogger.js', function(req, res) {
	console.log('client requested js: simplelogger.js');
	res.sendFile(__dirname + '/client/simplelogger.js');
});

app.get('/diceroller/diceparser.js', function(req, res) {
	console.log('client requested js: diceparser.js');
	res.sendFile(__dirname + '/client/diceparser.js');
});

// app.use('/client',express.static(__dirname + '/client'));

// serv.listen(PORT);
// console.log("Server started.");
require('better-logging')(console);
console.log('DiceRollerApp Loading...');
var io = require('socket.io')(serv, {});
//io = io.of('namspace');
//io = io.sockets;

//var io = require('socket.io')(serv,{});

SOCKETS = {};

USERS = {
	DM: 'dnd',
	Deus: 'dnd',
	Ratnun: 'dnd',
	Dimur: 'dnd'
};

USERCOLORS = [ 'Brown', 'CornflowerBlue', 'Chocolate', 'DarkGreen', 'Indigo', '#ffffff' ];

DEBUGPWD = 'dnd';
LOGINSETTINGS = { mode: 'FREEROOM', password: 'DND' };
console.info(`Server is in mode: ${LOGINSETTINGS.mode}`);
//LOGINSETTINGS = {mode:'ACCOUNTS', password:'DND'};

DICELOG = '';

function generateGUID() {
	var sGuid = '';
	for (var i = 0; i < 32; i++) {
		sGuid += Math.floor(Math.random() * 0xf).toString(0xf);
	}
	return sGuid;
	//comment block
}

function pullColor() {
	console.debug('pulling color from colorcycle');
	color = USERCOLORS.shift();
	USERCOLORS.push(color);
	return color;
}

var Player = function(socket) {
	var self = {
		color: pullColor(),
		socket: socket,
		username: socket.username
	};

	//add self to players list
	Player.list[socket.guid] = self;
	console.debug('Created player with username ' + self.username);

	return self;
};
Player.onConnect = function(socket) {
	var player = Player(socket);
};
Player.onDisconnect = function(socket) {
	delete Player.list[socket.guid];
};

var updateClientPlayerlists = function() {
	playernames = [];

	for (var i in Player.list) {
		var player = Player.list[i];
		playernames.push({ username: player.username, color: player.color, guid: player.socket.guid });
	}
	console.log('sending player list to players');
	for (var i in SOCKETS) {
		var socket = SOCKETS[i];
		socket.emit('setPlayerList', playernames);
	}
};

Player.list = {};

var authenticateUser = function(data, cb) {
	if (LOGINSETTINGS.mode === 'FREEROOM') {
		HEROKU_CONFIG_PW = process.env.DICEROLL_ROOMKEY || LOGINSETTINGS.password;
		// console.log('Server is in ROOM mode');
		if (data.password === HEROKU_CONFIG_PW) {
			console.log(`User: '${data.username}' admitted`);
			cb({ result: true });
		} else cb({ result: false });
	} else if (LOGINSETTINGS.mode == 'ACCOUNTS') {
		if (USERS[data.username] === data.password) {
			console.debug('user authenticated succesfully');
			cb({ result: true });
		} else cb({ result: false });
	}
};

//io.sockets.on('connection', function(socket){
io.sockets.on('connection', function(socket) {
	//console.log('socket connection');

	// handle user login

	socket.on('clientSignIn', function(data) {
		console.log('user: ' + data.username + ' is attempting to log in.');

		authenticateUser(data, function(res) {
			if (res.result === true) {
				console.log('Initializing Player data');
				// keep track of this socket
				socket.guid = generateGUID();
				SOCKETS[socket.guid] = socket;
				SOCKETS[socket.guid].username = data.username;

				Player.onConnect(socket);

				// Send current dicelog to player
				console.log('transfering dicelog: ');
				console.debug(DICELOG.toString());

				socket.emit('transferDiceLog', { log: DICELOG.toString() });

				// Send all players an updated player list
				updateClientPlayerlists();

				socket.emit('clientSignInResponse', { succes: true });
			} else {
				console.warn('User authentication Failed');
				socket.emit('clientSignInResponse', { succes: false });
			}
		});
	});

	socket.on('disconnect', function() {
		delete SOCKETS[socket.guid];
		Player.onDisconnect(socket);
		updateClientPlayerlists();
	});

	// if socket is NOT in sockets list, ignore rest of functions?

	Number.prototype.pad = function(size) {
		var s = String(this);
		while (s.length < (size || 2)) {
			s = '0' + s;
		}
		return s;
	};

	socket.on('rollDice', function(data) {
		// data format v1
		// {dice:[20,20,10,10...], modifiers:[+1,-1]}
		let player = Player.list[socket.guid]; // player who called the roll
		let msg = ''; // ex: 10 -> (d20)+10

		let dicetotal = 0; // roll result value

		let diceresults = ''; // used to compose msg
		let diceused = ''; // used to compose msg
		let critData = { didCrit: false, critType: 'MISS' };

		let registeredCrit = false;
		// roll every die seperatly and produce a string with die+die+die+
		for (var i in data.dice) {
			let die = data.dice[i];
			console.log('rolling d' + die);
			let result = Math.floor(Math.random() * die) + 1;

			// add dice roll to total dice score
			dicetotal += result;

			// generate message stub
			// make crit red?
			if (die === 20 && (result === 20 || result === 1)) {
				/// take notion of CRIT
				//TODO: move this elsewhere
				if (result === 20) critData.critType = 'HIT';
				else critData.critType = 'MISS';

				result = '<b style="color:#ff0000;">' + result + '</b>';
				critData.didCrit = true;
			}

			diceresults = [ diceresults, result ].join('+'); // add + between new elements
			diceused = [ diceused, die ].join('+d');
		}
		// formatting: cut off last '+' after loop
		diceresults = diceresults.slice(1, diceresults.length);
		diceused = diceused.slice(1, diceused.length);

		// add dice modifiers to diceresults and build modifiers string
		let dicemodifiersLogString = '';
		for (var i in data.modifiers) {
			let mod = data.modifiers[i];
			dicetotal += mod;
			let sign = '+';
			if (mod < 0) sign = '-';
			dicemodifiersLogString += sign + mod;
		}
		if (dicemodifiersLogString === '') dicemodifiersLogString = '0';
		msg = `<b>${dicetotal}</b> -> ${diceresults} (${diceused}) + (${dicemodifiersLogString})`;

		// construct HTML code for dice log;
		let color = player.color;
		let username = player.username;
		let usertag = `<username style="color:${color};">${username}: </username>`;
		usertag = `<b>${usertag}</b>`; // hard coded bold

		// create timestamp for roll log.
		let d = new Date();
		let timestamp = '' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds().pad();
		timestamp = `<timestamp>[${timestamp}]</timestamp>`;
		// compose HTML message
		let html = `<li>${timestamp} - ${usertag} \t${msg}</li>`;

		// transmit HTML message to all users
		let numdice = data.dice.length;
		console.log(numdice);
		data = { html: html, critData: critData, numDice: numdice };
		for (var i in SOCKETS) {
			var s = SOCKETS[i];
			s.emit('addDiceRollResult', data);
		}

		// finally, add dice to the TOP of the log, ( for late joiners )
		//DICELOG.push(html);
		DICELOG = html + DICELOG;

		//socket.emit('addDiceRollResult', '<div>' + msg+ '</div>');
		console.log(msg);
	});

	socket.on('consoleCommand', function(data) {
		console.log('========================');
		console.log('Received Console Command');
		console.log('========================');
		if (data.cmd === 'cls') {
			console.log('clearing dicelog');
			DICELOG = '';

			for (var i in SOCKETS) {
				var psocket = SOCKETS[i];
				psocket.emit('transferDiceLog', { log: DICELOG.toString() });
			}

			return;
		}

		if (data.cmd === 'col') {
			console.log('changing player col ' + data.args);
			let p = Player.list[socket.guid];
			p.color = data.args;
			updateClientPlayerlists();
		}
	});
});
