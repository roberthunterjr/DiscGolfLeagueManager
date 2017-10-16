var mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
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

playerSchema.methods.hashPw = function(raw) {
  return new Promise(function(resolve, reject) {
    bcrypt.hash(raw, null, null, (err, hash) => {
      if(!err){
        resolve(hash);
      } else {
        reject(err);
      }
    });
  });
};

module.exports = mongoose.model('player', playerSchema);
