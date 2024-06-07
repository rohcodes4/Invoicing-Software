const mongoose = require('mongoose');
// routes/invoices.js
const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { ensureAuthenticated } = require('../middleware/auth');


async function generateUniqueInvoiceNumber(userId) {
    const latestInvoice = await Invoice.findOne({ user: userId }).sort({ invoiceNumber: -1 }).exec();
    return latestInvoice ? latestInvoice.invoiceNumber + 1 : 1;
}

// Get all invoices
router.get('/',ensureAuthenticated, async (req, res) => {
    try {
        let userId = req.user.userId;
        const invoices = await Invoice.find({user: new mongoose.Types.ObjectId(userId)});
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single invoice
router.get('/:id', getInvoice, async (req, res) => {
  let userId = req.user.userId;
  const invoices = await Invoice.findOne({_id:req.params.id, user: new mongoose.Types.ObjectId(userId)});
    res.json(res.invoice);
});

// Create an invoice
router.post('/', ensureAuthenticated, async (req, res) => {

    try {
      let userId = req.user.userId;
      let userIdObj = new mongoose.Types.ObjectId(userId);
      let reminders = req.body.reminders;
      // Retrieve the latest invoice number from the database
        const invoiceNumber = await generateUniqueInvoiceNumber(userIdObj);

        // Check if the customer already exists
        let customer = await Customer.findOne({ email: req.body.email, user: userIdObj });

        // If customer doesn't exist, create a new one
        if (!customer) {
            customer = await Customer.create({ email: req.body.email, name: req.body.clientName, user: userIdObj, company, company:req.body.address, phone: req.body.phone});            
        }
        console.log(req.body.lineItems)

        const invoice = new Invoice({
            clientName: req.body.clientName,
            company: req.body.company,
            address: req.body.address,
            phone: req.body.phone,
            email: req.body.email,
            currency: req.body.currency || 'INR',
            advancePayment: parseFloat(req.body.advancePayment) || 0,
            tax: parseFloat(req.body.tax) || 0,
            discount: parseFloat(req.body.discount) || 0,
            lineItems: req.body.lineItems || [],
            total: parseFloat(req.body.total) || 0,
            notes: req.body.notes,
            date: req.body.date,
            paymentStatus: req.body.paymentStatus,
            customer: customer._id,
            invoiceNumber: invoiceNumber,
            user:userIdObj,
            reminders
        });

        const newInvoice = await invoice.save();


         // Create notifications for reminders
         if (reminders && reminders.length > 0) {
          const notifications = reminders.map(reminder => ({
              type:"Reminder",
              user: userIdObj,
              invoiceId: newInvoice._id,
              message: `Reminder for invoice ${newInvoice.invoiceNumber} on ${reminder.date}: ${reminder.message}`,
              date: reminder.date,
              isRead: false
          }));
          await Notification.insertMany(notifications);
      }

        res.status(201).json(newInvoice);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Update an invoice
router.patch('/:id', getInvoice, async (req, res) => {
    try {
        Object.keys(req.body).forEach(key => {
            if (key !== '_id' && key !== '__v') {
                res.invoice[key] = req.body[key];
            }
        });
        
        const updatedInvoice = await res.invoice.save();
        res.json(updatedInvoice);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Delete an invoice
router.delete('/:id', getInvoice, async (req, res) => {
   let userId = req.user.userId;
      let userIdObj = new mongoose.Types.ObjectId(userId);


    try {
        const invoice = await Invoice.findOneAndDelete({user: userIdObj,_id:req.params.id});
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE route to delete multiple invoices
router.delete('/', async (req, res) => {
   let userId = req.user.userId;
      let userIdObj = new mongoose.Types.ObjectId(userId);


    const { ids } = req.body; // Assuming the IDs are sent in the request body as an array
  
    try {
      // Delete multiple invoices by ID
      await Invoice.deleteMany({ _id: { $in: ids } });
  
      res.status(200).json({ message: 'Invoices deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while deleting invoices' });
    }
  });

async function getInvoice(req, res, next) {
  let userId = req.user.userId;
  let userIdObj = new mongoose.Types.ObjectId(userId);
  let invoice;
    try {
        invoice = await Invoice.findOne({_id:req.params.id, user: userIdObj});
        if (invoice == null) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.invoice = invoice;
    next();
}

// Route to assign all existing invoices to a particular user
router.post('/assign-invoices/:userId', async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.params.userId);
  console.log(userId)
    try {
      // Fetch the user to whom you want to assign the invoices
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      console.log(user)

      // Fetch all existing invoices
      const invoices = await Invoice.find();
      const customers = await Customer.find();
      const notifications = await Notification.find();
  
      // Update each invoice to reference the user
      const updatedInvoices = await Promise.all(
        invoices.map(async (invoice) => {
          invoice.user = user._id;
          return await invoice.save();
        })
      );
  
      // Update each customer to reference the user
      const updatedCustomer = await Promise.all(
        customers.map(async (customer) => {
          customer.user = user._id;
          return await customer.save();
        })
      );
  
      // Update each notification to reference the user
      const updatedNotification = await Promise.all(
        notifications.map(async (notification) => {
          notification.user = user._id;
          return await notification.save();
        })
      );

      updatedInvoices();
      updatedCustomer();
      updatedNotification();
  
      return res.status(200).json({ message: 'Invoices assigned successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server Error' });
    }
  });
  

module.exports = router;
