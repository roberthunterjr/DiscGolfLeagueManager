const Models = require('./models.js');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const testClubs= [
  // {
  //   name: 'ABC Disc Golf'
  // },
  {
    name: 'XYZ Golf Club'
  },

];

const testCourses= [
  {
    name: 'Pease Park',
    location: 'Austin, Tx',
    number_of_holes: 18,
    par: 58,
    hole_details: {
      "1": {
        "hole_number": 1,
        "par": 3,
        "length": 380
      },
      "2": {
        "hole_number": 2,
        "par": 4,
        "length": 450
      },
      "3": {
        "hole_number": 3,
        "par": 3,
        "length": 280,
      },
      "4": {
        "hole_number": 4,
        "par": 3,
        "length": 279,
      },
      "5": {
        "hole_number": 5,
        "par": 4,
        "length": 602,
      },
      "6": {
        "hole_number": 6,
        "par": 3,
        "length": 338
      },
      "7": {
        "hole_number": 7,
        "par": 3,
        "length": 380
      },
      "8": {
        "hole_number": 8,
        "par": 4,
        "length": 450
      },
      "9": {
        "hole_number": 9,
        "par": 3,
        "length": 280,
      },
      "10": {
        "hole_number": 10,
        "par": 3,
        "length": 279,
      },
      "11": {
        "hole_number": 11,
        "par": 4,
        "length": 602,
      },
      "12": {
        "hole_number": 12,
        "par": 3,
        "length": 338
      },
      "13": {
        "hole_number": 13,
        "par": 3,
        "length": 380
      },
      "14": {
        "hole_number": 14,
        "par": 4,
        "length": 450
      },
      "15": {
        "hole_number": 15,
        "par": 3,
        "length": 280,
      },
      "16": {
        "hole_number": 16,
        "par": 3,
        "length": 279,
      },
      "17": {
        "hole_number": 17,
        "par": 4,
        "length": 602,
      },
      "18": {
        "hole_number": 18,
        "par": 3,
        "length": 338
      }
    }
  }
];

const testSeasons = [
  // {
  //   name: 'Spring 2018',
  //   year: 2018,
  // },
  {
    name: 'Summer 2017',
    year: 2017,
  }
];

const testPlayers = [
  {
    first_name: 'Robert',
    last_name: 'Hunter',
    email: 'robert@example.com',
    password: '1234'
  },
  {
    first_name: 'Tristyn',
    last_name: 'Leos',
    email: 'tristyn@example.com',
    password: 'alsonothashed'
  },
  {
    first_name: 'a',
    last_name: 'a',
    email: 'a',
    password: 'a'
  },
  {
    first_name: 'c',
    last_name: 'c',
    email: 'c',
    password: 'c'
  },
  {
    first_name: 'b',
    last_name: 'b',
    email: 'b',
    password: 'b'
  }
];

const testRounds = [];

for(var i = 1; i <= 12; i++) {
  var round = {
    round_number: i,
    completed: (i < 6),
    total_strokes: parseInt((i * i * 0.3)+ (2*i) + 15)
  }
  testRounds.push(round);
}
/// Holds the ids of the test data for later manipulation

var playerIds = [];
var clubIds = [];
var seasonIds = [];
var roundIds = [];
var courseIds = [];
/////////////////////////


