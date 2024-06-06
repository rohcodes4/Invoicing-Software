// routes/invoices.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Invoice = require('../models/Invoice');


// Middleware to handle errors
const errorHandler = (res, err) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  };
  
  // Calculate average invoice value for the specified period
  const calculateAverageInvoiceValue = async (startDate, endDate, userIdObj) => {
    try {
      const invoices = await Invoice.find({ user: userIdObj, date: { $gte: startDate, $lte: endDate } });
      if (invoices.length === 0) return 0;
  
      const totalValue = invoices.reduce((acc, invoice) => acc + invoice.total, 0);
      return totalValue / invoices.length;
    } catch (err) {
      throw err;
    }
  };
  
// Calculate returning customers percentage for the specified period
const calculateReturningCustomersPercentage = async (startDate, endDate, userIdObj) => {
    try {
      const uniqueCustomers = await Invoice.distinct('email', {user: userIdObj, date: { $gte: startDate, $lte: endDate } });
      const returningCustomers = await Invoice.aggregate([
        { $match: { date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$email', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
      ]);
  
      if (uniqueCustomers.length === 0) return 0;
      return (returningCustomers.length / uniqueCustomers.length) * 100;
    } catch (err) {
      throw err;
    }
  };

  
// Route to get statistics for the current month
router.get('/current', async (req, res) => {
    try {
      let userId = req.user.userId;
      let userIdObj = new mongoose.Types.ObjectId(userId);

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed, so add 1
      const currentYear = currentDate.getFullYear();
  
      // Calculate the start and end dates of the current month
      const startOfMonth = new Date(currentYear, currentMonth - 1, 1); // Note: Months are 0-indexed
      const endOfMonth = new Date(currentYear, currentMonth, 0); // Get the last day of the current month
  
      // Query database for invoices in the current month
      const currentMonthInvoices = await Invoice.find({
        user:userIdObj,
        date: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      });
  
      // Calculate statistics for the current month
      const totalSales = currentMonthInvoices.reduce((total, invoice) => total + invoice.total, 0);
      const numInvoices = currentMonthInvoices.length;
      const pendingPayments = currentMonthInvoices.reduce((total, invoice) => {
        if (invoice.paymentStatus !== 'Paid') {
          return total + invoice.total;
        }
        return total;
      }, 0);
      
      const averageInvoiceValue = await calculateAverageInvoiceValue(startOfMonth, endOfMonth, userIdObj);
      const returningCustomersPercentage = await calculateReturningCustomersPercentage(startOfMonth, endOfMonth, userIdObj);
  
      res.json({ totalSales, numInvoices, pendingPayments, averageInvoiceValue, returningCustomersPercentage, currentMonth, currentYear });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  
  // Route to get statistics for the previous month
  router.get('/previous', async (req, res) => {
    let userId = req.user.userId;
    let userIdObj = new mongoose.Types.ObjectId(userId);
    try {
      const currentDate = new Date();
      const previousMonth = currentDate.getMonth(); // Months are 0-indexed
      const previousYear = currentDate.getFullYear();
  
      // Calculate the start and end dates of the previous month
      const startOfMonth = new Date(previousYear, previousMonth - 1, 1); // Note: Months are 0-indexed
      const endOfMonth = new Date(previousYear, previousMonth, 0); // Get the last day of the previous month
  
      // Query database for invoices in the previous month
      const previousMonthInvoices = await Invoice.find({
        user:userIdObj,
        date: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      });
  
      // Calculate statistics for the previous month
      const totalSales = previousMonthInvoices.reduce((total, invoice) => total + invoice.total, 0);
      const numInvoices = previousMonthInvoices.length;
      const pendingPayments = previousMonthInvoices.reduce((total, invoice) => {
        if (invoice.paymentStatus !== 'Paid') {
          return total + invoice.total;
        }
        return total;
      }, 0);
      
      const averageInvoiceValue = await calculateAverageInvoiceValue(startOfMonth, endOfMonth, userIdObj);
      const returningCustomersPercentage = await calculateReturningCustomersPercentage(startOfMonth, endOfMonth, userIdObj);
  
      res.json({ totalSales, numInvoices, pendingPayments, averageInvoiceValue, returningCustomersPercentage, previousMonth, previousYear });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  });
    


module.exports = router;
