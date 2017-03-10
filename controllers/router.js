'use strict'

var User = require('../models/user.js');
var Spacetime = require('../models/spacetime.js');
var Abbreviation = require('../models/abbreviation.js');

// Expose API routes
module.exports = function(app, passport) {
	// redirect default root to morse page
    app.get('/', function(req, res){
        res.render('index.ejs', {user: req.user});
    });

    app.get('/switch', function(req, res) {
        res.render('morse.ejs', {user: req.user});
    });

    app.get('/switchCalib', function(req, res) {
        res.render('2SwitchCalib.ejs', { user: req.user } );
    });

    app.get('/learn', function(req, res){
        res.render('learn.ejs', {user: req.user});
    });

    app.get('/about', function(req, res){
        res.render('about.ejs', {user: req.user});
    });

    app.get('/abbr', function(req, res) {
        res.render('abbr.ejs', {user:req.user});
    })

    app.get('/menucode', function(req, res) {
        res.render('menucode.ejs', {user:req.user});
    })

    // USER AUTHENTICATION ===============================================

    // SIGNIN ////////////////////////////////////////////////////////////

	app.get('/signin', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signin.ejs', { message: req.flash('loginMessage') }); 
    });

	// process the login form
    app.post('/signin', function(req, res, next) {
        passport.authenticate('local-login', function(err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.redirect('/signin');
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err); 
                }
                console.log(JSON.stringify(user))
                if (user.trainingCompleted == true) {
                    return res.redirect('/switch')
                } else {
                    return res.redirect('/switchCalib')
                }
            });
        })(req, res, next);
    });

    // SIGNUP ////////////////////////////////////////////////////////////

    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/switchCalib', // redirect to the secure profile section
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
    app.route('/api/v1/addTrainingInfo/:uid/:time/:type')
		.post(function(req, res) {
            var spacetime = new Spacetime();
            spacetime.uid = req.params.uid;
            spacetime.time = req.params.time;
            spacetime.type = req.params.type; 

            spacetime.save(function(err) {
                if (err) {
                    res.send(err);
                }
                res.json(spacetime)
            });
		});

    // Get user's average character and word spacetimes 
    app.get('/getAverageSpaces/:uid', function(req, res) {
            Spacetime.find({uid: req.params.uid}).exec(function(err, info) {
                if (err) {
                    res.send(err);
                }
                
                var elSum = 0 
                var numEls = 0 

                var charSum = 0 
                var numChars = 0 

                var wordSum = 0 
                var numWords = 0 

                for (var i = 0; i < info.length; i++) {
                    var space = info[i];
                    var type = space.type; 
                    if (type == 'es') {
                        elSum += space.time;
                        numEls += 1 
                    } else if (type == 'cs') {
                        charSum += space.time;
                        numChars += 1
                    } else if (type == 'ws') {
                        wordSum += space.time 
                        numWords += 1 
                    }
                }

                res.json({
                    "aveElSpace": elSum/(numEls * 1.0),
                    "aveCharSpace": charSum/(numChars * 1.0),
                    "aveWordSpace": wordSum/(numWords * 1.0)
                });
            });
        });

    // Update user so that training is marked as completed 
    app.route('/api/v1/markTrainingCompleted/:uid')
        .post(function(req, res) {
            User.findById(req.params.uid, function(err, user) {
                if (err) {
                    res.send(err);
                }

                user.trainingCompleted = 1 

                user.save(function(err) {
                    if (err) {
                        res.send(err);
                    }
                    res.json(user);
                });
            });
        });

    // ABBREVIATIONS =====================================================
    
    // Get a user's saved abbreviations 
    app.get('/getAbbreviations/:uid', function(req, res) {
        Abbreviation.find({uid: req.params.uid}).exec(function(err, info) {
           if (err) {
               res.send(err);
           }
           res.json(info);
       });
    })

    // Create a new abbreviation 
    app.route('/api/v1/createAbbreviation/:uid/:abbr/:full')
        .post(function(req, res) {
            var abbreviation = new Abbreviation();
            abbreviation.uid = req.params.uid; 
            abbreviation.abbr = req.params.abbr; 
            abbreviation.full = req.params.full;

            abbreviation.save(function(err) {
                if (err) {
                    res.send(err);
                }
                res.json(abbreviation);
            });
        });

    // Check if abbreviation exists for user; returns abbreviation if exists, otherwise returns empty array 
    app.get('/checkAbbreviation/:uid/:abbr', function(req, res) {
        Abbreviation.find({uid:req.params.uid, abbr: req.params.abbr}).exec(function(err, info) {
            if (err) {
                res.send(err); 
            }

            if (info.length > 0) {
                res.json({"exists": 1, "full": info[0].full})
            } else {
                res.json({"exists": 0})
            }
        });
    });

    // Delete an abbreviation 
    app.route('/api/v1/deleteAbbreviation/:aid')
        .post(function(req, res) {
            Abbreviation.findById(req.params.aid, function(err, abbreviation) {
                if (err) {
                    res.send(err);
                }

                abbreviation.remove(function(err) {
                    if (err) {
                        res.send(err);
                    }

                    res.json(abbreviation)
                })
            });
        });

    // Edit an abbreviation 
    app.route('/api/v1/editAbbreviation/:aid/:abbr/:full')
        .post(function(req, res) {
            Abbreviation.findById(req.params.aid, function(err, abbreviation) {
                if (err) {
                    res.send(err);
                }

                abbreviation.abbr = req.params.abbr; 
                abbreviation.full = req.params.full;

                abbreviation.save(function(err) {
                    if (err) {
                        res.send(err);
                    }
                    res.json(abbreviation);
                });
            });
        });

    // LANGUAGE
    app.route('/api/v1/selectLanguage/:uid/:language')
        .post(function(req, res) {
            User.findById(req.params.uid, function(err, user) {
                if (err) {
                    res.send(err);
                }

                user.language = req.params.language;

                user.save(function(err) {
                    if (err) {
                        res.send(err);
                    }
                    res.json(user);
                });
            });
        });

    app.get('/api/v1/getLanguage/:uid', function(req, res) {
        User.findById(req.params.uid, function(err, user) {
            if (err) {
                res.send(err);
            }

            res.json({language: user.language})
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