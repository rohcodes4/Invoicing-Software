// routes/customers.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/',ensureAuthenticated, async (req, res) => {
  let userId = req.user.userId;
  let userIdObj = new mongoose.Types.ObjectId(userId);
    try {      
         // Fetch all customers
         const customers = await Customer.find({ user: userIdObj });

    // Fetch all invoices for each customer and calculate total order value
    const customersWithInvoices = await Promise.all(
      customers.map(async (customer) => {
        const invoices = await Invoice.find({ customer: customer._id });
        const totalOrderValue = invoices.reduce((total, invoice) => total + invoice.total, 0);
        const totalOrderCount = invoices.length;
        // console.log(totalOrderCount)
        return {
          ...customer.toObject(),
          totalOrderValue,
          totalOrderCount,
          invoices: invoices.map((invoice) => ({
            _id: invoice._id,
            invoiceNumber: invoice.invoiceNumber,
            total: invoice.total,
            // Add more invoice properties as needed
          })),
        };
      })
    );
    res.json(customersWithInvoices);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET a specific customer by ID
router.get('/:customerId',ensureAuthenticated, async (req, res) => {
  let userId = req.user.userId;
  let userIdObj = new mongoose.Types.ObjectId(userId);
  const { customerId } = req.params;
  // console.log(userId)
  // console.log(customerId)
  try {
    // Fetch the customer by ID
    const customer = await Customer.findOne({ _id: customerId, user: userIdObj });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }        

    // Fetch all invoices for the customer
    const invoices = await Invoice.find({ customer: customerId });

    // Calculate total order value
    const totalOrderValue = invoices.reduce((total, invoice) => total + invoice.total, 0);

    // Calculate total number of invoices 
    const totalOrderCount = invoices.length;

    // Construct the response object
    const customerWithInvoices = {
      ...customer.toObject(),
      totalOrderValue,
      totalOrderCount,
      invoices: invoices.map((invoice) => ({
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        // Add more invoice properties as needed
      })),
    };
    // console.log(customerWithInvoices)
    res.json(customerWithInvoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
  });

// GET invoices for a specific customer by ID
router.get('/:customerId/invoices', ensureAuthenticated, async (req, res) => {
  let userId = req.user.userId;
  let userIdObj = new mongoose.Types.ObjectId(userId);
    try {
      const customerId = req.params.customerId;
      // console.log(customerId)
      // Find invoices associated with the customer ID
      const invoices = await Invoice.find({ customer: customerId, user: userIdObj});
      // console.log(invoices)
      if (invoices.length === 0) {
        return res.status(404).json({ message: 'No invoices found for the specified customer ID' });
      }
      res.json(invoices);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  

// Route to create a new customer
router.post('/', ensureAuthenticated,async (req, res) => {
  try {
    let userId = req.user.userId;
  let userIdObj = new mongoose.Types.ObjectId(userId);
    const customer = new Customer({
        user: userIdObj,
        name: req.body.name,
        company: req.body.company,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email
    });
    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
} catch (err) {
    res.status(400).json({ message: err.message });
}
  });

  router.put('/:customerId', async (req, res) => {
    const { customerId } = req.params;
    const { name, phone, email, company, address } = req.body;

    let userId = req.user.userId;
    let userIdObj = new mongoose.Types.ObjectId(userId);

    try {
        const updatedCustomer = await Customer.findOneAndUpdate(
            {user: userIdObj, _id: customerId},
            { name, phone, email, company, address }
        );

        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.json(updatedCustomer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const createCustomersForExistingInvoices = async () => {
  try {
      // Fetch existing invoices without customer reference
      const invoices = await Invoice.find({ customer: { $exists: false } });

      // Iterate through each invoice
      for (const invoice of invoices) {
          // Check if customer already exists based on email
          let existingCustomer = await Customer.findOne({ email: invoice.email });

          // If customer doesn't exist, create a new one
          if (!existingCustomer) {
              existingCustomer = await Customer.create({
                  name: invoice.clientName,
                  email: invoice.email,
                  phone: invoice.phone,
                  company: invoice.company,
                  address: invoice.address
              });
          }

          // Attach customer reference to the invoice
          invoice.customer = existingCustomer._id;

          // Save the updated invoice
          await invoice.save();
      }

      console.log('Customers attached to existing invoices successfully');
  } catch (err) {
      console.error('Error attaching customers to existing invoices:', err);
  }
};

// createCustomersForExistingInvoices();


module.exports = router;