module.exports.up = function() {
/*
This first block creates pending promises from
given test arrays
*/
  //add clubs to Promise array
  var testClubModels = testClubs.map((club) => {
    return new Models.Club(club).save()
    .then((club) => {
      clubIds.push(club._id);
      return club;
    })
  })

  //add seasons to promise array
  var testSeasonModels = testSeasons.map((seasons) => {
    return new Models.Season(seasons).save()
      .then((season) => {
        seasonIds.push(season._id);
        return season;
      })
  });

  //add players to promise array w/ hashedPw
  var testPlayerModels = testPlayers.map((player) => {
    // console.log('iterating through testPlayers', player);
    let tempPlayer = new Models.Player(player);
    return tempPlayer.hashPw()
    .then((hash)=> {
      tempPlayer.password = hash;
      return tempPlayer.save()
    })
    .then((player) => {
      playerIds.push(player._id);
      return player;
    })
  });

  //add rounds to promise array
  var testRoundModels = testRounds.map((round) => {
    return Models.Round(round).save()
      .then((round) => {
        roundIds.push(round._id);
        return round;
      })
  });

  var testCourseModels = testCourses.map((course) => {
    return Models.Course(course).save()
      .then((course) => {
        courseIds.push(course._id);
        return course;
      })
  })


  /*
  Use this chain to execute the model promises
  and add in asynchronous fashion

  */

  Promise.all(testPlayerModels)
    .then((players) => {
      // console.log('nmnmnmnmnmn',players);
      return Promise.all(testClubModels);
    })
    .then((clubs) => {
      // console.log(clubs);
      return Promise.all(testSeasonModels);
    })
    .then((seasons) => {
      // console.log(seasons);
      return Promise.all(testRoundModels);
    })
    .then((rounds) => {
      // console.log(rounds);
      return Promise.all(testCourseModels)
    })
    .then((courses) =>{
      // console.log(courses);
      return courses;
    })
    .then((courses) => {
      // console.log(playerIds);
      // console.log(roundIds);
      return wireClub();
    })
    .then(() => {
      return wireSeasons();
    })
    .then(() => {
      return wireRounds();
    })
    .then(() => {
      return wirePlayers();
    })
    .catch((err) =>{
      console.warn('Welll...', err);
    });
}

/*
Wiring functions responsible for tying all ID relationships together
Assuming all players belong to club[0]
Assuming all players belong to season[0]
Assuming course[0] is the only course (although wired for more)

*/

var wireClub = function() {
  // console.log('Wire Club');
  return Models.Club.findOne({_id: clubIds[0]}).exec()
    .then((club) => {
      seasonIds.forEach((seasonId) => {
        club.seasons.push(seasonId);
      });
      club.admins.push(playerIds[2])
      return club.save()
    })
    .then((updatedClub) => {
      // console.log(updatedClub);
      return updatedClub;
    })
};

var wireSeasons = function() {
  // console.log('Wire Seasons');
  return Models.Season.findOne({_id: seasonIds[0]}).exec()
    .then((season) => {
      roundIds.forEach((roundId) =>{
        season.rounds.push(roundId);
      });
      playerIds.forEach((playerId) =>{
        season.players.push(playerId);
      });
      season.club = clubIds[0];
      season.courses.push(courseIds[0]);
      return season.save();
    })
    .then((updatedSeasons) => {
      // console.log(updatedSeasons);
      return updatedSeasons;
    });
}

var wireRounds = function() {
  console.log('Wire Rounds');
  var roundUpdateModels = roundIds.map((roundId) => {
    return Models.Round.findOne({_id: roundId}).exec()
      .then((round) => {
        round.season = seasonIds[0];
        playerIds.forEach((playerId) => {
          round.players.push(playerId);
        });
        round.course = courseIds[0];
        return round.save();
      })
  })
  return Promise.all(roundUpdateModels)
    .then((updatedRounds) => {
      console.log('updated Rounds', updatedRounds);
      return updatedRounds;
    })
}

var wirePlayers = function() {
  console.log('Wire Players');
  var playerUpdateModels = playerIds.map((playerId) => {
    return Models.Player.findOne({_id: playerId}).exec()
      .then((player) => {
        player.clubs.push(clubIds[0]);
        player.seasons.push(seasonIds[0]);
        return player.save();
      })
  });
  return Promise.all(playerUpdateModels)
    .then((updatedPlayers) => {
      console.log('Updated Players \n',updatedPlayers);
      return updatedPlayers;
    });
}

module.exports.down = function() {
  return Models.Player.collection.drop().exec()
    .then(() => {
      return Models.Club.collection.drop().exec()
    })
    .then(() => {
      return Models.Season.collection.drop().exec()
    })
}
module.exports.course = function() {
  Models.Course.findOneAndUpdate({_id: "59ea986dfb55674bbf2af136"}, {hole_details: testCourses[0] }).exec();
}
