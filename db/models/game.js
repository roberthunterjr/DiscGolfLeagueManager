var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const gameSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  rounds: [{type: Schema.Types.ObjectId, ref: 'round'}],
  season: {type: Schema.Types.ObjectId, ref: 'season'}
});

module.exports = mongoose.model('game', gameSchema);
