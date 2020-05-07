/// Handles Express Requests
console.log('Initting dr_expressrequests.js');

let basepath = LOCATIONS.diceclientroot;

/** Images */
app.get('/diceroller/img/:im', function(req, res) {
	// if user requests ANY image, send it, unless it doesn't exist, then send placeholder.
	console.log('user requested image: ' + req.params.im);
	// app paths are stored in LOCATIONS global

	// check if file exists, otherwise send placeholder
	const fs = require('fs');
	let _filepath = basepath + '/client/img/' + req.params.im;
	if (fs.existsSync(_filepath) === false) {
		console.debug('User requested an image that does not exists, sending placeholder.png');
		_filepath = basepath + '/client/img/' + 'placeholder.png';
	}
	res.sendFile(_filepath);
});

/* audio */

app.get('/audio/:aud', function(req, res) {
	console.log('user requested sound: ' + req.params.aud);

	// check if file exists, otherwise log warning
	const fs = require('fs');
	let _filepath = basepath + '/client/audio/' + req.params.aud;
	if (fs.existsSync(_filepath) === false) {
		console.warn(`User requested soundfile that does not exist: ${_filepath}`);
		return;
	}
	res.sendFile(_filepath);
});

/* stylesheets */
app.get('/diceroller/dice.css', function(req, res) {
	console.log('client requested dice.css');
	res.sendFile(basepath + '/client/dice.css');
});

/* Clientside scripts */
app.get('/diceroller/simplelogger.js', function(req, res) {
	console.log('client requested js: simplelogger.js');
	res.sendFile(basepath + '/client/simplelogger.js');
});

app.get('/diceroller/diceparser.js', function(req, res) {
	console.log('client requested js: diceparser.js');
	res.sendFile(basepath + '/client/diceparser.js');
});

console.log('Finished dr_expressrequests.js');
