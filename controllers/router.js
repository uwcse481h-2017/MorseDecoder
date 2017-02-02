'use strict'

var User = require('../models/user.js');
var Spacetime = require('../models/spacetime.js');

// Expose API routes
module.exports = function(app, passport) {
	// redirect default root to morse page
    app.get('/', function (req, res){
        res.render('morse.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    app.get('/switch', function(req, res) {
        res.render('2Switch.html')
    })

    // USER AUTHENTICATION ===============================================

    // SIGNIN ////////////////////////////////////////////////////////////

	app.get('/signin', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signin.ejs', { message: req.flash('loginMessage') }); 
    });

	// process the login form
    app.post('/signin', passport.authenticate('local-login', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/signin', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // SIGNUP ////////////////////////////////////////////////////////////

    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // PROFILE /////////////////////////////////////////////////////////// 
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // SIGNOUT ///////////////////////////////////////////////////////////
    app.get('/signout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/users', function(req, res) {
        User.find().exec(function(err, users) {
    		if (err) {
    			res.send(err);
    		}
    		res.json(users);
    	});
    });

    // TRAINING DATA =====================================================
    // Test Uid: 588a3e5339631e1ed7556e85

    // Retrieve training info 
    app.get('/getTrainingInfo/:uid', function(req, res) {
       Spacetime.find({uid: req.params.uid}).exec(function(err, info) {
           if (err) {
               res.send(err);
           }
           res.json(info);
       });
    });

    // Add spacetime to training data 
    app.route('/api/v1/addTrainingInfo/:uid/:time/:isShort')
		.post(function(req, res) {
            var spacetime = new Spacetime();
            spacetime.uid = req.params.uid;
            spacetime.time = req.params.time;
            spacetime.isShort = req.params.isShort; 

            spacetime.save(function(err) {
                if (err) {
                    res.send(err);
                }
                res.json(spacetime)
            });
		});

    // Get user's average short and long spacetimes 
    app.route('/api/v1/getAverageSpaces/:uid')
        .get(function(req, res) {
            Spacetime.find({uid: req.params.uid}).exec(function(err, info) {
                if (err) {
                    res.send(err);
                }
                
                var shortSum = 0 
                var longSum = 0
                var numShorts = 0
                var numLongs = 0
                for (var i = 0; i < info.length; i++) {
                    var space = info[i];
                    if (space.isShort) {
                        shortSum += space.time;
                        numShorts += 1;
                    } else { // !space.isShort --> space is long
                        longSum += space.time;
                        numLongs += 1;
                    }
                }

                res.json({
                    "averageShort": shortSum/(numShorts * 1.0),
                    "averageLong": longSum/(numLongs * 1.0)
                });
            });
        });

}

// Route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}