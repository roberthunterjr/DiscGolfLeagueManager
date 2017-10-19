var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const courseSchema = new mongoose.Schema({
  name: String,
  location: String,
  length: Number,
  par: Number,
  hole_number: Number,
  hole_details: Schema.Types.Mixed
});

module.exports = mongoose.model('course', courseSchema);
