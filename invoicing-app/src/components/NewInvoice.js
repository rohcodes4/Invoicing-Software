import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { validateEmail } from './ValidateEmail';
import '../Invoices.css';
import Select from 'react-select';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../functions/apiUrl';


const NewInvoice = () => {
    const { customerId } = useParams();
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [clientName, setClientName] = useState('');
    const [company, setCompany] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [currency, setCurrency] = useState('INR');
    const [advancePayment, setAdvancePayment] = useState(0); 
    const [tax, setTax] = useState(0); 
    const [discount, setDiscount] = useState(0); 
    const [lineItems, setLineItems] = useState([{ description: '', unitPrice: 1 }]);
    const [notes, setNotes] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(getISTDate());
    const [paymentStatus, setPaymentStatus] = useState('Pending');
    const [emailError, setEmailError] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        console.log(customerId)
        if(customerId==undefined) return;
        // Fetch selected customer
        axios.get(`${apiUrl}/api/customers/${customerId}`)
            .then(res => {
                setSelectedCustomer({ value: res.data._id, label: `${res.data.name} - ${res.data.email}` });
                console.log(res.data)
                setClientName(res.data.name);
                setCompany(res.data.company);
                setAddress(res.data.address);
                setEmail(res.data.email);
                setPhone(res.data.phone);               
            })
            .catch(err => console.log(err));
    }, [customerId]);

    useEffect(() => {
        console.log(selectedCustomer)
    }, [selectedCustomer]);

    useEffect(() => {
        // Fetch existing customers from the backend
        axios.get(`${apiUrl}/api/customers`)
            .then(res => setCustomers(res.data))
            .catch(err => console.log(err));
    }, []);

    const handleCreateInvoice = () => {
        console.log(selectedCustomer)
        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address.');
            return;
        } else {
            setEmailError('');
        }

        // Calculate subtotal
        const subtotal = lineItems.reduce((acc, item) => {
            const price = parseFloat(item.unitPrice);
            return !isNaN(price) ? acc + price : acc; 
        }, 0);
        
        // Calculate total
        const total = subtotal - discount + tax;

        // Prepare data for POST request
        const data = {
            clientName,
            company,
            address,
            phone,
            email,
            currency,
            advancePayment: parseFloat(advancePayment),
            tax: parseFloat(tax),
            discount: parseFloat(discount),
            lineItems,
            total,
            notes,
            date: invoiceDate,
            paymentStatus,
            customer: selectedCustomer.value, // Send customer ID
            user:user._id
        };

        // Send POST request to create invoice
        axios.post(`${apiUrl}/api/invoices`, data)
            .then(res => {
                // Reset form fields
                resetFormFields();
                // Navigate to the InvoiceDetails page of the newly created invoice
                navigate(`/invoices/${res.data._id}`);
            })
            .catch(err => console.log(err));
    };

    const handleSelectCustomer = (selectedOption) => {
        setSelectedCustomer(selectedOption);
        if (selectedOption) {
            // Fetch customer details from the backend based on selected customer ID
            axios.get(`${apiUrl}/api/customers/${selectedOption.value}`)
                .then(res => {
                    const customerData = res.data;
                    // Populate invoice fields with customer data
                    // Update state with customer data
                    // Example:
                    setClientName(customerData.name);
                    setCompany(customerData.company);
                    setAddress(customerData.address);
                    setEmail(customerData.email);
                    setPhone(customerData.phone);
                })
                .catch(err => console.log(err));
        }
    };

    const handleNewCustomer = () => {
        // Prepare data for creating a new customer
        const data = {
            name: clientName,
            email,
            company,
            address,
            phone,
            email,
            // Other customer details
        };

        // Send POST request to create customer
        axios.post(`${apiUrl}/api/customers`, data)
            .then(res => {
                // Update customers state with the new customer
                setCustomers([...customers, res.data]);
                // Set the newly created customer as selected
                setSelectedCustomer({ value: res.data._id, label: `${res.data.name} - ${res.data.email}` });
            })
            .catch(err => console.log(err));
    };

      // Option format for React Select dropdown
      const formatOption = (customer) => ({
        value: customer._id,
        label: `${customer.name} - ${customer.email} - Lifetime Value: ${customer.totalOrderValue}`
    });


    const resetFormFields = () => {
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
        setNotes('');
        setInvoiceDate(getISTDate());
        setPaymentStatus('');
    };

    const handleAddLineItem = () => {
        setLineItems([...lineItems, { description: '', unitPrice: 1 }]);
    };

    const handleLineItemChange = (index, field, value) => {
        const updatedLineItems = [...lineItems];
        updatedLineItems[index][field] = value;
        setLineItems(updatedLineItems);
    };

    function getISTDate() {
        const date = new Date();
        const ISTOffset = 330;
        const ISTTime = new Date(date.getTime() + (ISTOffset * 60000));
        return ISTTime.toISOString().split('T')[0]; 
    }

    const colourStyles = {
        control: styles => ({ ...styles, color: '#333' }),
        option: (styles, { data, isDisabled, isFocused, isSelected }) => {
        //   const color = chroma(data.color);
          return {
            ...styles,
            backgroundColor: isSelected?'#0b4e3a':(isFocused?'#1a936f':'#fff'),            
            color: isSelected?'#fff':(isFocused?'#fff':'#333'),
            cursor: isDisabled ? 'not-allowed' : 'default',
          };
        },
      };
      

    return (
        <div className="invoices">
            <h1 className="invoices__title">Create New Invoice</h1>
            <div className="invoices__create">
            <Select
                 options={customers.map(formatOption)}
                 value={selectedCustomer}
                 onChange={handleSelectCustomer}
                 placeholder="Select Customer or Add New"
                 styles={colourStyles}
            />
            {selectedCustomer && <button onClick={()=>setSelectedCustomer('')}>Add New Customer</button>}
             {/* Render client details only if no customer is selected */}
             {!selectedCustomer && (<>
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
                {emailError && <p className="invoices__error">{emailError}</p>}
                </>)}
                {!selectedCustomer && <button onClick={handleNewCustomer}>Create New Customer</button>}
                <label htmlFor="currency">Currency:</label>
                <input type="text" id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="Currency" className="invoices__input" />
                <label htmlFor="advancePayment">Advance Payment:</label>
                <input style={{marginLeft:"5px"}} type="number" id="advancePayment" value={advancePayment} onChange={(e) => setAdvancePayment(e.target.value)} placeholder="Advance Payment" className="invoices__input" />
                <label style={{marginLeft:"10px"}} htmlFor="tax">Tax:</label>
                <input style={{marginLeft:"5px"}}type="number" id="tax" value={tax} onChange={(e) => setTax(e.target.value)} placeholder="Tax" className="invoices__input" />
                <label style={{marginLeft:"10px"}} htmlFor="discount">Discount:</label>
                <input style={{marginLeft:"5px"}}type="number" id="discount" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="Discount" className="invoices__input" />
                <div>
                    <label htmlFor="paymentStatus">Payment Status:</label>
                    <select id="paymentStatus" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="invoices__input">
                        {/* <option value="">Select Payment Status</option> */}
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Unpaid">Unpaid</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="invoiceDate">Invoice Date:</label>
                    <input type="date" id="invoiceDate" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="invoices__input" />
                </div>
                <div className="invoices__lineItems">
                    <h3 style={{color:"#fff"}}>Line Items</h3>
                    {lineItems.map((item, index) => (
                        <div key={index} className="invoices__lineItem">
                            <input type="text" value={item.description} onChange={(e) => handleLineItemChange(index, 'description', e.target.value)} placeholder="Description" className="invoices__input invoices__lineItemInput" />
                            <input type="number" value={item.unitPrice} onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)} placeholder="Unit Price" className="invoices__input invoices__lineItemInput" />
                        </div>
                    ))}
                    <button onClick={handleAddLineItem} className="invoices__addLineItem">Add Line Item</button>
                </div>
                <label htmlFor="notes">Notes:</label>
                <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="invoices__input" />
                <button onClick={handleCreateInvoice} className="invoices__createButton">Create</button>
            </div>
        </div>
    );
};

export default NewInvoice;
