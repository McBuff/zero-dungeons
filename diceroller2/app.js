LOCATIONS['diceclientroot'] = __dirname;
// app.use('/client',express.static(__dirname + '/client'));

// serv.listen(PORT);
// console.log("Server started.");
require('better-logging')(console);
console.log('DiceRollerApp Loading...');
var io = require('socket.io')(serv, {});

const uuidv4 = require('uuid').v4;
const consolecommands = new require('./server/consolecommands');
// import { v4 as uuidv4 } from 'uuid';

// All http requests are declared in dr_expressrequests
require('./server/dr_expressrequests');

SOCKETS = {};

USERS = {
	DM: 'dnd',
	Deus: 'dnd',
	Ratnun: 'dnd',
	Dimur: 'dnd'
};

// USERCOLORS = [ 'Brown', 'CornflowerBlue', 'Chocolate', 'DarkGreen', 'Indigo', '#00806c' ];
USERCOLORS = [
	'#ff1744',
	'#ff4081',
	'#6a1b9a',
	'#283593',
	'#1e88e5',
	'#00796b',
	'#2e7d32',
	'#689f38',
	'#aeea00',
	'#ffc400',
	'#ff5722'
];
USERCOLORS.sort(); // shuffles colors

DEBUGPWD = 'dnd';
LOGINSETTINGS = { mode: 'FREEROOM', password: 'DND' };
console.info(`Server is in mode: ${LOGINSETTINGS.mode}`);
//LOGINSETTINGS = {mode:'ACCOUNTS', password:'DND'};

let dc = require('./server/dicelog');
// console.log(dc.getStatus());

DICELOG = '';

function generateGUID() {
	let sGuid = '';
	for (let i = 0; i < 32; i++) {
		sGuid += Math.floor(Math.random() * 0xf).toString(0xf);
	}
	return sGuid;
}

function pullColor() {
	console.debug('pulling color from colorcycle');
	color = USERCOLORS.shift();
	USERCOLORS.push(color);
	return color;
}

const Player = function(socket) {
	let self = {
		color: pullColor(),
		socket: socket,
		username: socket.username,
		userguid: uuidv4()
	};

	//add self to players list
	Player.list[socket.guid] = self;
	console.log(`Created player with username ${self.username} and GUID: ${self.userguid} for room ${socket.roomname}`);

	return self;
};
Player.onConnect = function(socket) {
	const player = Player(socket);
};
Player.onDisconnect = function(socket) {
	delete Player.list[socket.guid];
};

