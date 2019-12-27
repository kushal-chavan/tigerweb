const mongoose = require('mongoose');

// USER Schema
const ServiceSchema = mongoose.Schema({
    product:{
        type: String,
        required: true
    },
    Expire_date:{
        type: String,
        required: true
    },
    user_id:{
        type: String,
        required: true
    },
    total_amount:{
        type: String,
        required: true
    },
    remember:{
        type: String,
    },
    customer_company:{
        type: String,
    },
    Payment_date:{
        type: String,
    },
    status:{
        type: String,
        required: true
    },
});

const Service = module.exports = mongoose.model('Service', ServiceSchema);