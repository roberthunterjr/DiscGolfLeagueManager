var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const gameSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  rounds: [{type: Schema.Types.ObjectId, ref: 'round'}],
  league: {type: Schema.Types.ObjectId, ref: 'league'}
});

module.exports = mongoose.model('game', gameSchema);
