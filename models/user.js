const mongoose = require('mongoose');

// USER Schema
const UserSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        unique : true,
        required: true
    },
    email:{
        type: String,
        unique : true,
        required: true
    },
    username:{
        type: String,
        unique : true,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

const User = module.exports = mongoose.model('User', UserSchema);