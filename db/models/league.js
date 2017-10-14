var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const leagueSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  year: Date,
  club: {type: Schema.Types.ObjectId, ref: 'club'},
});

module.exports = mongoose.model('league', leagueSchema);
