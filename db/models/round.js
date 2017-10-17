var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const sObject = Schema.Types.ObjectId;
const roundSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  player: {type: sObject, ref: 'player'},
  tournament: {type: sObject, ref: 'tournament'},
  course: {type: sObject, ref: 'course'},
  league: {type: sObject, ref: 'league'},
  total_strokes: Number,
  date: Date,
  game: {type: sObject, ref: 'game'},
  player_tag: String
});

module.exports = mongoose.model('round', roundSchema);
