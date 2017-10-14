const Models = require('./models.js');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const testClubCreate = [
  {
    name: 'ABC Disc Golf'
  }
]

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

module.exports.up = function() {
  //add players
  testPlayers.forEach((player) => {
    console.log('iterating through testPlayers', player);
    let tempPlayer = new Models.Player(player).save()
      .then((result) =>{
        console.log('Models saved, this is ',result);
      })
      .catch((err) =>{
        console.log('Error adding to DB ', err);
      })
  });

  //add clubs
}
