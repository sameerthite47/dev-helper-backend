const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const UserSchema = new Schema({
    name: {
        type: String,
        required:true,
        minlength:3
    },
    email: {
        type: String,
        required:true,
        minlength:5
    },
    password: {
        type: String,
        required:true,
        minlength:6
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = User = mongoose.model('users', UserSchema);