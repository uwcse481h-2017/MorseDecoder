// Load required modules...
var mongoose = require('mongoose');

// Define the schema for our abbreviation model
var abbreviationSchema = mongoose.Schema({
    uid: String, 
    abbr: String,
    full: String
});

// Create the model for abbreviations and expose it to our app
module.exports = mongoose.model('Abbreviation', abbreviationSchema);