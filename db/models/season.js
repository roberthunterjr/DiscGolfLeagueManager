var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const seasonSchema = new mongoose.Schema({
  // _id: Schema.Types.ObjectId,
  name: String,
  year: Number,
  club: {type: Schema.Types.ObjectId, ref: 'club'},
  rounds: [{type: Schema.Types.ObjectId, ref: 'round'}],
  players: [{type: Schema.Types.ObjectId, ref: 'player'}],
  courses: [{type: Schema.Types.ObjectId, ref: 'course'}],
  admins: [{type: Schema.Types.ObjectId, ref: 'player'}]
});

module.exports = mongoose.model('season', seasonSchema);
