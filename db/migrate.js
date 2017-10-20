const Models = require('./models.js');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

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
    password: 'password'
  },
  {
    first_name: 'Pete',
    last_name: 'Givens',
    email: 'pgivens@gmail.com.com',
    password: 'password'
  },
  {
    first_name: 'AJ',
    last_name: 'Caporicci',
    email: 'aj@fakeemail.com',
    password: 'password'
  },
];

const testClubs= [
  {
    name: 'ATX Disc Golf',
    admins: [ObjectId("59e8d43b207db106c94f1e46")],
    players: [ObjectId("59e8d43b207db106c94f1e46"), ObjectId("59e8d394207db106c94f1e43")]
  },
  {
    name: 'XYZ Golf Club',
    admins: [ObjectId("59e8d394207db106c94f1e43")],
    players: [ObjectId("59e8d43b207db106c94f1e46"), ObjectId("59e8d394207db106c94f1e43")]
  }
];

const testCourse= [
  {
    name: 'Roy G. Guerrerro DGC',
    location: 'Austin, Tx',
    length: 9588,
    par: 61,
    hole_number: 18,
    hole_details: {
      1: {
        par: 4,
        length: 720
      },
      2: {
        par: 3,
        length: 339
      },
      3: {
        par: 3,
        length: 444
      },
      4: {
        par: 3,
        length: 378
      },
      5: {
        par: 4,
        length: 849
      },
      6: {
        par: 3, 
        length: 327
      },
      7: {
        par: 4,
        length: 738
      },
      8: {
        par: 3,
        length: 351
      },
      9: {
        par: 3,
        length: 372
      },
      10: {
        par: 3,
        length: 368
      },
      11: {
        par: 4,
        length: 777
      },
      12: {
        par: 3,
        length: 335
      },
      13: {
        par: 3,
        length: 368
      },
      14: {
        par: 4,
        length: 801
      },
      15: {
        par: 4,
        length: 790
      },
      16: {
        par: 3,
        length: 405
      },
      17: {
        par: 3,
        length: 395
      },
      18: {
        par: 4,
        length: 831
      }
    }
  }
];

const testSeasons = [
  {
    name: 'Spring 2018',
    year: 2018,
    club: ObjectId("59e523d8f1c9be860ec795b2"),
    players: [ObjectId("59e8d43b207db106c94f1e46")],
    courses: [ObjectId("59e523d8f1c9be860ec795b2")]
  },
  {
    name: 'Summer 2017',
    year: 2017,
    club: ObjectId("59e523d8f1c9be860ec795b2"),
    players: [ObjectId("59e8d43b207db106c94f1e46")],
    courses: [ObjectId("59e523d8f1c9be860ec795b2")],
  }
];


module.exports.up = function() {
  //add players
  testPlayers.forEach((player) => {
    // console.log('iterating through testPlayers', player);
    let tempPlayer = new Models.Player(player);
    tempPlayer.hashPw()
    .then((hash)=> {
      tempPlayer.password = hash;
      return tempPlayer;
    })
    .then((tempPlayer) => {
      return tempPlayer.save();
    })
    .then((result) =>{
      // console.log('Models saved, this is ',result);
    })
    .catch((err) =>{
      console.log('Error adding to DB ', err);
    })
  });

  //add clubs
  testClubs.forEach((club) => {
    let tempClub = new Models.Club(club).save()
      .then((result) => {
        // console.log('Club models saved');
      })
      .catch((err) => {
        console.log('Error adding test clubs to db', err)
      });
  });

  //add seasons
  testSeasons.forEach((seasons) => {
    let tempSeason = new Models.Season(seasons).save()
      .then((result) => {
        //console.log('Season models saved');
      })
      .catch((err) => {
        console.log('Err adding test seasons to db', err);
      });
  });
}

module.exports.down = function() {
  Models.Player.collection.drop();
  Models.Club.collection.drop();
  Models.Season.collection.drop();
}
