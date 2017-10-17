const dotenv = require('dotenv').config({ path: __dirname+'/../env.env' });
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require('./routes.js');
const openRoutes = require('./openRoutes.js');
const app = express();
const session = require('express-session');


// Connect to DB
const migrate = require('../db/migrate.js');
mongoose.connect(process.env.DB_URI, { useMongoClient: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;

db.on('error', console.log.bind(console,'(*(*(*(*(*Error connecting'));
db.once('open', function() {
  console.log('connection open successfully');
});

// Migration (dev purposes only)
// migrate.down();
// migrate.up();


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'D-Boyz',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: true}
}));

// Non-protected routes
app.use('/', openRoutes);

// Require API Routes
app.use('/api', routes);

// Start up Server
app.listen(3000);
console.log('Server listening on port 3000...');
