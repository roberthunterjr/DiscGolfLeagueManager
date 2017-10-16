const router = require('express').Router();
const helpers = require('./helpers.js');
const jwt = require('jsonwebtoken');
/////////////////////////////////////////////////////////////////////
// Routes
/////////////////////////////////////////////////////////////////////

// Test Route
router.get('/test', (req, res) => {
  res.send('Success!')
});

router.get('/getPlayers', (req, res) => {
  helpers.getPlayers()
    .then((players)=> {
      console.log('server returned \n',players);
      res.send(players);
    })
    .catch((err)=> {
      console.log('error', err);
      res.status(404).send('Could not retrieve players');
    });
});

router.post('/addPlayer', (req, res) => {
  console.log('Request body is here', req.body.player);
  // helpers.addPlayer({first_name: 'John', email: 'john@example.com', password: 'HashMe'})
  helpers.addPlayer(req.body)
    .then((player) =>{
      res.send('added\n' + player);
    })
    .catch((err)=>{
      console.log('error found here', err);
      res.status(402).send('Error encountered adding player')
    })
});

router.get('/login', (req, res) => {
  console.log('Beginning the login process', req.body.player);
  helpers.login({email: 'john@example.com', password: 'HashMe'})
    .then((player) => {
      // console.log('Player made it back to route as ',player);
      player.apiToken = jwt.sign(
        { isLoggedIn: true, userId: player._id},
        'dgolf',
        {expiresIn: 180 }
      );
      res.send(player);
      //if user is defined, assign a token with user id encoded
      //then send it in the response.
      //else, indicate that there is an issue and redirect
    })
    .catch((err) => {
      console.log('Something went wrong', err);
      //something went wrong
    })
})

/////////////////
//Club Routes////
////////////////

router.get('/addClub', (req, res) =>{
  res.send('Hello');
});



module.exports = router;
