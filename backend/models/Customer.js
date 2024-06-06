const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    name: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique:false
    }
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
