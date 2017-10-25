var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const sObject = Schema.Types.ObjectId;
const roundScoreSchema = new mongoose.Schema({
  season: {type: sObject, ref: 'season'},
  round: {type: sObject, ref: 'round'},
  player: {type: sObject, ref: 'player'},
  division: String,
  date : {type: Date, default: Date.now()},
  card: {type: sObject, ref: 'card'},
  course: {type: sObject, ref: 'course'},
  holes: [{type: Schema.Types.Mixed}],
  par_score: {type: Number, default: 2},
  total_strokes: {type: Number, default: 0}
});

module.exports = mongoose.model('player_round_score', roundScoreSchema);
