var socket = io('/ns-diceroller');

// const dc_socket = io('/ns-diceroller');

SETTINGS = {};
SETTINGS.DEBUG = { debugmode: true, autologin: true };
SETTINGS.PLAYERLIST = { portraitsize: '60px' };
//PLAYERLISTSETTINGS = {portraitsize:'60px'}

var logger = new simplelogger('DiceClientMain');
logger.on();

socket.on('disconnect', function() {
	alert('Disconnected from server');
	window.location.reload(false);
});

// init login fields
var divSign = document.getElementById('divSign');
var divSignUsername = document.getElementById('divSign-username');
divSignUsername.value = '';
var divSignPassword = document.getElementById('divSign-password');
var divSignSignIn = document.getElementById('divSign-signin');
var divsignLogindataFormName = document.getElementById('divSign-logindataform');

var divOptionsPlayAudio = document.getElementById('divOptions-playsounds');

var divClient = document.getElementById('divClient');
//var divClientRoll = document.getElementById('divClient-Roll');
var divClientPlayerlist = document.getElementById('divClient-playerlist');
var divClientRollResults = document.getElementById('divClient-RollResults');
var divClientDiceText = document.getElementById('divClient-dicetext');
var divClientDiceTextParsePreview = document.getElementById('divClient-dicetextParsePreview');

var divClientDiceRollForm = document.getElementById('divClient-RollForm');

let divDiceButtonsSubmit = document.getElementById('DiceButtonsSubmit');
let divDiceButtonsClear = document.getElementById('DiceButtonsClear');

let dicepool = new DicePool();
let modifierpool = new ModifierPool();

// resets all values
function reset() {
	console.log('Dicelient: resetting interface to default');
	// clear buttons
	dicepool = new DicePool();
	modifierpool = new ModifierPool();

	$('#dicestackmodifier').prop('value', 0); // reset dice modifier boeton;

	// clear form
	divClientDiceText.value = '';
}

/* Autologin for localhost connection*/
if (location.hostname === 'localhost' && SETTINGS.DEBUG.autologin) {
	console.log('DICECLIENT: running on localhost'), console.log(location);
	divSignUsername.value = 'DEBUG';
	divSignPassword.value = 'DND';
	document.getElementById('divSign-roomname').value = 'DEBUGROOM';
	submitSignIn();
}

function validateRoomName(s) {
	if (s.length > 20) return false;
	if (/^[0-9a-zA-Z]+$/.test(s) == false) return false;
	return true;
}

function submitSignIn() {
	// validate forms , then log in
	let roomname = document.getElementById('divSign-roomname').value;

	if (validateRoomName(roomname) === false) {
		document.getElementById('divSign-roomname').classList.add('is-invalid');
		return;
	} else {
		divClientDiceText.classList.remove('is-invalid');
	}

	if (divSignUsername.value.length > SETTINGS.DEBUG.autologin) {
		console.debug('Submitting login data');

		socket.emit('clientSignIn', {
			username: divSignUsername.value,
			password: divSignPassword.value,
			room: roomname
		});
	}
}

divsignLogindataFormName.onsubmit = function(e) {
	e.preventDefault(); // IMPORTANT, this prevents HTML from refreshing the page.
	console.log('logindata: OnSubmit');
	submitSignIn();
};

socket.on('clientSignInResponse', function(res) {
	if (res.succes) {
		console.log('Diceclient: Login succes!');
		// reset interface to defaults on enter
		reset();

		// switch from login div to client div
		// divSign.style="display:None;";
		// divClient.style="display:inline-block;";

		divSign.classList.add('animated');
		divSign.classList.add('fadeOutUp');

		setTimeout(function() {
			divSign.style = 'display:None;';
		}, 1000); // disables login element

		divClient.classList.add('animated');
		divClient.classList.add('faster');
		divClient.classList.add('fadeInUp');
		divClient.style += 'display:inline-block;';
		// slight delay to focussing on the dicefield, focussing breaks animations

		// fill in the room identifier at the top of the page;
		let roomidentifier = document.getElementById('diceclient-room');
		roomidentifier.innerHTML = document.getElementById('divSign-roomname').value;
		setTimeout(function() {
			divClientDiceText.focus();
		}, 500);
		divClientDiceText.value = '';
	} else {
		alert('Acces denied!');
	}
});
//-----------

