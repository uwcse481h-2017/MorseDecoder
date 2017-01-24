'use strict'

// Expose API routes
module.exports = function(app, passport) {
	// redirect default root to morse page
    app.get('/', function (req, res)
    {
        res.render('morse.html');
    });
}