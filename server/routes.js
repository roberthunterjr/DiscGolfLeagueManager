const router = require('express').Router();
const helpers = require('./helpers.js');
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

router.get('/addPlayer', (req, res) => {
  console.log('Request body is here', req.body.player);
  helpers.addPlayer({first_name: 'John', password: 'HashMe'})
    .then((player) =>{
      res.send('added\n' + player);
    })
    .catch((err)=>{
      console.log('error found here', err);
      res.status(402).send('Error encountered adding player')
    })
});

/////////////////
//Club Routes////
////////////////



module.exports = router;
