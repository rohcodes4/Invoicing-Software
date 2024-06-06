import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import "../CustomerInvoices.css";
import toCurrency from '../functions/toCurrency';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../functions/apiUrl';
import getCurrencySymbol from 'currency-symbols';

const CustomerInvoices = () => {
    const { customerId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [customer, setCustomer] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        phone: '',
        email: '',
        company: '',
        address: ''
    });

    useEffect(() => {
       if(user){ // Fetch invoices for the selected customer
        axios.get(`${apiUrl}/api/customers/${customerId}/invoices`)
            .then(res => setInvoices(res.data))
            .catch(err => console.log(err));

        // Fetch selected customer
        axios.get(`${apiUrl}/api/customers/${customerId}`)
            .then(res => {
                setCustomer(res.data);
                setEditFormData({
                    name: res.data.name || '',
                    phone: res.data.phone || '',
                    email: res.data.email || '',
                    company: res.data.company || '',
                    address: res.data.address || ''
                });
            })
            .catch(err => console.log(err));}
    }, [customerId, user]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        axios.put(`${apiUrl}/api/customers/${customerId}`, editFormData)
            .then(res => {
                setCustomer(res.data);
                setIsEditing(false);
            })
            .catch(err => console.log(err));
    };

    const handleAddInvoiceClick = () => {
        navigate(`/customers/${customerId}/new`);
    };

    const handleDeleteInvoice = (id) => {
        axios.delete(`${apiUrl}/api/invoices/${id}`)
            .then(() => {
                setInvoices(invoices.filter(invoice => invoice._id !== id));
            })
            .catch(err => console.log(err));
    };

    return (
        <div className="customer-invoice-page">
            {customer && (
                <div className="customer-details">
                    <h2>Customer Details</h2>
                    {!isEditing ? (
                        <div className="customer-info">
                          <h4>Contact Information:</h4>
                          <div><p><a target="_blank" href={"mailto:"+customer.email}>{customer.email}</a></p></div>
                          <div><p><a href={"tel:"+customer.phone}>{customer.phone}</a></p></div>
                            
                            <h4>Default Address:</h4>
                            <div style={{display:'block'}}>
                            <div><p>{customer.name},</p></div>                          
                            <div><p>{customer.company},</p></div>
                            <div><p>{customer.address}</p></div>
                            </div>

                            <div><p>{customer.totalOrderCount || 0} Invoice's</p></div>
                            <div><p>Lifetime Value: {toCurrency(customer.totalOrderValue,"INR")}</p></div>
                            <button onClick={handleEditClick} className="edit-button">Edit</button>
                        </div>
                    ) : (
                        <form className="edit-form" onSubmit={handleFormSubmit}>
                            <div>
                                <label>Name:</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editFormData.name}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label>Phone:</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={editFormData.phone}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editFormData.email}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label>Company:</label>
                                <input
                                    type="text"
                                    name="company"
                                    value={editFormData.company}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label>Address:</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={editFormData.address}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <button type="submit" className="save-button">Save</button>
                            <button type="button" onClick={handleCancelClick} className="cancel-button">Cancel</button>
                        </form>
                    )}
                </div>
            )}
            <div className="invoice-list">
                <button onClick={handleAddInvoiceClick} className="add-invoice-button">Add New Invoice</button>
                {invoices.length > 0 ? (
                    <div>
                        <h1>{customer.name}'s Invoices</h1>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '30px' }}>Actions</th>
                                    <th>Company</th>
                                    <th>Invoice #</th>
                                    <th>Date</th>
                                    <th>Payment Status</th>
                                    <th>Total</th>
                                    <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map(invoice => (
                                    <tr key={invoice._id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                            //   checked={selectedInvoices.includes(invoice._id)}
                                            //   onChange={() => toggleInvoiceSelection(invoice._id)}
                                            />
                                        </td>
                                        <td><Link to={`/invoices/${invoice._id}`} className="invoice-item-link">{invoice.company}</Link></td>
                                        <td><Link to={`/invoices/${invoice._id}`} className="invoice-item-link">{invoice.invoiceNumber}</Link></td>
                                        <td>{formatDate(invoice.date)}</td>
                                        <td>{invoice.paymentStatus}</td>
                                        <td> {`${getCurrencySymbol(invoice.currency)} ${invoice.total}`}</td>                
                                        <td><button onClick={() => handleDeleteInvoice(invoice._id)} className="delete-button">Delete</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div>
                        <h1>{customer.name} has no Invoices yet!</h1>
                    </div>
                )}
            </div>
        </div>
    );
};

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
}

export default CustomerInvoices;
