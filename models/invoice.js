const mongoose = require('mongoose');

// USER Schema
const InvoiceSchema = mongoose.Schema({
    invoice_id:{
        type: String,
        required: true
    },
    invoice_date:{
        type: String,
        required: true
    },
    due_date:{
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

const Invoice = module.exports = mongoose.model('Invoice', InvoiceSchema);