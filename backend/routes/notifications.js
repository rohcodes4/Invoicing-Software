const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const { ensureAuthenticated } = require('../middleware/auth');
const Notification = require('../models/Notification');

// Get notifications
router.get('/',ensureAuthenticated, async (req, res) => {
    let userId = req.user.userId;
  let userIdObj = new mongoose.Types.ObjectId(userId);
    try {
        const pendingInvoices = await getPendingInvoices(userIdObj);
        const nonRepeatingCustomers = await getNonRepeatingCustomers(userIdObj);

        res.json({ pendingInvoices, nonRepeatingCustomers });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Mark a notification as read
router.patch('/:id/read', ensureAuthenticated, async (req, res) => {
    try {
        let userId = req.user.userId;
        let userIdObj = new mongoose.Types.ObjectId(userId);
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: userIdObj },
        { isRead: true }        
      );
  
      if (!notification) {
        console.log(req.params.id)
        console.log(userIdObj)
        console.log(notification)
        return res.status(404).json({ message: 'Notification not found' });
      }
  
      res.status(200).json(notification);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

// Function to get pending invoices
async function getPendingInvoices(userId) {
    const today = new Date();
    const pendingInvoices = await Notification.find({ type: 'Pending Invoice', user: userId }).lean();
return pendingInvoices;
    return pendingInvoices.map(invoice => {
        const weeksPending = Math.ceil((today - new Date(invoice.date)) / (1000 * 60 * 60 * 24 * 7));
        return {
            _id: invoice._id,
            message: `Invoice #${invoice.invoiceNumber} for ${invoice.clientName} has been pending for ${weeksPending} week(s).`,
            customerId: invoice.customer,
            invoiceId: invoice._id
        };
    });
}

// Function to get non-repeating customers
async function getNonRepeatingCustomers(userId) {
    // const twoMonthsAgo = new Date();
    // twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    // const customers = await Customer.find({ user: userId }).lean();
    const nonRepeatingCustomers = await Notification.find({ type: 'Inactive Customer', user:userId }).lean();
    // const nonRepeatingCustomers = await Notification.find({ type: 'Inactive Customer', user: userId }).lean();
    return nonRepeatingCustomers;

    for (const customer of customers) {
        const lastInvoice = await Invoice.findOne({ customer: customer._id, user: userId }).sort({ date: -1 });

        if (lastInvoice && new Date(lastInvoice.date) < twoMonthsAgo) {
            nonRepeatingCustomers.push({
                _id: customer._id,
                message: `Customer ${customer.name} has not placed an order since ${new Date(lastInvoice.date).toLocaleDateString()}.`,
                customerId: customer._id,
                invoiceId: lastInvoice._id

            });
        }
    }

    // return nonRepeatingCustomers;
}

module.exports = router;
