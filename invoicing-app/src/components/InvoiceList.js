import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../InvoiceList.css';
import { apiUrl } from '../functions/apiUrl';
import getCurrencySymbol from 'currency-symbols';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [filterValues, setFilterValues] = useState({
    company: '',
    invoiceNumber: '',
    clientName: '',
    paymentStatus: '',
    startDate: '',
    endDate: ''
  });
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${apiUrl}/api/invoices`)
      .then(res => setInvoices(res.data))
      .catch(err => console.log(err));
  }, []);

  if(invoices.length==0){
      return(<div style={{display:'flex',justifyContent:'center',alignItems:'center', height:'calc(100vh - 250px)'}}>
      <h1 style={{color:'#fff', textAlign:'center'}}>No Invoices yet</h1>
      </div>)
    }

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterValues({ ...filterValues, [name]: value });
  };

  const handleClearFilters = () => {
    setFilterValues({
      company: '',
      invoiceNumber: '',
      clientName: '',
      paymentStatus: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const sortedInvoices = [...invoices].sort((a, b) => {
    if (sortBy === 'invoiceNumber' || sortBy === 'total') {
      return sortOrder === 'asc' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
  } else {
      return sortOrder === 'asc' ? a[sortBy]?.localeCompare(b[sortBy]) : b[sortBy]?.localeCompare(a[sortBy]);
    }
  });

  const filteredInvoices = sortedInvoices.filter(invoice => {
    return Object.keys(filterValues).every(key => {
      if (!filterValues[key]) return true; // No filter applied
      if (key === 'invoiceNumber') {
        return invoice[key].toString().toLowerCase().includes(filterValues[key].toLowerCase());
      } else if (key === 'paymentStatus') {
        return invoice[key] === filterValues[key];
      } else if (key === 'startDate' || key === 'endDate') {
        if (!filterValues.startDate || !filterValues.endDate) return true;
        const invoiceDate = new Date(invoice.date);
        const startDate = new Date(filterValues.startDate);
        const endDate = new Date(filterValues.endDate);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      } else {
        return invoice[key]?.toLowerCase().includes(filterValues[key].toLowerCase());
      }
    });
  });

  const renderSortArrow = (column) => {
    if (sortBy === column) {
      return sortOrder === 'asc' ? '▲' : '▼';
    }
    return null;
  };

  const toggleInvoiceSelection = (id) => {
    const isSelected = selectedInvoices.includes(id);
    if (isSelected) {
      setSelectedInvoices(selectedInvoices.filter(selectedId => selectedId !== id));
    } else {
      setSelectedInvoices([...selectedInvoices, id]);
    }
  };

  const handleDeleteSelectedInvoices = () => {
    const confirmDelete = window.confirm("Are you sure you want to delete selected invoices?");
    if (confirmDelete) {
      axios.delete(`${apiUrl}/api/invoices`, { data: { ids: selectedInvoices } })
        .then(() => {
          setInvoices(invoices.filter(invoice => !selectedInvoices.includes(invoice._id)));
          setSelectedInvoices([]);
        })
        .catch(err => console.log(err));
    }
  };

  const handleDeleteInvoice = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this invoice?");
    if (confirmDelete) {
        axios.delete(`${apiUrl}/api/invoices/${id}`)
            .then(() => {
                setInvoices(invoices.filter(invoice => invoice._id !== id));
            })
            .catch(err => console.log(err));
    }
  };

  const handleCustomerClick = (customerId) => {
    // Navigate to the customer's invoices page
    navigate(`/customers/${customerId}/invoices`);
};

  return (
    <div className="invoice-list">
      <h1>Invoice List</h1>
      <div className="filter-form">
        <input
          type="text"
          name="company"
          value={filterValues.company}
          onChange={handleFilterChange}
          placeholder="Filter by Company"
        />
        <input
          type="text"
          name="invoiceNumber"
          value={filterValues.invoiceNumber}
          onChange={handleFilterChange}
          placeholder="Filter by Invoice Number"
        />
        <input
          type="text"
          name="clientName"
          value={filterValues.clientName}
          onChange={handleFilterChange}
          placeholder="Filter by Client Name"
        />
        <select
          name="paymentStatus"
          value={filterValues.paymentStatus}
          onChange={handleFilterChange}
        >
          <option value="">Filter by Payment Status</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Unpaid">Unpaid</option>
        </select>
        <label>Start Date:</label>
        <input
          type="date"
          name="startDate"
          value={filterValues.startDate}
          onChange={handleFilterChange}
        />
        <label>End Date:</label>
        <input
          type="date"
          name="endDate"
          value={filterValues.endDate}
          onChange={handleFilterChange}
        />
        <button onClick={handleClearFilters} style={{backgroundColor:"#1a936f", padding:'8px 20px', color:'white', border:'none', borderRadius:'4px'}}>Clear </button>
      </div>
      <div>
        {selectedInvoices.length > 0 && (
          <div style={{marginBottom:"10px"}}>
            <button style={{backgroundColor:"#ff0000", padding:'8px 20px', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}} onClick={handleDeleteSelectedInvoices}>Delete Selected Invoices</button>
          </div>
        )}
      </div>
      <table>
        <thead>
          <tr>
            <th style={{width:'30px'}}>Actions</th>
            <th onClick={() => handleSort('company')}>Company {renderSortArrow('company')}</th>
            <th onClick={() => handleSort('invoiceNumber')}>Invoice # {renderSortArrow('invoiceNumber')}</th>
            <th onClick={() => handleSort('clientName')}>Client {renderSortArrow('clientName')}</th>
            <th onClick={() => handleSort('date')}>Date {renderSortArrow('date')}</th>
            <th onClick={() => handleSort('paymentStatus')}>Payment Status {renderSortArrow('paymentStatus')}</th>
            <th onClick={() => handleSort('total')}>Total {renderSortArrow('total')}</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.map(invoice => (
            <tr key={invoice._id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedInvoices.includes(invoice._id)}
                  onChange={() => toggleInvoiceSelection(invoice._id)}
                />
              </td>
              <td><Link to={`/invoices/${invoice._id}`} className="invoice-item-link">{invoice.company}</Link></td>
              <td><Link to={`/invoices/${invoice._id}`} className="invoice-item-link">{invoice.invoiceNumber}</Link></td>
              <td>
                {invoice.customer?<Link to={`/customers/${invoice?.customer}/invoices`}>{invoice.clientName}</Link>:invoice.clientName}
              </td>
              <td>{formatDate(invoice.date)}</td>
              <td>{invoice.paymentStatus}</td>
              <td> {`${getCurrencySymbol(invoice.currency)} ${invoice.total}`}</td>                
              <td><button onClick={() => handleDeleteInvoice(invoice._id)} className="delete-button">Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
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

export default InvoiceList;
