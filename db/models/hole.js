var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const holeSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  number: Number,
  par: Number,
  length: Number
});

module.exports.Hole = mongoose.model('hole', holeSchema);
