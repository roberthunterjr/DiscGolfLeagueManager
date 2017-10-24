var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const cardSchema = new mongoose.Schema({
  // _id: Schema.Types.ObjectId,
  starting_hole: Number,
  holes_completed: Number,
  clubs: [{type: Schema.Types.ObjectId, ref: 'club'}],
  season: {type: Schema.Types.ObjectId, ref: 'season'},
  round:{type: Schema.Types.ObjectId, ref: 'round'},
  date: {type: Date, default: Date.now()},
  score_keeper: {type: Schema.Types.ObjectId, ref: 'player'},
  admin: {type: Schema.Types.ObjectId, ref: 'player'},
  players: [{type: Schema.Types.ObjectId, ref: 'player'}]
});

module.exports = mongoose.model('card', cardSchema);
