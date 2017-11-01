var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const sObject = Schema.Types.ObjectId;
const roundSchema = new mongoose.Schema({
  round_number: Number,
  players: [{type: sObject, ref: 'player'}],
  completed: Boolean,
  in_progress: Boolean,
  course: {type: sObject, ref: 'course'},
  date: {type: Date, default: Date.now()},
  cards: [{type: sObject, ref: 'card'}],
  scores: {type: Schema.Types.Mixed},
  // scores: [{type: sObject, ref: 'player_round_score'}],
  season: {type: sObject, ref: 'season'},
  number_rounds: Number
});

module.exports = mongoose.model('round', roundSchema);
