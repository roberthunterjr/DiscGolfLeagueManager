const router = require('express').Router();
const helpers = require('./helpers.js');

/////
/*
These routes are open and do not require authentication to proceed

*/

//Set up Sockets
var Sockets = function(io) {
  io.on('connection', (socket) => {
    console.log('Socket connection established');
    socket.on('test', (message) => {
      console.log('Here is the channel make it message.channel')
      console.log('Here is the message: ', message);
      socket.emit('test','From server' + message.body);
    });
  })
}

router.post('/addPlayer', (req, res) => {
  console.log('Request body is here', req.body);
  helpers.checkPlayerExists(req.body.email)
  .then((doesExist) => {
    helpers.addPlayer(req.body)
    .then((payload) => {
      res.send(payload);
    });
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

router.post('/updateScores', (req, res) => {
  console.log('Beginning the update scores process' , req.body);
  helpers.updateScores(req.body)
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
});

router.get('/getSeasonsByPlayer/:id', (req, res) => {
  console.log('Beginning the getSeasonsByPlayer call', req.params.id);
  helpers.getSeasonsByPlayer(req.params.id)
    .then((payload) =>{
      res.send(payload)
    })
    .catch((err) => {
      res.status(401).send(err);
    });
});

router.post('/createRound', (req, res) => {
  console.log('Request Body', req.body);
  helpers.createRound(req.body)
    .then((round) =>{
      res.status(201).send(round);
    })
    .catch((err) => {
      console.log(err);
      res.status(402).send(err);
    })
});

router.get('/getCurrentRoundData/:id/:playerId', (req, res) => {
  console.log('Request Body', req.params.id, req.params.playerId);
  helpers.getCurrentRoundData(req.params.id, req.params.playerId)
    .then((round) => {
      res.status(200).send(round);
    })
    .catch((err) => {
      console.log(err);
      res.status(401).send(err);
    })
})

router.post('/getPlayerCard', (req, res) => {
  // console.log('Player id and round id is ',req.body);
  helpers.getPlayerCard(req.body.player_id, req.body.round_id)
    .then((card) => {
      console.log('Card in then', card);
      res.send(card);
    })
    .catch((error) => {
      res.send('No wins for you');
    })
});

module.exports = {router, Sockets};
