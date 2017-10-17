const router = require('express').Router();
const helpers = require('./helpers.js');

/////
/*
These routes are open and do not require authentication to proceed

*/

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
});

router.post('/addScores', (req, res) => {
  console.log('Beginning the login process' , req.body);
  helpers.addScores(req.body)
    .then((payload) => {
      res.send(payload);
    })
    .catch((err) =>{
      res.status(402).send(err);
    });
});

router.get('/getPlayer/:id', (req, res) => {
  console.log('Beginning the getPlayer call', req.params.id);
  helpers.getPlayer(req.params.id)
  .then((player) => {
    res.send(player)
  })
  .catch((err) => {
    res.status(402).send(err);
  });
})

module.exports = router;
