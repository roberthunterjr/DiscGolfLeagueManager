const Models = require('./models.js');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const testClubs= [
  {
    name: 'ABC Disc Golf'
  },
  {
    name: 'XYZ Golf Club'
  },

];

const testCourse= [
  {
    name: 'Pease Park',
    location: 'Austin, Tx',
    hole_number: 18,
    par: 58,
    hole_details: {
      1: {
        par: 3,
        length: 380
      },
      2: {
        par: 4,
        length: 150
      },
      3: {
        par: 5,
        length: 450
      }
    }
  }
];

const testSeasons = [
  {
    name: 'Spring 2018',
    year: 2018,
  },
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
    first_name: 'a',
    last_name: 'a',
    email: 'a',
    password: 'a'
];


module.exports.up = function() {

  //add clubs to Promise array
  testClubs.map((club) => {
    return new Models.Club(club)
  })

  //add seasons to promise array
  testSeasons.map((seasons) => {
    return new Models.Season(seasons);
  });

  //add players to promise array w/ hashedPw
  testPlayers.map((player) => {
    // console.log('iterating through testPlayers', player);
    let tempPlayer = new Models.Player(player);
    return tempPlayer.hashPw()
    .then((hash)=> {
      tempPlayer.password = hash;
      return tempPlayer;
    });
  });
}

module.exports.down = function() {
  Models.Player.collection.drop();
  Models.Club.collection.drop();
  Models.Season.collection.drop();
}
