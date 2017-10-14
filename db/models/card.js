var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const cardSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  first_name: String,
  last_name: String,
  clubs: [{type: Schema.Types.ObjectId, ref: 'club'}],
  leagues: [{type: Schema.Types.ObjectId, ref: 'league'}],
  created: Date,
  email: String,
  password: String,
  isOwner: Boolean,
  isAdmin: Boolean
});

module.exports = mongoose.model('card', cardSchema);