/// converts single die texts like '+3d20' into arrays of numbers [20,20,20]
function parseDie(diestr) {
	console.warn('DEPRICATED: parseDie');
	var result = [];
	var sign = 1; // 1  / -1
	var multiplier = 1;
	var dieSides = 0;

	let c = ''; //console message

	// if the die is signed, retreive the sign and fillin 'sign' with +1 / -1
	// i know the die is signed by testing only the first character
	// i also only test if the sign is negative, I defaulted to positive in declaration.
	if (/[-+]/.test(diestr.slice(0, 1))) {
		if (diestr.slice(0, 1) === '-') sign = -1;
	}

	// get dice modifiers by first getting the number in front of 'd' + the 'd'
	// ex: 1d10 -> '1d'
	// then cut the d and parse the remaining number
	var reNumDice = /\d*d/i;
	var reNumDiceResult = reNumDice.exec(diestr);
	if (reNumDiceResult) {
		let die = reNumDiceResult[0].replace(/d/i, '');
		if (die.length === 0) die = '1';

		multiplier = parseInt(die);
	}

	// get dice SIDES by getting last number (number after d & end of string)
	var reDiceSides = /\d*$/; //any digit at the end of the string is considered a SidesCount
	var reDiceSidesResult = reDiceSides.exec(diestr);
	if (reDiceSidesResult) {
		let sides = reDiceSidesResult[0];
		if (sides.length != 0) dieSides = parseInt(sides);
	}

	// create list of dice
	for (var i = 0; i < multiplier; i++) {
		if (dieSides !== 0) result.push(dieSides * sign);
	}
	return result;
}

/// converts single die mod text like '+150' into a signed number 150
function parseDieModifier(modifierstr) {
	console.warn('DEPRICATED: parseDieModifier');
	let result = 0;
	let sign = 1;
	let modifier = 0;
	let c = ''; // console log message

	c += 'Parsing modifier ' + modifierstr + ' got: ';

	// get modifier sign (-/+), check if there is a -, otherwise default to +
	var modifierMatches = /[-+]/.exec(modifierstr);
	if (modifierMatches) {
		if (/-/.test(modifierstr)) sign = -1;
	}

	modifierval = modifierstr.replace(/[-+]/, '');
	modifier = parseInt(modifierval);

	result = modifier * sign;
	c += result;
	console.info(c);

	return result;
}

// parses
function parseDiceString_DEPR(dicestring) {
	console.warn('parseDiceString_DEPR is depricated');
	// structure of return value
	var parsedData = { dice: [], modifiers: [] };

	// regex the diceroll input form, force to lowercase  and remove whitespace
	var dicetext = divClientDiceText.value.toLowerCase();
	dicetext = dicetext.replace(/\s/, ''); // removes all whitespaces
	console.log('regexing dicetext ' + dicetext);

	// get all dice (any format any size)
	var reDice = /[-+]?\d*[dD]\d*/gi; //ex: [1d20, +1d20,-1d20, +d20, 1D120]
	//var reDice = /[-+]?(?<!\w)\d*(?i)d\d*/; //ex: [1d20, +1d20,-1d20, +d20, 1D120]
	var dieMatches = [ ...dicetext.matchAll(reDice) ];
	console.log(`found ${dieMatches.length} dice group(s) in string: ${dieMatches}`);

	// sort dicegroups

	// sorts all typed dice from highest to lowest
	dieMatches.sort(function(a, b) {
		let aVal = parseInt(a[0].slice(2, a[0].length)); // start at 2 due to format: +d10
		let bVal = parseInt(b[0].slice(2, b[0].length));
		console.log(`a: ${aVal} - b ${bVal}`);
		return bVal - aVal;
	});

	$('#dicestack').empty();

	for (var i in dieMatches) {
		let parsedDie = parseDie(dieMatches[i][0]); //WARNING: make sure this is safe
		console.log(`Parsed die: ${parsedDie}`);
		parsedData.dice = parsedData.dice.concat(parsedDie);

		// creates a dice button in the stack and binds the REMOVE function to it.
		$('<button />', {
			type: 'button',
			class: 'btn die dieRem btn-primary',
			id: 'd' + parsedDie,
			text: parsedDie,
			click: function() {
				dicestrack_removeDie('d' + parsedDie);
			}
		}).appendTo('#dicestack');
	}

	// get modifiers, any format any size
	var reModifiers = /[-+]\d+(?!\w)/g; //ex: [+100, -100]
	var modifierMatches = [ ...dicetext.matchAll(reModifiers) ];
	console.log(`found ${modifierMatches.length} modifier group(s) in string: ${modifierMatches}`);
	for (var i in modifierMatches) {
		var parsedMod = parseDieModifier(modifierMatches[i][0]);
		parsedData.modifiers = parsedData.modifiers.concat(parsedMod);
	}

	// update dice stack with new buttons

	return parsedData;
}

