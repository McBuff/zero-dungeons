const mongoose = require('mongoose');

const DicelogSchema = mongoose.Schema(
	{
		date: {
			type: Number,
			default: Date.now
		},
		username: {
			type: String,
			required: true
		},
		color: {
			type: String,
			required: true
		},
		diceRolls: {
			type: [ Number ],
			required: true
		},
		diceUsed: {
			type: [ Number ],
			required: true
		},
		modifiers: {
			type: [ Number ]
		}
	}
	// { collection: 'nomoreSplease' }
);

module.exports = DicelogSchema;
