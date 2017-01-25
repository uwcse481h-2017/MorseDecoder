// Load modules and models...
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

// Expose this function to our app using module.exports
module.exports = function(passport) {

    // SESSION SETUP =====================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // LOCAL SIGNUP ======================================================

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        email = email.toLowerCase();  // store user emails in lower case, to make logins case-insensitive 

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'general.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

                // if there is no user with that email
                // create the user
                var newUser = new User();

                // set the user's general credentials
                newUser.general.username = req.body.username; 
                newUser.general.email = email;
                newUser.general.password = newUser.generateHash(password);
                newUser.general.image = generateGravatar(email);

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    console.log('user saved!')
                    return done(null, newUser);
                });
            }

        });    

        });

    }));

    // LOCAL LOGIN =======================================================

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form
        email = email.toLowerCase();      // emails were stored in lower case, done to ignore case when logging in

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'general.email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));

};

// Helper method for generating Gravatar url
function generateGravatar(email) {
    var hash = require('crypto').createHash('md5').update(email).digest('hex');
    return 'http://www.gravatar.com/avatar/' + hash + '/?&s=200?&d=identicon';
}