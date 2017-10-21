var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const sObject = Schema.Types.ObjectId;
const roundSchema = new mongoose.Schema({
  round_number: Number,
  players: [{type: sObject, ref: 'player'}],
  completed: Boolean,
  course: {type: sObject, ref: 'course'},
  date: Date,
  cards: {type: sObject, ref: 'card'},
  scores: [{type: sObject, ref: 'player_round_score'}],
  season: {type: sObject, ref: 'season'}
  // total_strokes: Number,
  // game: {type: sObject, ref: 'game'},
  // player_tag: String
});

module.exports = mongoose.model('round', roundSchema);
