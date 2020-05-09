const consolecommands = function() {
	setplayercol = function(args, socket) {
		const { target, color } = args; // deconstruct args
		console.warn('not implemented until playerlist is seperated from main app.js');
		// find player's guid through socket
		// change player's color through socket
		// emit?
	};
};

/**
     * helper function for parsing color change arguments
     */
consolecommands.parseplayercolargs = function(args, socket) {
	// determine if player used a target or not
	// for now we'll assume that if there is only 1 key, there is one argument
	// if there are 2 keys, this user is requesting to change a target player's color
	// right now, when 2 keys are provided, I'll ignore the username and set it to self
	// for security)
	const keys = Object.keys(args);
	let newargs = { target: 'self', color: '' };

	// faulty input? Return null
	if (keys.length === 0) return null;

	if (keys.length === 1) newargs.color = args[0];

	if (keys.length === 2) {
		newargs.color = args[1];
		console.warn(
			'playercolorparser received 2 arguments, \
            this is OK but the target player is currently being ignored.'
		);
	}

	return newargs;
};
module.exports = consolecommands;
