const mongoose = require('mongoose');

// USER Schema
const DomainSchema = mongoose.Schema({
    domain:{
        type: String,
        unique:true,
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
    user_id:{
        type: String,
        required: true
    },
    created:{
        type: String,
        required: true
    },
    expire:{
        type: String,
        required: true
    },
    status:{
        type: String,
        required: true
    },
});

const Domain = module.exports = mongoose.model('Domain', DomainSchema);