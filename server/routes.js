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
  console.log('Request body is here', req.body);
  // helpers.addPlayer({first_name: 'John', email: 'john@example.com', password: 'HashMe'})
  helpers.addPlayer(req.body)
    .then((payload) =>{
      res.send(payload);
    })
    .catch((err)=>{
      console.log('error found here', err);
      res.status(402).send('Error encountered adding player')
    })
});

router.post('/login', (req, res) => {
  console.log('Beginning the login process', req.body);
  helpers.login(req.body)
    .then((payload) => {
      //if user is defined, assign a token with user id encoded
      //then send it in the response.
      //else, indicate that there is an issue and redirect
      res.send(payload);
    })
    .catch((err) => {
      console.log('Something went wrong logging in', err);
      res.status(402).send(err);
      //something went wrong
    })
})

/////////////////
///Authorize////

router.get('/getAuth', (req, res) => {
  helpers.getAuth(req.headers.key)
    .then((obj) => {
      console.log(obj);
      res.status(400).send('Authorized');
    })
    .catch((bool) => {
      res.status(403).send('Not authorized');
    })
})
/////////////////
//Club Routes////
////////////////

router.get('/addClub', (req, res) =>{
  res.send('Hello');
});



module.exports = router;
