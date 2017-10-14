var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const courseSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  location: String,
  length: Number,
  holes: [{type: Schema.Types.ObjectId, ref: 'hole'}],
  number_hole: Number
});

module.exports = mongoose.model('course', courseSchema);
