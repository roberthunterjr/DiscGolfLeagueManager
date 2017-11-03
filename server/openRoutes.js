const router = require('express').Router();
const helpers = require('./helpers.js');

/////
/*
These routes are open and do not require authentication to proceed
*/

////////////////////////////////////////
/////////Beging Sockets Listeners///////
////////////////////////////////////////



var Sockets = function(io) {
  io.on('connection', (socket) => {

    // console.log('Socket connection established');
    /*
    Messages are sent over the test channel and broken down
    by message type. Each message should have a payload that consists of
    the following --
    message.id : //corresponds to the round that the message corresponds to
    body: //should contain the entire round body including updated cards and scores
    type: // This is the indicator that is sent back to the client to listen out for
          // these are labeled with CLIENT to help differentiate
    */
    socket.on('test', (message) => {
      if(message.type ==='START ROUND') {
        helpers.createRound(message.body)
          .then((updatedRound) => {
            // console.log('Socket round update:',updatedRound.cards)
            var payload = {
              id: message.id,
              body: updatedRound,
              type: 'START ROUND CLIENT'
            }
            io.emit('test', payload);
          })
      }

      if(message.type === 'FINISH CARD') {
        console.log("******************Card Finished")
        var payload = {
          id: message.id,
          body: message.body,
          type: 'FINISH ROUND CLIENT'
        }
        // console.log(message.body,'*********End of socket body')
        helpers.updateScores(message.body)
        .then((updatedRound) => {
          if(updatedRound.completed){
            console.log('%%%%%%% Round Competed!!!!!');
            io.emit('test', payload);
          } else {
            console.log('%%%%%%% Round updates sent')
            payload.type = 'UPDATE SCORE CLIENT'
            io.emit('test', payload);
          }
        })

      }

      if(message.type === 'UPDATE SCORE') {
        console.log('Client requested score update');
        helpers.updateScores(message.body)
          .then((updatedRound) => {
            var payload = {
              id: message.id,
              body: message.body,
              type: 'UPDATE SCORE CLIENT'
            }
            io.emit('test', payload);
          })
      }

    });
  })
}

/////////////////////////////////////////////////////////
/////////////////Begin Post Requests ////////////////////
/////////////////////////////////////////////////////////

router.post('/addPlayer', (req, res) => {
  console.log('Request body is here', req.body);

  //Additional helper to check for dupes via email field

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


// Mis-nomer, this actually is a initializing a round previosly
// created by the season initialization
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


// soon to be depricated
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

//Used by admin portal
router.post('/addClub', (req, res) => {
  console.log('Begin Add Club process', req.body);
  helpers.addClub(req.body)
  .then((insertedClub)=> {
    res.send(insertedClub);
  })
  .catch((err)=> {
    console.log(err);
    res.status(402).send(err);
  })
});

//Used by admin portal
router.post('/addSeason', (req, res) => {
  console.log('Begin Add Season process', req.body);
  helpers.addSeason(req.body)
  .then((insertedSeason) => {
    res.send(insertedSeason);
  })
  .catch((err) => {
    console.log(err);
    res.status(402).send(err);
  })
});


//Used by admin as helper
router.post('addPlayerToSeason', (req, res) => {
  console.log('Begin Add player to season process', req.body);
  helpers.addPlayerToSeason(req.body)
  .then((updatedSeason) => {
    res.send(updatedSeason);
  })
  .catch((err) => {
    console.log(err);
    res.status(402).send(err);
  })
})

///////////////////////////////////////////////
///////////// Begin Get Requests //////////////
///////////////////////////////////////////////

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
      res.status(404).send(err);
    });
});

router.get('/getClubByUser/:id', (req, res) => {
  console.log('Beginning the getClubByUser call', req.params.id);
  helpers.getClubByUser(req.params.id)
    .then((payload) => {
      res.send(payload);
    })
    .catch((err) => {
      res.status(404).send(err);
    })
})

// Currently replaced by getSeasonsByPlayer
// Will be refactored when multiple seasons and clubs added
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


module.exports = {router, Sockets};
