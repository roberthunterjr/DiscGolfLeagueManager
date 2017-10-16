const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const Models = require('../db/models.js');

module.exports.getPlayers = function() {
  return Models.Player.find().select({first_name: 1}).exec();
};

module.exports.addPlayer = function(player) {
  let tempPlayer = new Models.Player(player);
  return tempPlayer.hashPw(player.password)
    .then((hashedPw) =>{
      tempPlayer.password = hashedPw;
      return tempPlayer.save({player})
    })
    .catch((err) =>{
      console.log('err adding user with hashed pw', err);
    });
}
