var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const clubSchema = new Schema({
  // _id: Schema.Types.ObjectId,
  name: String,
  admins: [{type: Schema.Types.ObjectId, ref: 'player'}],
  seasons: [{type: Schema.Types.ObjectId, ref: 'season'}]
});

module.exports = mongoose.model('club', clubSchema);
