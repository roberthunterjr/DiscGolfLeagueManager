var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const courseSchema = new mongoose.Schema({
  name: String,
  location: String,
  length: Number,
  par: Number,
  number_of_holes: Number,
  hole_details: Schema.Types.Mixed
});

module.exports = mongoose.model('course', courseSchema);
