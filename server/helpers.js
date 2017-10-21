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
  // let tempPlayer = new Models.Player(player);
  // return tempPlayer
  //   .hashPw(player.password)
  //   .then((hashedPw) => {
  //     tempPlayer.password = hashedPw
  //     return tempPlayer.save()
  //   })
  //   .then((savedPlayer) => {
  //     return Models.Season.findOne({name: 'Fall 2017'})
  //       .then((season) => {
  //         season.players.push(savedPlayer._id)
  //         return season.save()
  //           .then((savedSeason) => {
  //             return { player: savedPlayer, season: savedSeason }
  //           })
  //       })
  //   })
  //   .then(({ player, season }) => {
  //     return Models.Round.find({}).exec()
  //       .then((rounds) => {
  //         return Promise.all(rounds.map((round) => {
  //           return round.season.push(season._id).save();
  //         }))
  //       })
  //   })

  let tempPlayer = new Models.Player(player);
  return tempPlayer.hashPw(player.password)
    .then((hashedPw) =>{
      tempPlayer.password = hashedPw;
      var updates = {};
      updates.season = Models.Season.findOne({}).exec();
      updates.player = tempPlayer.save();
      updates.round = Models.Round.find({});
      return Promise.all([updates.season,updates.player, updates.round])
    })
    .then((updates) => {
      // console.log('Here are the updates',updates)
      //great place to add to clubs n stuff
      //assumming that we will add to first season and all rounds
      //try filtering pw
      return Promise.all(updates[2].map((round) => {
        // add player id to each round
        // console.log('Here we are ',updates[1]._id)
        round.players.push(updates[1]._id);
        return round.save();
      }))
      .then((rounds) => {
        // console.log('Resolved rounds \n', rounds);
        // add player id to the season
        // console.log('this is the season', updates[0]);
        updates[0].players.push(updates[1]._id);
        return updates[0].save();
      })
      .then((season) => {
        console.log('This is the resolved season', season);
        return Models.Player.findOne({_id: updates[1]._id}).exec()
          .then((foundPlayer) => {
            // console.log('season id check', season._id);
            foundPlayer.seasons.push(season._id);
            return foundPlayer.save();
          })
          .then((insertedPlayer) => {
            console.log('Final player', insertedPlayer);
            return insertedPlayer;
          })
      })
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
      }
    })
    .populate({
      path:'seasons',
      populate: {
        path:'players'
      }
    })
    .populate({
      path: 'seasons',
      populate: {
        path: 'rounds',
        options: {
          sort: {round_number: 1}
        }
      }
    })
    .exec()
    .then((seasons) => {
      // console.log('What do we have heree\n',seasons);
      return seasons;
    })
  // return Models.Season.find(club)
}

module.exports.createRound = function(round){
  // return Promise.resolve(round);
  // console.log('Here is the round.card ',round.cards);
  var cardPromises = round.cards.map((card) => {
    tempCard = new Models.Card(card);
    tempCard.round = round.id;
    tempCard.season = round.season;
    return tempCard.save()
  });
  return Promise.all(cardPromises)
    .then((insertedRounds) => {
      // console.log('promises ', insertedRounds);
      return insertedRounds;
    })
  // return Models.Round.findOne({round_number: 2}).exec()
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
