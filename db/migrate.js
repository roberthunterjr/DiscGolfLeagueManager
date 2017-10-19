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
  }
];


module.exports.up = function() {

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
}

module.exports.down = function() {
  Models.Player.collection.drop();
  Models.Club.collection.drop();
  Models.Season.collection.drop();
}
