const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: String,
    message: String,
    date: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'    }
});

module.exports = mongoose.model('Notification', notificationSchema);