divDiceButtonsSubmit.onclick = function() {
	// check if fields are filled
	let dice = dicepool.flatten();
	if (dice.length > 0) fn_rolldice();
};

divDiceButtonsClear.onclick = function() {
	// clear dicestack and redraw
	dicepool = new DicePool();
	drawDiceStack();

	// clear modifiers and redraw
	modifierpool.pool = [ 0 ];
	$('#dicestackmodifier').prop('value', 0); // = firstval;
};

// Called when the HTML element of a die is clicked
function dicestack_addDie(dieType) {
	logger.log('adding die ' + dieType);

	dicepool.AddDie(dieType);
	drawDiceStack();
	// divClientDiceText.value += '+' + dieType;
	// divClientDiceText.onkeyup(); // force parse
}
function dicestrack_removeDie(dieType) {
	console.log('removing die ' + dieType);
	//let dp = new DicePool();
	dicepool.RemoveDie(dieType);
	divClientDiceText.value = '';
	drawDiceStack();

	logger = simplelogger('dicelient');
}

// clears the dicestack (visually) and draws new boetons.
function drawDiceStack() {
	logger.log('Drawing new dice stack');

	// clear dice stack, then fill it up again.
	$('#dicestack').empty();

	// JS orders the dice from lowest to highsest.
	// but it's nicer to have them reversed.
	let dicepoolKeys = Object.keys(dicepool.pool);
	dicepoolKeys = dicepoolKeys.reverse();

	for (let k in dicepoolKeys) {
		let key = dicepoolKeys[k];
		let dicestack = dicepool.pool[key];
		logger.debug(`Creating dice for stack: ${dicestack}`);

		for (let i in dicestack) {
			let die = dicestack[i];
			// create button code
			$('<button />', {
				type: 'button',
				class: 'btn die dieRem btn-primary',
				id: 'd' + die,
				text: die,
				click: function() {
					dicestrack_removeDie('d' + die);
				}
			}).appendTo('#dicestack');
		}
	}
}

// constructs a string from given dice + modifiers
function createParsedDiceMessage(dice, modifiers) {
	var dicemsg = '';
	var modifiersmsg = '';

	for (var i in dice) {
		dicemsg += 'd' + dice[i] + ', ';
	}

	//cut of last ', ' and replace it with )
	dicemsg = dicemsg.slice(0, dicemsg.length - 2);

	for (var i in modifiers) {
		let sign = '';
		if (modifiers[i] >= 0) sign = '+';
		modifiersmsg += sign + modifiers[i] + '';
	}

	return `Dice: (${dicemsg}), Modifiers: (${modifiersmsg})`;
}

function incrementModifierValue(increment) {
	// check if shift is held ()
	let firstval = modifierpool.pool[0];
	firstval += increment;

	modifierpool.pool = [ firstval ];

	if (firstval >= 0) firstval = '+' + firstval;

	$('#dicestackmodifier').prop('value', firstval); // = firstval;
}

function parseDiceClientText(dicetext) {
	// dicetext = dicetext.replace(/\s/, ''); // remove spaces

	let pd = dicepool.parseDiceString(dicetext);

	let modParseData = modifierpool.parseModString(pd.skipped);

	let skippedData = modParseData.skipped;

	let fnResult = { parseddice: pd.dicepool, parsedmods: modParseData.modifiers, skipped: skippedData };

	return fnResult;
}

function validateDiceClientText() {
	let dicetext = divClientDiceText.value.replace(/\s/, ''); // remove whitespace
	let pd = parseDiceClientText(dicetext);

	if (pd.skipped !== '') return false;

	return true;
}
// responds to keypresses, calls parseDiceString
divClientDiceText.onkeyup = function() {
	if (validateDiceClientText() === false) {
		divClientDiceText.classList.add('is-invalid');
	} else {
		divClientDiceText.classList.remove('is-invalid');
	}
};

