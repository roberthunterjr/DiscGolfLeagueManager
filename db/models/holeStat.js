var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const sObject = Schema.Types.ObjectId;
const holeStatSchema = new mongoose.Schema({
  _id: sObject,
  league: {type: sObject, },
  player: {type: sObject, ref: 'player'},
  course: {type: sObject, ref: 'course'},
  round: {type: sObject, ref: 'round'},
  hole: {type: sObject, ref: 'hole'},
  number_strokes: Number
});

module.exports = mongoose.model('hole_stat', holeStatSchema);
