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

router.use((req, res, next) => {
  helpers.getAuth(req.headers.key)
    .then((obj) => {
      console.log(obj);
      req.body.userId = obj.userId;
      next();
    })
    .catch((err) => {
      console.log('Authorization err ', err);
      res.status(403).send('Authorization Error');
    });
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


/////////////////
///Authorize////

router.get('/getAuth', (req, res) => {
  helpers.getAuth(req.headers.key)
    .then((obj) => {
      // console.log(obj);
      console.log('Token Authorized')
      res.status(400).send(obj);
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
