var mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

const playerSchema = new mongoose.Schema({
  // id: Schema.Types.ObjectId,
  first_name: String,
  last_name: String,
  clubs: [{type: Schema.Types.ObjectId, ref: 'club'}],
  seasons: [{type: Schema.Types.ObjectId, ref: 'season'}],
  player_rounds: [{type: Schema.Types.ObjectId, ref: 'player_round_score'}],
  created: {type: Date, default: Date.now()},
  email: String,
  password: String,
  isOwner: Boolean,
  isAdmin: Boolean,
  avatarUrl: String
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
