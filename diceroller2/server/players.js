// will contain playerlist and interactions with said lists

const uuidv4 = require('uuid').v4;

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

/*
Helper methods
 */
function pullColor() {
	console.debug('pulling color from colorcycle');
	color = USERCOLORS.shift();
	USERCOLORS.push(color);
	return color;
}

module.exports = Player;
