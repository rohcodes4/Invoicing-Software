import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard.css';
import monthNumberToWord from './MonthNumberToWord';
import { apiUrl } from '../functions/apiUrl';

const Dashboard = () => {
  const [currentMonthStats, setCurrentMonthStats] = useState({
    totalSales: 0,
    numInvoices: 0,
    pendingPayments: 0,
    currentMonth: 0,
    currentYear: 2024,
    returningCustomersPercentage:100,
    averageInvoiceValue:0
  });
  const [prevMonthStats, setPrevMonthStats] = useState({
    totalSales: 0,
    numInvoices: 0,
    pendingPayments: 0,
    previousMonth: 0,
    previousYear: 2024,
    returningCustomersPercentage:100,
    averageInvoiceValue:0
  });


  // const assignInvoicesToUser = async (userId, authToken) => {
  //   try {
  //     const response = await axios.post(
  //       `${apiUrl}/api/invoices/assign-invoices/${userId}`,
  //       {},
  //       {
  //         headers: {
  //           Authorization: `Bearer ${authToken}`,
  //         },
  //       }
  //     );
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error assigning invoices to user:', error);
  //     throw error;
  //   }
  // };
  
  // // Assuming you have the user's authentication token stored in localStorage
  // const authToken = localStorage.getItem('authToken');
  
  // // Call the function to assign invoices to the user
  // const userId = '665dffc94d2140689d5b5442';
  // assignInvoicesToUser(userId, authToken)
  //   .then((data) => {
  //     console.log('Invoices assigned successfully:', data);
  //   })
  //   .catch((error) => {
  //     console.error('Error assigning invoices to user:', error);
  //   });

  useEffect(() => {
    // Fetch current month's stats
    axios.get(`${apiUrl}/api/analytics/current`)
      .then(res => setCurrentMonthStats(res.data))
      .catch(err => console.log(err));

    // Fetch previous month's stats
    axios.get(`${apiUrl}/api/analytics/previous`)
      .then(res => setPrevMonthStats(res.data))
      .catch(err => console.log(err));
  }, []);

  const calculateDifference = (currentValue, prevValue) => {
    return currentValue - prevValue;
  };

    // Function to format currency value with symbol and commas
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  return (
    <div className="dashboard">
      <div className="card">
        <h2>Total Invoice Sales ({monthNumberToWord(currentMonthStats.currentMonth)}, {currentMonthStats.currentYear})</h2>
        <p>{formatCurrency(currentMonthStats.totalSales)}</p>
        <p className='previousStats'>vs</p>
        <p className='previousStats'>{monthNumberToWord(prevMonthStats.previousMonth)}, {prevMonthStats.previousYear}: {formatCurrency(prevMonthStats.totalSales)}</p>
        <p className='previousStats'>Difference: {formatCurrency(calculateDifference(currentMonthStats.totalSales, prevMonthStats.totalSales))}</p>
      </div>
      <div className="card">
        <h2>Number of Invoices ({monthNumberToWord(currentMonthStats.currentMonth)}, {currentMonthStats.currentYear})</h2>
        <p>{currentMonthStats.numInvoices}</p>
        <p className='previousStats'>vs</p>
        <p className='previousStats'>{monthNumberToWord(prevMonthStats.previousMonth)}, {prevMonthStats.previousYear}: {prevMonthStats.numInvoices}</p>
        <p className='previousStats'>Difference: {calculateDifference(currentMonthStats.numInvoices, prevMonthStats.numInvoices)}</p>
      </div>
      <div className="card">
        <h2>Pending Payments ({monthNumberToWord(currentMonthStats.currentMonth)}, {currentMonthStats.currentYear})</h2>
        <p >{formatCurrency(currentMonthStats.pendingPayments)}</p>
        <p className='previousStats'>vs</p>
        <p className='previousStats'>{monthNumberToWord(prevMonthStats.previousMonth)}, {prevMonthStats.previousYear}: {formatCurrency(prevMonthStats.pendingPayments)}</p>
        <p className='previousStats'>Difference: {formatCurrency(calculateDifference(currentMonthStats.pendingPayments, prevMonthStats.pendingPayments))}</p>
      </div>
      <div className="card">
        <h2>Average Invoice Value ({monthNumberToWord(currentMonthStats.currentMonth)}, {currentMonthStats.currentYear})</h2>
        <p>{formatCurrency(currentMonthStats.averageInvoiceValue)}</p>
        <p className='previousStats'> vs</p>
        <p className='previousStats'>{monthNumberToWord(prevMonthStats.previousMonth)}, {prevMonthStats.previousYear}: {formatCurrency(prevMonthStats.averageInvoiceValue)}</p>
      </div>
      <div className="card">
        <h2>Returning Customers</h2>
        <p>{currentMonthStats.returningCustomersPercentage.toFixed(2)}%</p>
      </div>
    </div>
  );
};

export default Dashboard;
