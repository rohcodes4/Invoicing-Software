const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const ReminderSchema = new mongoose.Schema({
    date: {
        type: Date        
    },
    message: {
        type: String    
    }
});

const invoiceSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    invoiceNumber: {
        type: Number,
        required: false
    },
    clientName: {
        type: String,
        required: false
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
        required: false
    },
    currency: {
        type: String,
        default: 'INR'
    },
    advancePayment: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    lineItems: [{
        description: {
            type: String,
            required: false
        },
        quantity: {
            type: Number,
            default: 1        
        },
        unitPrice: {
            type: Number,
            default: 1
        }
    }],
    total: {
        type: Number,
        required: false
    },
    notes: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Partially Paid'],
        default: 'Pending'
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    reminders: [ReminderSchema] 
});


module.exports = mongoose.model('Invoice', invoiceSchema);