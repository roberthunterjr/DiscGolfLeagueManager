require('dotenv').config({ path: '../env.env' });
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require('./routes.js')
const app = express();

// Connect to DB
mongoose.connect(process.env.DB_HOST, { useMongoClient: true });
mongoose.Promise = global.Promise;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Require API Routes
app.use('/', routes);

// Start up Server
app.listen(3000);
console.log('Server listening on port 3000...');
