'use strict'

// Expose API routes
module.exports = function(app, passport) {
	// redirect default root to morse page
    app.get('/', function (req, res){
        res.render('morse.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

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

}

// Route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}