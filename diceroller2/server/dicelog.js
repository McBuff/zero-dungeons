// load DB stuffs

console.log('Initting DB');

// const MONGODB = require('mongojs');
// let db = MONGODB('localhost:27017/myGame', [ 'account', 'progress' ]);
// console.log(db);

const MongoClient = require('mongodb').MongoClient;

const mongoose = require('mongoose');
mongoose.pluralize(null);

require('dotenv/config');
mongoose.connect(process.env.DB_CONNECTION_DICELOGS, { useNewUrlParser: true }, () => console.log('connected to DB!'));

const DiceLogMongooseObj = require('../model/Dicelogs');
const dcschema = require('../model/Dicelogs');

//** Debug area */

class diceLog {
	// make sure roomname is valid first
	constructor(rmnlabel) {
		// let rmn = rmnlabel;
		console.log('dicelog created with roomname: ' + rmnlabel);
		console.log('dicelog created with schema: ' + JSON.stringify(dcschema));
		this.roomname = rmnlabel;
		this.dicelogmodel = mongoose.model(rmnlabel, dcschema);
	}

	// no CB function, just checks if roomname is valid
	isRoomNameValid(roomname) {
		if (roomname.length > 20) return false;
		if (/^[0-9a-zA-Z]+$/.test(roomname) == false) return false;
		return true;
	}

	dicelogExists(roomname, cb) {}

	async writeEntry(data) {
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

	async readEntry(l = 10) {
		console.log('DB: Requesting room data');
		const r = await this.dicelogmodel.find().limit(l);
		return r;
	}
}

exports.diceLogObj = diceLog;
