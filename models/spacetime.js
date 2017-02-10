// Load required modules...
var mongoose = require('mongoose');

// Define the schema for our space time model
var spacetimeSchema = mongoose.Schema({
    uid: String, 
    time: Number, 
    type: String 
});

// Create the model for space times and expose it to our app
module.exports = mongoose.model('Spacetime', spacetimeSchema);