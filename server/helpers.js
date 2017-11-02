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

module.exports.updateScores = function(round) {
  //if all cards are complete
  var update = {}
  update.scores = round.scores;
  update.cards = round.cards.map((card) => {
    return Models.Card.findOneAndUpdate({_id: card._id}, card, {new: true}).exec()
  })
  if(round.cards.every((card) => card.is_completed || false)) {
    round.completed = true;
    round.in_progress = false;
  }
  return Promise.all(update.cards)
  .then((updatedCards) => {
    // console.log('Updated Cards, ', updatedCards);
    return updatedCards;
  })
  .then(()=> {

    return Models.Round.findOneAndUpdate({_id: round._id}, round, {new: true})
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
    .then((updated)=>{
      console.log('Updated round ',updated);
      return updated;
    })
  })
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
  console.log('Here is the round.card ',round.cards);
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
    // console.log('Course holes is ', courseHoles.hole_details);
    var newHoleDetails = Object.keys(courseHoles.hole_details).reduce((acc, cur) => {
      acc[cur] = Object.assign({}, courseHoles.hole_details[cur], {
        score : null
      });
      return acc;
    }, {});
    // console.log('New hole details ', newHoleDetails);
    Object.keys(round.playersPresent).forEach((playerId) => {


      var playerStartingHole;
      for (var card in round.cards) {
        round.cards[card].players.forEach((playerObj) => {
          if (playerObj._id === playerId) {
            playerStartingHole = round.cards[card].startingHole;
          }
          // console.log('PLAYEROBJ', playerObj);
        })
      }
      // console.log('YOU ARE ZE CARD', playersCard);



      bigObject = {
        player_name: round.playersPresent[playerId].first_name +' ' + round.playersPresent[playerId].last_name,
        totalStrokes: 0,
        scoreRelativeToPar: 'E',
        startingHole: playerStartingHole,
        thru: 0
      }
      bigObject= Object.assign(bigObject, newHoleDetails);
      scores[playerId] = Object.assign({}, bigObject);
      // for( var holeNumber in courseHoles.hole_details) {
      //   scores[playerId][holeNumber] = null;
      // }
    });
    console.log('This is the scores object currently', scores);
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
      [{path: 'cards', populate:{ path: 'players'}}, {path: 'course'}]
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

module.exports.getClubByUser = function(playerId) {
  return Models.Player.findOne({_id: playerId}).select('-password ').populate({
    path: 'clubs',
    populate: [
      {
        path: 'seasons',
        populate: [
          {
            path: 'rounds'
          }
        ]
      },
      {
        path:'courses'
      }
  ]
  })
  .exec()
  .then((clubInfo) => {
    return clubInfo;
  });
}

module.exports.addClub = function(clubDetails) {

  //parse into allcaps, no space search
  //let nameSearch = club.name.split('').join('').toUpperCase();
  // return Models.Club.find({first_name: club.first_name})
  var newClub = {
    name: clubDetails.clubName,
    location: clubDetails.course.location,
    admins: [clubDetails.userId]
  };
  var newCourse = {
    name: clubDetails.course.name,
    location: clubDetails.course.location,
    hole_details: clubDetails.course.holeDetails
  };
  // console.log('Im here',newClub,newCourse);
  var tempCourse = new Models.Course(newCourse);
  return tempCourse.save()
  .then((insertedCourse) => {
    newClub.courses = [insertedCourse.id];
    var tempClub = new Models.Club(newClub);
    return tempClub.save()
  })
  .then((insertedClub) => {
    console.log('New Club!', insertedClub);
    return insertedClub;
  })
}

module.exports.addSeason = function(request) {

  var newSeason = {
    name: request.seasonName,
    year: request.year,
    club: request.clubId,
    courses: request.courseIds,
    players: [request.playerId],
    number_rounds: request.numberRounds
  }
  var newRounds = [];
  var seasonId;
  var tempSeason = Models.Season(newSeason);
  return tempSeason.save()
    .then((insertedSeason) => {
      for( var i = 1; i  <= request.numberRounds; i++) {
        seasonId = insertedSeason.id;
        var tempRound = new Models.Round({
          round_number: i,
          completed: false,
          in_progress: false,
          season: seasonId,
          scores: {},
          course: request.courseIds[0]
        })
        newRounds.push(tempRound.save())
      }
    })
    .then(() => {
      return Promise.all(newRounds)
        .then((insertedRounds) => {
          return insertedRounds.map((round) => {
            return round.id;
          })
        })
    })
    .then((insertedRoundIds) => {
      console.log('insertedRoundIds', insertedRoundIds);
      return Models.Season.findOneAndUpdate({_id: seasonId}, {rounds: insertedRoundIds}, {new: true})
      .exec();
    })
    .then((updatedSeason) => {
      console.log('Newly Created Season is \n',updatedSeason);
      return updatedSeason;
    })
}

module.exports.addPlayerToSeason = function(request) {
  return Models.Player.findOneAndUpdate({_id: request.playerId},{ $push: {seasons: request.seasonId}}).exec()
    .then((updatedPlayer)=> {
      return updatedPlayer;
    })
  .then((updatedPLayer) => {
    return Models.Season.findOneAndUpdate({_id: request.seasonId}, {$push: {players: request.playerId}}).exec()
  })
  .then((updatedSeason) => {
    console.log('updated Season', updatedSeason);
    return updatedSeason;
  })
}

module.exports.addPlayerToClub = function(request) {

}
/*
When adding a club we are expecting this to occur only in tandum with
a recent user signup or from the panel of an already authenticated user.
In either case, a single player Id should be provided to be pushed into admin [].
Additionally, this will be set to update if the club already exists in the db
club = {name: "String", id: Player_id}
*/
