var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const playerSchema = new mongoose.Schema({
  // id: Schema.Types.ObjectId,
  first_name: String,
  last_name: String,
  clubs: [{type: Schema.Types.ObjectId, ref: 'club'}],
  leagues: [{type: Schema.Types.ObjectId, ref: 'league'}],
  created: {type: Date, default: Date.now()},
  email: String,
  password: String,
  isOwner: Boolean,
  isAdmin: Boolean
});

module.exports = mongoose.model('player', playerSchema);
