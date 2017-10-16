const Models = require('./models.js');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const testClubs= [
  {
    name: 'ABC Disc Golf'
  },
  {
    name: 'XYZ Golf Club'
  }
];

const testPlayers = [
  {
    first_name: 'Robert',
    last_name: 'Hunter',
    email: 'robert@example.com',
    password: 'nothashed'
  },
  {
    first_name: 'Tristyn',
    last_name: 'Leos',
    email: 'tristyn@example.com',
    password: 'alsonothashed'
  }
];

const testLeagues = [
  {
    name: 'Spring 2018',
    year: 2018,
  },
  {
    name: 'Summer 2017',
    year: 2017,
  }
]

module.exports.up = function() {
  //add players
  testPlayers.forEach((player) => {
    // console.log('iterating through testPlayers', player);
    let tempPlayer = new Models.Player(player).save()
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

  //add leagues
  testLeagues.forEach((league) => {
    let tempLeague = new Models.League(league).save()
      .then((result) => {
        //console.log('League models saved');
      })
      .catch((err) => {
        console.log('Err adding test league to db', err);
      });
  });
}

module.exports.down = function() {
  Models.Player.collection.drop();
  Models.Club.collection.drop();
  Models.League.collection.drop();
}