function parseConsoleCommand(commandstring) {
	let result = {
		cmd: '',
		args: []
	};

	words = commandstring.split(' ');
	result.cmd = words.shift();
	result.args = words;

	return result;
}
// Handles parsing console commands and sends them to the server / or executes them locally
var fn_handleconsolecommand = function(command) {
	const { cmd, args } = parseConsoleCommand(command);

	// const knownCommands = {
	// 	clearlog: (x) => x === 'cls',
	// 	setplayercolor: (x) => x === 'col',
	// 	setplayerportrait: (x) => x === 'portrait'
	// };
	console.log('checking for command ' + cmd);
	const knownCommands = [ 'cls', 'col', 'portrait' ];

	if (knownCommands.indexOf(cmd) >= 0) {
		console.log(`Console command ${cmd} detected with args: ${args}`);
		socket.emit('consoleCommand', { cmd: cmd, args: args });
	} else console.log('not found');

	// check if the command string finds a console command:

	// if (knownCommands.clearlog(cmd)) {
	// 	// if (command === 'cls') {
	// 	//var cmd = 'cls';
	// 	socket.emit('consoleCommand', { cmd: cmd });

	// 	divClientDiceText.value = '';
	// 	return;
	// }

	// if (knownCommands.setplayercolor(cmd)) {
	// 	let colorval = command.slice(4, command.length);
	// 	socket.emit('consoleCommand', { cmd: 'col', args: args });
	// 	divClientDiceText.value = '';
	// 	return;
	// }

	// if (knownCommands.setplayerportrait(cmd)) {
	// 	socket.emit('consoleCommand', { cmd: cmd, args: args });
	// 	divClientDiceText.value = '';
	// 	return;
	// }

	divClientDiceText.value = '';
};

var lastRoll = Date.now();
var DICEREROLLTIME = 250;

// Sends Dicepool to server
var fn_rolldice = function() {
	console.log('rolling dice');
	// regex the diceroll input form
	// handle change events
	let dicetext = divClientDiceText.value.replace(/\s/, '');

	//if(dicetext === '') return;

	// prevent rerolling
	let dTime = Date.now() - lastRoll;
	if (dTime < DICEREROLLTIME) {
		console.log(`Rolling not allowed for another ${DICEREROLLTIME - dTime}.`);
		return; // do nothing
	}

	lastRoll = Date.now();

	// create object to send to server:
	// data format v1
	// {dice:[20,20,10,10...], modifiers:[+1,-1]}
	console.log('creating net object for dicepool ' + JSON.stringify(dicepool.pool));
	let flattenedDice = dicepool.flatten();
	console.log('Flattened dice list: ' + flattenedDice);
	let mods = modifierpool.getPool();
	console.log(modifierpool);
	console.log('creating net object for modpool ' + JSON.stringify(mods));
	let netObj = { dice: dicepool.flatten(), modifiers: mods };

	// var parsedData = parseDiceString_DEPR(dicetext);

	let parsedData = netObj;

	logger.log('Rolling dice ' + JSON.stringify(parsedData));
	socket.emit('rollDice', parsedData);

	// clear field after roll
	var el = document.getElementById('divOptions-clearAfterRoll');
	if (el.checked) {
		divClientDiceText.value = '';
		dicepool.pool = {};
		drawDiceStack();
	}
};

divClientDiceRollForm.onsubmit = function(e) {
	e.preventDefault(); // IMPORTANT, this prevents HTML from refreshing the page.

	let dicetext = divClientDiceText.value;
	console.log(dicetext);

	if (dicetext !== '') {
		if (dicetext[0] === '/') {
			fn_handleconsolecommand(dicetext.slice(1, dicetext.length));
		} else {
			if (validateDiceClientText()) {
				let pr = parseDiceClientText(dicetext);
				console.log(JSON.stringify(pr));
				dicepool.pool = pr.parseddice;
				modifierpool.pool = pr.parsedmods;

				console.log(JSON.stringify(dicepool));
				fn_rolldice();
			}
		}
	}
};

