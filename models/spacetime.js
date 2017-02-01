// Load required modules...
var mongoose = require('mongoose');

// Define the schema for our user model
var spacetimeSchema = mongoose.Schema({
    uid: String, 
    time: Number, 
    isShort: Boolean 
});

// Create the model for users and expose it to our app
module.exports = mongoose.model('Spacetime', spacetimeSchema);