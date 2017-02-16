// Load required modules...
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// Define the schema for our user model
var userSchema = mongoose.Schema({
    general: {
        username: String, 
        email: String, 
        password: String, 
        image: String
    },
    trainingCompleted: Boolean,
    language: String 
});

// Method for generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Method for checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.general.password);
};

// Create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);