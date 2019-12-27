const mongoose = require('mongoose');

// USER Schema
const AdminUserSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

const AdminUser = module.exports = mongoose.model('AdminUser', AdminUserSchema);