let updateClientPlayerlists = function(roomname) {
	playernames = [];

	for (var i in Player.list) {
		var player = Player.list[i];
		if (player.socket.roomname === roomname)
			playernames.push({ username: player.username, color: player.color, guid: player.socket.guid });
	}
	console.log('sending player list to players in room: ' + roomname);
	// for (var i in SOCKETS) {
	// 	var socket = SOCKETS[i];
	// 	socket.in(roomname).emit('setPlayerList', playernames);
	// }
	dc_socket.in(roomname).emit('setPlayerList', playernames);
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

// all 'diceroller app' messages should go through namespace '/ns-diceroller'
// sc_socket holds this namespace' socket.
let dc_namespace = '/ns-diceroller';
const dc_socket = io.of(dc_namespace);

// dc_socket.on('connection', function(socket) {
// 	console.log('got a sign in through namespace');
// });

//Main logic
// io.sockets.on('connection', function(socket) {
dc_socket.on('connection', function(socket) {
	//console.log('socket connection');

	socket.roomname = '';
	// handle user login
	async function transferDicelog(roomname, sock, limit = 20) {
		let package = { log: '' };

		let djs = require('./server/dicelog.js');
		let dl = new djs.diceLogObj(roomname);

		const requestedLogs = await dl.readEntry(limit);

		// console.log('retreived logs from DB: ' + requestedLogs);
		let diceroller = require('./server/diceroller');
		for (let i in requestedLogs) {
			let log = requestedLogs[i];
			const rollmessagedata = {
				rolls: log.diceRolls,
				dice: log.diceUsed,
				modifiers: log.modifiers,
				date: log.date,
				username: log.username,
				usercolor: log.color
			};
			const formattedlog = diceroller.generateRollMessage(rollmessagedata);
			package.log = formattedlog + package.log;
		}
		socket.emit('transferDiceLog', package);
	}

	socket.on('clientSignIn', function(data) {
		console.log('user: ' + data.username + ' is attempting to log in.');
		if (data.room) console.log(`user: ${data.username} requests to join room: ${data.room}`);

		authenticateUser(data, function(res) {
			if (res.result === true) {
				console.log('Initializing Player data');
				// keep track of this socket
				socket.guid = uuidv4(); //generateGUID();
				SOCKETS[socket.guid] = socket;
				SOCKETS[socket.guid].username = data.username;
				socket.roomname = data.room;

				Player.onConnect(socket);

				// Send current dicelog to player
				console.log('transfering dicelog: ');
				console.debug(DICELOG.toString());

				// test
				transferDicelog(data.room, socket);
				// socket.emit('transferDiceLog', { log: DICELOG.toString() });

				// player joins desired room

				socket.join(socket.roomname);

				console.log('socket roomname: ' + socket.roomname);

				// Send all players an updated player list
				updateClientPlayerlists(socket.roomname);

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
		updateClientPlayerlists(socket.roomname);
	});

	socket.on('rollDice', function(data) {
		console.log('rolling dice');
		let diceroller = require('./server/diceroller');
		// data format v1
		// {dice:[20,20,10,10...], modifiers:[+1,-1]}
		let player = Player.list[socket.guid]; // player who called the roll
		let color = player.color;
		let username = player.username;
		let time = new Date();

		let rolls = data.dice.map((x) => Math.floor(Math.random() * x) + 1); // RTD
		let critData = { didCrit: false, critType: 'MISS' };

		const critsList = diceroller.getHits(rolls, data.dice, [ 20 ], 20);
		const missList = diceroller.getHits(rolls, data.dice, [ 1 ], 20);

		if (missList.length > 0) {
			critData.didCrit = true;
			critData.critType = 'MISS';
		}

		if (critsList.length > 0) {
			critData.didCrit = true;
			critData.critType = 'HIT';
		}

		let rollMessageData = {
			rolls: rolls,
			dice: data.dice,
			modifiers: data.modifiers,
			date: time,
			username: username,
			usercolor: color
		};

		// generate the HTML code that is sent to the player and added to the designated UL
		let html = diceroller.generateRollMessage(rollMessageData);
		let msgdata = {
			html: html,
			critData: critData,
			numDice: data.dice.length
		};

		// DICELOG = html + DICELOG;

		let djs = require('./server/dicelog.js');
		let dl = new djs.diceLogObj(socket.roomname);

		console.log('diceresults: ' + rolls);
		console.log('diceused: ' + data.dice);
		console.log('modifiers: ' + data.modifiers);
		let dlogDataEntry = {
			playerGUID: 'null',
			playerDisplayName: username,
			logTime: time,
			playerColor: color,
			diceResults: rolls,
			diceUsed: data.dice,
			modifiers: data.modifiers,
			rolltype: 'r'
		};
		dl.writeEntry(dlogDataEntry); // writes data to database

		dc_socket.in(socket.roomname).emit('addDiceRollResult', msgdata);
	});

	socket.on('consoleCommand', function(data) {
		const { cmd, args } = data;
		const commands = {
			cls: 'cls',
			col: 'col',
			displayname: 'displayname',
			portrait: 'portrait'
		};
		const knowncommands = Object.keys(commands);

		// exit function early if no command is detected
		if (knowncommands.includes(cmd) == false) return;

		console.log('========================');
		console.log('Received Console Command');
		console.log('========================');

		if (cmd === commands.cls) {
			console.log('clearing dicelog');
			DICELOG = '';

			for (var i in SOCKETS) {
				var psocket = SOCKETS[i];
				psocket.in(socket.roomname).emit('transferDiceLog', { log: DICELOG.toString() });
				// psocket.emit('transferDiceLog', { log: DICELOG.toString() });
			}

			return;
		}

		if (cmd === commands.col) {
			const parsedArgs = consolecommands.parseplayercolargs(args);
			let p = null;
			if (parsedArgs.target === 'self') {
				p = Player.list[socket.guid];
			} else {
				console.error(
					'player is trying to change player color using target playermethod,\
				this code should not be reachable at this point'
				);
			}
			console.log(p.userguid);
			p.color = parsedArgs.color;
			updateClientPlayerlists(socket.roomname);
		}
	});
});
