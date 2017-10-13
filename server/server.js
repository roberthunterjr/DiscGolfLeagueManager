const app = require('express')();
const bodyParser = require('body-parser');
const port = 3001;
app.listen(port);

app.use(bodyParser.json());
app.get('/hello', (req,res) => {
  console.log('Made it to hello ');
  res.send('Hello from server');
});
console.log('Server listening on port ',port);
