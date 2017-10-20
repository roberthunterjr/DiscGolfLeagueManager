const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const Models = require('../db/models.js');
const jwt = require('jsonwebtoken');

module.exports.getPlayers = function() {
  return Models.Player.find().select({first_name: 1}).exec();
};

module.exports.getPlayer = function(userid) {
  return Models.Player.findById(userid).exec();
}
module.exports.addPlayer = function(player) {
  let tempPlayer = new Models.Player(player);
  return tempPlayer.hashPw(player.password)
    .then((hashedPw) =>{
      tempPlayer.password = hashedPw;
      return tempPlayer.save({player})
    })
    .then((player) => {
      //try filtering pw
      return player;
    })
    .then((player) => {
      let payload = {};
      let apiToken = jwt
        .sign({
          isLoggedIn: true,
          userId: player._id
        },
        'dgolf',
        {
          expiresIn: 99999*99999
        });
      payload.player = player;
      payload.token = apiToken;
      return payload;
    })
    .catch((err) =>{
      console.log('err adding user with hashed pw', err);
    });
};

module.exports.login = function(credentials) {
  //check to see if there is a user with the email
  return Models.Player.find({email: credentials.email}).select({}).exec()
    .then((user)=> {
      //make sure there are results
      return new Promise(function(resolve, reject) {
        if(user.length === 0 ) {
          reject('No user found');
        }
        let hashed = user[0].password;
        return bcrypt.compare(credentials.password, hashed, function(err, result) {
          // console.log('the result is ', result);
          if(result) {
            delete user.password;
            resolve(user[0]);
          } else {
            reject('Invalid information provided sir');
          }
        });
      });
    })
    .then((player) => {
      payload = {};
      payload.player = player;
      payload.token = jwt
      .sign({
        isLoggedIn: true,
        userId: player._id
        },
        'dgolf',
        {
          expiresIn: 99999*99999
        }
      );
      return(payload);
    });
}

module.exports.getAuth = function(key) {
  return new Promise(function(resolve, reject) {
    jwt.verify(key, 'dgolf', function(err, decoded) {
      console.log(decoded);
      if(!err){
        resolve(decoded);
      } else {
        reject(false);
      }
    });
  });
}

module.exports.addScores = function(playerScores) {
  let hole = playerScores.hole;
  let scoreStats = playerScores.player_score.map((playerScoreTuple) => {
    return new Models.HoleStat({
      player: (Object.keys(playerScoreTuple))[0],
      number_strokes: playerScoreTuple[Object.keys(playerScoreTuple)[0]]
    }).save();
  });
  return Promise.all(scoreStats);
  // return new Promise(function(resolve, reject) {
  //   scoreStats.forEach((scoreModel) => {
  //     return scoreModel.save();
  //   });
  // });
}

module.exports.getSeasonsByPlayer = function(playerId) {
  //first find the club they belong to, then populate every season field
  return Models.Player.findOne({_id: playerId})
    .populate({
      path: 'seasons',
      populate: {
        path: 'courses',
      },
      populate: {
        path: 'players'
      },
      populate: {
        path: 'rounds'
      }
    })
    .exec()
    .then((seasons) => {
      console.log('What do we have heree\n',seasons);
      return seasons;
    })
  // return Models.Season.find(club)
}
/*
When adding a club we are expecting this to occur only in tandum with
a recent user signup or from the panel of an already authenticated user.
In either case, a single player Id should be provided to be pushed into admin [].
Additionally, this will be set to update if the club already exists in the db
club = {name: "String", id: Player_id}
*/

module.exports.addClub = function(club) {
  //parse into allcaps, no space search
  //let nameSearch = club.name.split('').join('').toUpperCase();
  // return Models.Club.find({first_name: club.first_name})
}
