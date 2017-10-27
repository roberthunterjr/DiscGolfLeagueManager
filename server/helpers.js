const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const Models = require('../db/models.js');
const jwt = require('jsonwebtoken');

module.exports.getPlayers = function() {
  return Models.Player.find().select({first_name: 1}).exec();
};

module.exports.getPlayer = function(userid) {
  return Models.Player.findById(userid).exec();
};

//simple funciton to see if a player is in the DB
module.exports.checkPlayerExists = function(playerEmail) {
  return Models.Player.find({email: playerEmail}).exec()
    .then((players) => {
      console.log('Check yoself', players);
      if(!players.length){
        return players
      } else {
        throw 'User already exists';
        return players
      }
    });
};


module.exports.addPlayer = function(player) {
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
      //assumming that we will add to first season and all rounds
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
        // console.log('This is the resolved season', season);
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
  var newRound = Object.assign({},round);
  var cardPromises = Object.keys(round.cards).map((card) => {
    tempCard = new Models.Card(round.cards[card]);
    tempCard.round = round.id;
    tempCard.season = round.season;
    tempCard.score_keeper = round.cards[card].scoreKeeper;
    return tempCard.save()
  });
  var scores = {};
  return Models.Course.findOne({_id: round.course}).exec()
  .then((course) => {
    newRound.course = course;
    return course.hole_details
  })
  .then((courseHoles) => {
    Object.keys(round.playersPresent).forEach((playerId) => {
      scores[playerId] = {};
      for( var holeNumber in courseHoles) {
        scores[playerId][holeNumber] = 2;
      }
    });
    // console.log('This is the scores object currently(Check)', scores);
    newRound.scores = scores;
    // return scores;
  })
  .then(() => {
    return Promise.all(cardPromises)
    .then((insertedCards) => {
      // console.log('promises ', insertedRounds);
      return insertedCards;
    })
  })
  .then((insertedCards) => {
    newRound.cards = insertedCards;
    // console.log('NEWROUNDCARD',insertedCards);
    newRound.in_progress = true;
    // console.log('The new round to be added', newRound);
    return Models.Round.findOneAndUpdate({_id: newRound.id}, newRound, {new: true})
    .populate(
      [{path: 'cards'}, {path: 'course'}]
    )
    .exec()
  })
  .then((insertedRound) => {
    console.log('The inserted round', insertedRound);
    return insertedRound;
  })
};

module.exports.getPlayerCard = function(playerId, roundId) {
  // console.log('Player Id and round id in helper', playerId, roundId);
  return Models.Card.findOne({round: roundId, players: playerId})
  .populate({
    path: 'players',
    options: {
      select: ' -password -created -clubs'
    },
    populate: {
      path: 'player_rounds',
      options: {
        match: { round: roundId}
      }
    }
  })
  .exec()
    .then((card) => {
      console.log('Cards ', card);
      return card;
    }, (error) => {
      console.log('Error', error);
      throw error;
    })
}

module.exports.getCurrentRoundData = function(roundId, playerId) {
  return Models.Round.findOne({_id: roundId, players: playerId, in_progress: true})
  .populate(
    [
      {
        path: 'cards',
        populate: {
          path: 'players',
          options: {
            select: '-password'
          }
        }
      },
      {
        path: 'course'
      }
    ]
  )
  .exec()
  .then((round)=> {
    console.log(round);
    return round;
  });
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