let Playerslist = {};
// update player list field
socket.on('setPlayerList', function(data) {
	console.log('Updating player data:');
	console.log(data);
	console.log('stored player data:');
	console.log(Playerslist);

	console.log('receiving new playerlist');

	// handle players that have left, remove effects Etc
	for (var i in Playerslist) {
		let player = Playerslist[i];
		let playerActive = false;
		console.log('checking if player is still active: ' + player.username);

		// if the player exists in the updated list, the player is still present,
		// if the player is NOT in the playerlist, play remove effect & delete after 2 seconds
		for (y in data) {
			let serverPlayer = data[y];
			if (player.guid === serverPlayer.guid) {
				// if this place is reached, that means that the player is still in the room
				playerActive = true;
				console.log('player is still active');
				break;
			}
		}

		if (playerActive === false) {
			console.log(`${player.username} as left, removing his shit`);
			// clear player from playerlist (after 2s)

			console.log(`removing ${player.username}'s guid ${player.guid}`);
			playerHtmlElement = document.getElementById(player.guid);
			console.log(playerHtmlElement);

			// set an animation for the player to leave
			setTimeout(function() {
				// this is a hack if I ever saw one, first timeout creates animations,
				// then start a new delay that deletes the player
				//let guid = player.guid;
				playerHtmlElement = document.getElementById(player.guid);
				playerHtmlElement.classList.add('animated');
				playerHtmlElement.classList.add('fadeOutRight');
				setTimeout(function() {
					delete Playerslist[player.guid];
					playerHtmlElement.parentNode.removeChild(playerHtmlElement);
				}, 500);
			}, 1000);
		}
	}

	// list players that have been updated
	let fancydelayAnimation = 0;
	for (var i in data) {
		let animationHtml = 'fadeInRight';
		// animationHtml = '';

		let storedPlayerData = Playerslist[data[i].guid];
		if (storedPlayerData) {
			console.log(`${storedPlayerData.username} is already in playerlist with guid: ${storedPlayerData.guid}`);
			let playerHtmlElement = document.getElementById(storedPlayerData.guid);
			let jqobject = $('#' + storedPlayerData.guid);
			console.log('Found html element for player' + JSON.stringify(playerHtmlElement));
			console.log('Found html json for player' + JSON.stringify(jqobject));
			playerHtmlElement.classList.remove('animated');

			let childNodes = playerHtmlElement.childNodes;
			console.log('found childnodes ' + JSON.stringify(childNodes));
			let playerNameNode = childNodes[1].childNodes[0]; // TODO: find better way to get player color

			if (data[i].color === 'unicornfarts') {
				console.log('so you are a big boi? ' + data[i].color);
				playerNameNode.classList.add('rainbow');
				playerNameNode.classList.add('fast');
				playerNameNode.style.color = '';
			} else {
				playerNameNode.classList.remove('rainbow');
				playerNameNode.classList.remove('fast');
				playerNameNode.style.color = data[i].color;
			}

			// console.log(playerNameNode.classList);
			// update color / portrait

			Playerslist[data[i].guid] = data[i];
			continue;
		}
		fancydelayAnimation += 65;
		Playerslist[data[i].guid] = data[i];

		var username = data[i].username;
		let guid = data[i].guid;
		var color = data[i].color;
		let imgname = `./img/${username}.png`;

		console.log('generating player HTML code');
		// todo: create stump HTML file for this
		// let htmlcode = `<div id='${guid}' class="media ${animationHtml}" style="animation-delay:${fancydelayAnimation}ms;">`;
		let htmlcode = '';
		htmlcode = '<a class="pull-left" href="#">';
		htmlcode += `<img class="media-object" src= ${imgname} width=${SETTINGS.PLAYERLIST.portraitsize}>`;
		htmlcode += '</a>';
		htmlcode += '<div class="media-body" style="vertical-align: middle; padding:1em;">';
		htmlcode += `<h4 class="media-heading" style="color:${color}; ">${username}</h4>`;
		// htmlcode += '</div>';

		// divClientPlayerlist.innerHTML += '<div style="color:' +color+  ';">' + username + '</div>';
		// divClientPlayerlist.innerHTML += htmlcode;
		console.log('generating player html div element');
		let div = document.createElement('div');
		div.id = guid;
		div.classList.add('media');
		div.classList.add('animated');
		div.classList.add(animationHtml);
		div.style = `animation-delay:${fancydelayAnimation}ms`;
		div.innerHTML = htmlcode;

		divClientPlayerlist.appendChild(div);
	}
});

// appends new html data to dicelog
socket.on('addDiceRollResult', function(data) {
	// add dice result on top of tray
	// currently server decides HTML coding
	divClientRollResults.innerHTML = data.html + divClientRollResults.innerHTML;
	console.log('received diceroll from server');
	// play sounds
	if (divOptionsPlayAudio.checked) {
		var sfxfile = 'diceroll_';
		console.log('rolled dice: ' + data.numDice);
		if (data.numDice == 1) sfxfile += '1_' + Math.floor(Math.random() * 3 + 1).toString();
		else if (data.numDice > 1) sfxfile += '4_' + Math.floor(Math.random() * 2 + 1).toString();

		if (data.critData.didCrit) {
			if (data.critData.critType === 'HIT') sfxfile = 'tada';
			if (data.critData.critType === 'MISS') sfxfile = 'oof';
		}

		console.log('playing sfx ' + sfxfile);
		var audio = new Audio('/audio/' + sfxfile + '.mp3');
		audio.play();
	}
});

// copies dicelog from server
socket.on('transferDiceLog', function(data) {
	console.log('Receiving dicelog' + data.log);
	divClientRollResults.innerHTML = data.log;
});
