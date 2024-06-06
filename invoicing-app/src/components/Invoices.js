import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../Invoices.css';
import { apiUrl } from '../functions/apiUrl';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [clientName, setClientName] = useState('');
    const [company, setCompany] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [currency, setCurrency] = useState('INR');
    const [advancePayment, setAdvancePayment] = useState(0); // Change to number
    const [tax, setTax] = useState(0); // Change to number
    const [discount, setDiscount] = useState(0); // Change to number
    const [lineItems, setLineItems] = useState([{ description: '', unitPrice: 1 }]);
    const [description, setDescription] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [notes, setNotes] = useState(''); // State for notes
    const [invoiceDate, setInvoiceDate] = useState(getISTDate()); // Default to current IST date
    const [invoiceTotal, setInvoiceTotal] = useState(0); // State for total amount

    useEffect(() => {
        axios.get(`${apiUrl}/api/invoices`)
            .then(res => setInvoices(res.data))
            .catch(err => console.log(err));
    }, []);

    

    const handleCreateInvoice = () => {
        // Calculate subtotal
        const subtotal = lineItems.reduce((acc, item) => {
            const price = parseFloat(item.unitPrice);
            if (!isNaN(price)) {
                return acc + price;
            } else {
                console.error(`Invalid unitPrice: ${item.unitPrice}`);
                return acc; // Skip invalid price
            }
        }, 0);
                // Calculate total
        const total = subtotal - discount + tax;

        console.log(subtotal)
        // Prepare data for POST request
        const data = {
            clientName,
            company,
            address,
            phone,
            email,
            currency,
            advancePayment: parseFloat(advancePayment), // Parse advancePayment to number
            tax: parseFloat(tax), // Parse tax to number
            discount: parseFloat(discount), // Parse discount to number
            lineItems,
            total,
            notes,
            date: invoiceDate
        };

        console.log(data)
        // Send POST request to create invoice
        axios.post(`${apiUrl}/api/invoices`, data)
            .then(res => {
                setInvoices([...invoices, res.data]);
                // Reset form fields
                setClientName('');
                setCompany('');
                setAddress('');
                setPhone('');
                setEmail('');
                setCurrency('INR');
                setAdvancePayment(0);
                setTax(0);
                setDiscount(0);
                setLineItems([{ description: '', unitPrice: 1 }]);
                setDescription('');
                setUnitPrice('');
                setNotes('');
                setInvoiceDate(getISTDate());
                setInvoiceTotal(0); // Reset total after creating invoice
            })
            .catch(err => console.log(err));
    };

    const handleDeleteInvoice = (id) => {
        axios.delete(`${apiUrl}/api/invoices/${id}`)
            .then(() => {
                setInvoices(invoices.filter(invoice => invoice._id !== id));
            })
            .catch(err => console.log(err));
    };

    const handleAddLineItem = () => {
        setLineItems([...lineItems, { description, unitPrice: parseFloat(unitPrice) }]);
        setDescription('');
        setUnitPrice('');
    };

    const handleLineItemChange = (index, field, value) => {
        const updatedLineItems = [...lineItems];
        updatedLineItems[index][field] = value;
        setLineItems(updatedLineItems);
    };

    function getISTDate() {
        const date = new Date();
        const ISTOffset = 330; // IST is UTC+5:30
        const ISTTime = new Date(date.getTime() + (ISTOffset * 60000));
        return ISTTime.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    }
    
  
    return (
        <div className="invoices">
            <h1 className="invoices__title">Invoices</h1>
            <ul className="invoices__list">
                {invoices.map(invoice => (
                    <li key={invoice._id} className="invoices__item">
                        <Link to={`/invoices/${invoice._id}`} className="invoices__link">
                            <span className="invoices__client">{invoice.clientName}</span>
                            <span className="invoices__amount">{invoice.currency} {invoice.total}</span>
                        </Link>
                        <button onClick={() => handleDeleteInvoice(invoice._id)} className="invoices__delete">Delete</button>
                    </li>
                ))}
            </ul>
            <div className="invoices__create">
                <h2>Create Invoice</h2>
                <label htmlFor="clientName">Client Name:</label>
                <input type="text" id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client Name" className="invoices__input" />
                <label htmlFor="company">Company:</label>
                <input type="text" id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className="invoices__input" />
                <label htmlFor="address">Address:</label>
                <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="invoices__input" />
                <label htmlFor="phone">Phone:</label>
                <input type="text" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="invoices__input" />
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="invoices__input" />
                <label htmlFor="currency">Currency:</label>
                <input type="text" id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="Currency" className="invoices__input" />
                <label htmlFor="advancePayment">Advance Payment:</label>
                <input type="number" id="advancePayment" value={advancePayment} onChange={(e) => setAdvancePayment(e.target.value)} placeholder="Advance Payment" className="invoices__input" />
                <label htmlFor="tax">Tax:</label>
                <input type="number" id="tax" value={tax} onChange={(e) => setTax(e.target.value)} placeholder="Tax" className="invoices__input" />
                <label htmlFor="discount">Discount:</label>
                <input type="number" id="discount" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="Discount" className="invoices__input" />
                <label htmlFor="invoiceDate">Invoice Date:</label>
                <input type="date" id="invoiceDate" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="invoices__input" />
                <div className="invoices__lineItems">
                    <h3>Line Items</h3>
                    {lineItems.map((item, index) => (
                        <div key={index} className="invoices__lineItem">
                            <input type="text" value={item.description} onChange={(e) => handleLineItemChange(index, 'description', e.target.value)} placeholder="Description" className="invoices__input invoices__lineItemInput" />
                            <input type="number" value={item.unitPrice} onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)} placeholder="Unit Price" className="invoices__input invoices__lineItemInput" />
                        </div>
                    ))}
                    <button onClick={handleAddLineItem} className="invoices__addLineItem">Add Line Item</button>
                </div>
                {/* Add notes section */}
                <label htmlFor="notes">Notes:</label>
                <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="invoices__input" />
                <button onClick={handleCreateInvoice} className="invoices__createButton">Create</button>
            </div>
        </div>
    );
};

export default Invoices;
