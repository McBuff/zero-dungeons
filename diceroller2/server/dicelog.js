// load DB stuffs

console.log('Initting DB');

// const MONGODB = require('mongojs');
// let db = MONGODB('localhost:27017/myGame', [ 'account', 'progress' ]);
// console.log(db);

const MongoClient = require('mongodb').MongoClient;

const mongoose = require('mongoose');
mongoose.pluralize(null);

require('dotenv/config');
mongoose.connect(process.env.DB_CONNECTIONCLOUD_DICELOGS, { useNewUrlParser: true }, () =>
	console.log('connected to DB!')
);

const DiceLogMongooseObj = require('../model/Dicelogs');
const dcschema = require('../model/Dicelogs');

// const DiceLogModel = mongoose.model('Roomnameplaceholder', dcschema);
// const diceLogDoc = new DiceLogModel({
// 	date: 123,
// 	username: 'mrpoopybutt',
// 	color: '#ff00ff',
// 	diceRolls: [ 20, 20, 20 ],
// 	diceUsed: [ 20, 20, 20 ],
// 	modifers: [ +100 ],
// 	rollType: 'r'
// });

// diceLogDoc.save();

class diceLog {
	// make sure roomname is valid first
	constructor(roomname) {
		console.log('dicelog created with roomname: ' + roomname);
		this.roomname = roomname;
		this.dicelogmodel = mongoose.model(roomname, dcschema);
	}

	// no CB function, just checks if roomname is valid
	isRoomNameValid(roomname) {
		return true;
	}

	composeRoomPath(roomname) {
		return LOCATIONS['dicelogs'] + roomname + '.csv';
	}

	dicelogExists(roomname, cb) {}

	writeEntry(data) {
		// client.db('dicelog').createCollection(roomname);
		const dicelogDoc = new this.dicelogmodel({
			date: data.time,
			username: data.playerDisplayName,
			color: data.playerColor,
			diceRolls: data.diceResults,
			diceUsed: data.diceUsed,
			modifers: data.modifers,
			rollType: 'r'
		});

		dicelogDoc.save();
	}
}

exports.diceLogObj = diceLog;
