'use strict';

// SET UP ================================================================

// Loading required modules... 
var express = require('express');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');                         
var bodyParser = require('body-parser');                
var cookieParser = require('cookie-parser');
var session = require('express-session');

var mongoose = require('mongoose');
var configDB = require('./config/db.js');

// CONFIG ================================================================

// Configure connection to database
mongoose.connect(configDB.url);		

// Create and set up the Express application
var app = express();
app.use(morgan('dev'));				//log requests
app.use(bodyParser.json());			//parse JSON in the request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); 			// read cookies (needed for auth)
app.use(bodyParser()); 				// get information from html forms

// Allow "ejs" files, basically HTML embedded with JavaScript
app.set('view engine', 'ejs'); 
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/views');

// Configure and set up Passport for user authentication
require('./config/passport')(passport); 
app.use(session({ 
	secret: 'D1BC0816-37CC-429E-99EC-E5A7EE429E07' 
}));								// session secret
app.use(passport.initialize());
app.use(passport.session()); 		// persistent login sessions
app.use(flash()); 					// use connect-flash for flash messages stored in session

// Configure routes 
// serve static files from the /static subdirectory
app.use(express.static(__dirname + '/views'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/data', express.static(__dirname + '/data'));
app.use('/css', express.static(__dirname + '/css'));
require('./controllers/router.js')(app, passport);

// LAUNCH ================================================================

// Start listening for HTTP requests on port
var port = process.env.PORT || 1234;
app.listen(port, function() {
    console.log('server is listening on port ' + port); 
});