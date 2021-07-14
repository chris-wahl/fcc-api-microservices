// server.js
// where your node app starts

// init project
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose')
const bodyParser = require('body-parser');

mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
// Get bodyParser connected
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Setup access logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

/* ----- freeCodeCamp added CORS settings ----- */
// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
const cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204
app.use(express.static('public'));

// Server root index.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// Attach each microservice project to the server
require('./project-05-file-metadata')(app);
require('./project-04-exercise-tracker')(app);
require('./project-03-shorturl')(app);
require('./project-02-headers')(app);
// Need to add timestamp last as it listens to `/api/<any_value>` endpoint
require('./project-01-timestamp')(app);


var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
