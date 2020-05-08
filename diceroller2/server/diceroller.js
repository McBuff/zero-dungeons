Number.prototype.pad = function(size) {
	var s = String(this);
	while (s.length < (size || 2)) {
		s = '0' + s;
	}
	return s;
};

/**
	returns indices of all specified numbers for diceype X
	*/
function getHits(rolls, dice, targetrolls = [ 20 ], dicetype = 20) {
	let hits = [];
	// console.log('target rolls: ' + targetrolls)
	// for all d20 dice, check if roll == 20
	for (let i in dice) {
		const d = dice[i];
		if (d === dicetype) {
			if (targetrolls.includes(rolls[i])) hits.push(i);
		}
	}
	return hits;
}
/**
 * Formats a CRIT
 */
function formatCrit(v) {
	return '<span class="rainbow fast crit hit">' + v.toString() + '</span>';
}
function formatMiss(v) {
	return '<span class="crit miss">' + v.toString() + '</span>';
}
/**
	 * 
	 * @param {[]} rolls - list of rolled values
	 * @param {[]} dice - list of dice used
	 * 
	 */
function formatRolls(rolls, dice) {
	const crits = getHits(rolls, dice);
	const miss = getHits(rolls, dice, [ 1 ]);
	let formattedRolls = [];

	for (i in rolls) {
		if (crits.includes(i)) {
			// die is a crit, format as crit
			formattedRolls.push(formatCrit(rolls[i]));
		} else if (miss.includes(i)) {
			formattedRolls.push(formatMiss(rolls[i]));
		} else formattedRolls.push(rolls[i]);
	}

	return formattedRolls.map((x) => '+' + x);
}

/** 
	// generates the HTML code for a rollmessage. Append this to the dicelog UL
	*/
function generateRollMessage(data, markCrits = true) {
	/* Looks like
		[17:52:06] - Deus: 46 <- 9+13+8+16 
		 */

	const rolls = data.rolls;
	const dice = data.dice;
	const modifiers = data.modifiers;
	const time = new Date(data.date);
	const username = data.username;
	const color = data.usercolor;

	const rollSum = rolls.reduce((a, b) => a + b, 0);
	const modifiersSum = modifiers.reduce((a, b) => a + b, 0);

	// create timestamp ex. [12:00:21]
	const timestamp = '' + time.getHours().pad() + ':' + time.getMinutes().pad() + ':' + time.getSeconds().pad();
	let timeCode = `<timestamp>[${timestamp}]</timestamp>`;

	// Create User ex. Deus
	const userCode = `<username style="color:${color};">${username}</username>`;

	// Create Roll result
	const fDice = dice.map((n) => 'd' + n); // 20 -> 'd20'
	const fMods = modifiers.map((n) => (n < 0 ? '' : '+') + n); // 20 -> '+20'
	const fRolls = formatRolls(rolls, dice);
	const rollCode = `${rollSum + modifiersSum} <- <dicerollinfo>${fRolls} (${fDice}) + (${fMods})</dicerollinfo>`;

	// ComposeCode:
	let htmlMessage = `<li>${timeCode} - ${userCode}: ${rollCode}</li>`;

	return htmlMessage;
}

module.exports = {
	getHits,
	formatCrit,
	formatMiss,
	formatRolls,
	generateRollMessage
};
