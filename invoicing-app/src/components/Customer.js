import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import "../Customer.css";

const Customers = () => {
    const [customers, setCustomers] = useState([]);


    useEffect(() => {
        // Fetch all customers from the backend
        axios.get('http://localhost:5000/api/customers')
            .then(res => setCustomers(res.data))
            .catch(err => console.log(err));
    }, []);

    if(customers.length==0){
      return(<div style={{display:'flex',justifyContent:'center',alignItems:'center', height:'calc(100vh - 250px)'}}>
      <h1 style={{color:'#fff', textAlign:'center'}}>No Customers yet</h1>
      </div>)
    }

    return (
        <div className="customers-page">
        <h1>All Customers</h1>
        <table className="customers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Total Orders</th>
              <th>Lifetime Value</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
          {customers.map(customer => (
                    <tr key={customer._id}>
                        <td><Link to={`/customers/${customer._id}/invoices`}><strong>{customer.name}</strong></Link></td>
                        <td>{customer.email}</td>
                        <td>{customer.phone}</td>
                        <td>{customer.totalOrderCount || 0}</td>
                        <td>{customer.totalOrderValue}</td>
                        <td></td>                        
                    </tr>
                ))}
          </tbody>
        </table>
      </div>
      
    );
};

export default Customers;
