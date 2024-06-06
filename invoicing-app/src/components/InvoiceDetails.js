import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../Invoices.css'; // Import the CSS file
import InvoicePDF from './InvoicePDF'; // Component for generating PDF
import { PDFDownloadLink } from '@react-pdf/renderer';
import { validateEmail } from './ValidateEmail';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../functions/apiUrl';

const InvoiceDetails = () => {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [editing, setEditing] = useState(false); // State to toggle editing mode
    const [showPDF, setShowPDF] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('Pending'); // State to manage payment status
    const [emailError, setEmailError] = useState('');

    const { user } = useAuth();
    const [profile, setProfile] = useState({});

    console.log(profile)
    
    useEffect(() => {
    
        if (user) {
          axios.get(`${apiUrl}/api/profile/`)
            .then(res => setProfile(res.data))
            .catch(err => console.log(err));
        }
      }, [user]);

    useEffect(() => {
        axios.get(`${apiUrl}/api/invoices/${id}`)
        .then(res => {
            setInvoice(res.data);
            setPaymentStatus(res.data.paymentStatus || 'Pending'); // Set payment status from invoice data
        })
        .catch(err => console.error(err));
    }, [id]);

    useEffect(() => {
          if(editing){
            setShowPDF(false)
          }
    }, [editing])
    

    // Function to handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInvoice({ ...invoice, [name]: value });
    };

    // Function to save changes
    const saveChanges = () => {

        if (!validateEmail(invoice.email)) {
            setEmailError('Please enter a valid email address.');
            return;
        }else{
            setEmailError('')
        }

        // Recalculate total
        const subtotal = invoice.lineItems.reduce((acc, item) => {
            const price = parseFloat(item.unitPrice);
            if (!isNaN(price)) {
                return acc + price;
            } else {
                console.error(`Invalid unitPrice: ${item.unitPrice}`);
                return acc; // Skip invalid price
            }
        }, 0);
        const total = subtotal - invoice.discount + invoice.tax;

        const updatedInvoice = {
            ...invoice,
            total: total,
            paymentStatus: paymentStatus

        };

        axios.patch(`${apiUrl}/api/invoices/${id}`, updatedInvoice)
            .then(res => {
                console.log(res.data);
                setInvoice(updatedInvoice); // Update the local state with the updated invoice data
            })
            .catch(err => console.error(err));

        setEditing(false);
    };

    // Function to add a new line item
    const handleAddLineItem = () => {
        setInvoice({
            ...invoice,
            lineItems: [...invoice.lineItems, { description: '', unitPrice: 0 }]
        });
    };

    // Function to remove a line item
    const handleRemoveLineItem = (index) => {
        const updatedLineItems = [...invoice.lineItems];
        updatedLineItems.splice(index, 1);
        setInvoice({
            ...invoice,
            lineItems: updatedLineItems
        });
    };

    // Function to handle line item change
    const handleLineItemChange = (index, field, value) => {
        const updatedLineItems = [...invoice.lineItems];
        updatedLineItems[index][field] = value;
        setInvoice({
            ...invoice,
            lineItems: updatedLineItems
        });
    };

    // Function to format currency value with symbol and commas
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: invoice.currency }).format(value);
    };

    return (
        <div className="invoice-details">
            {invoice && (
                <div>
                    <div className="invoice-header">
                        <h2>Invoice Details</h2>
                        <div style={{display:'flex'}}>
                        <button style={{marginRight:'10px'}} onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit'}</button>
                        {!editing && !showPDF && <button onClick={() => setShowPDF(true)}>Generate PDF</button>}
            {showPDF && !editing &&(
                <div>
                    <PDFDownloadLink document={<InvoicePDF invoice={invoice} profile={profile} />} fileName={`#ROH${invoice.invoiceNumber}.pdf`}
                    style={{textDecoration:'none', backgroundColor:'#007bff', padding:'10px 20px', color:'#fff', marginRight:'10px',border:'1px solid #007bff'}}>
                        {({ blob, url, loading, error }) =>
                            loading ? 'Loading document...' : 'Download PDF'
                        }
                    </PDFDownloadLink>
                    <button style={{backgroundColor:"#fff", color:"#007bff",border:'1px solid #007bff'}}onClick={() => setShowPDF(false)}>Close PDF</button>
                </div>
            )}
                    </div>

                    </div>
                    <div>
                        <p>Invoice Number: {invoice.invoiceNumber}</p>
                        <p>Client Name: {editing ? <input type="text" name="clientName" value={invoice.clientName} onChange={handleInputChange} /> : invoice.clientName}</p>
                        <p>Company: {editing ? <input type="text" name="company" value={invoice.company} onChange={handleInputChange} /> : invoice.company}</p>
                        <p>Address: {editing ? <input type="text" name="address" value={invoice.address} onChange={handleInputChange} /> : invoice.address}</p>
                        <p>Phone: {editing ? <input type="text" name="phone" value={invoice.phone} onChange={handleInputChange} /> : invoice.phone}</p>
                        <p>Email: {editing ? <input type="email" name="email" value={invoice.email} onChange={handleInputChange} /> : invoice.email}</p>
                        {emailError && <p className="error">{emailError}</p>}
                        <p>Advance Payment: {editing ? <input type="number" name="advancePayment" value={invoice.advancePayment} onChange={handleInputChange} /> : formatCurrency(invoice.advancePayment)}</p>
                        <p>Discount: {editing ? <input type="number" name="discount" value={invoice.discount} onChange={handleInputChange} /> : formatCurrency(invoice.discount)}</p>
                    </div>
                    <div>
                    <p>Payment Status: {editing ? <select name="paymentStatus" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Partially Paid">Partially Paid</option>
                        </select> : invoice.paymentStatus}</p>
                        </div>
                    <div>
                        <h3>Line Items</h3>
                        {!editing ? (
                            <table className="invoice-table">
                                <thead>
                                    <tr>
                                        <th>Description</th>
                                        <th>Unit Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.lineItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.description}</td>
                                            <td>{formatCurrency(item.unitPrice)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            invoice.lineItems.map((item, index) => (
                                <div key={index} className="invoice-item">
                                    <input type="text" value={item.description} onChange={(e) => handleLineItemChange(index, 'description', e.target.value)} placeholder="Description" className="invoices__input invoices__lineItemInput" />
                                    <input type="number" value={item.unitPrice} onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)} placeholder="Unit Price" className="invoices__input invoices__lineItemInput" />
                                    {editing && <button onClick={() => handleRemoveLineItem(index)}>Remove</button>}
                                </div>
                            ))
                        )}
                        {editing && <button onClick={handleAddLineItem} className="invoices__addLineItem">Add Line Item</button>}
                    </div>
                    <p>Notes: {editing ? <textarea name="notes" value={invoice.notes} onChange={handleInputChange}></textarea> : invoice.notes}</p>
                    <div className="invoice-total">
                        Total: <span>{formatCurrency(invoice.total)}</span>
                    </div>
                    {editing && <button onClick={saveChanges}>Save Changes</button>}
                </div>
            )}
        </div>
    );
};

export default InvoiceDetails;
