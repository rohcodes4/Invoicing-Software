import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { validateEmail } from "./ValidateEmail";
import "../Invoices.css";
import Select from "react-select";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../functions/apiUrl";
import currencyCodes from "currency-codes";
import currencyData from "currency-codes/data";
import getCurrencySymbol from 'currency-symbols';

const NewInvoice = () => {
  const { customerId } = useParams();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [clientName, setClientName] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [advancePayment, setAdvancePayment] = useState(0);
  const [taxCategory, setTaxCategory] = useState(""); // Selected tax category
  const [customTaxRate, setCustomTaxRate] = useState(0); // Custom tax rate
  const [calculateTaxAbove, setCalculateTaxAbove] = useState(false); // Checkbox state
  const [taxRate, setTaxRate] = useState(0);
  const [tax, setTax] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('amount'); // Discount type (amount or percent)
  const [lineItems, setLineItems] = useState([
    { description: "", quantity: 1, unitPrice: 1000 },
  ]);
  const [notes, setNotes] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(getISTDate());
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [emailError, setEmailError] = useState("");
  const [reminders, setReminders] = useState([{ date: '', message: '' }]);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (customerId == undefined) return;
    // Fetch selected customer
    axios
      .get(`${apiUrl}/api/customers/${customerId}`)
      .then((res) => {
        setSelectedCustomer({
          value: res.data._id,
          label: `${res.data.name} - ${res.data.email}`,
        });
        console.log(res.data);
        setClientName(res.data.name);
        setCompany(res.data.company);
        setAddress(res.data.address);
        setEmail(res.data.email);
        setPhone(res.data.phone);
      })
      .catch((err) => console.log(err));
  }, [customerId]);

  useEffect(() => {}, [selectedCustomer]);

  useEffect(() => {
    if (calculateTaxAbove) {
      setTax(calculateTax(taxRate));
    } else {
      setTax(0);
    }
  }, [taxRate, calculateTaxAbove, lineItems, discount, discountType]);

  useEffect(() => {
    console.log("Tax " + tax);
  }, [tax]);

  useEffect(() => {
    // Fetch existing customers from the backend
    axios
      .get(`${apiUrl}/api/customers`)
      .then((res) => setCustomers(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleCreateInvoice = () => {
    calculateTax(taxRate);
    console.log(lineItems);
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    } else {
      setEmailError("");
    }

    

    // Calculate subtotal
    const subtotal = lineItems.reduce((acc, item) => {
      const price = parseFloat(item.unitPrice);
      const quantity = parseFloat(item.quantity);
      return !isNaN(price) ? acc + price * quantity : acc;
    }, 0);

    setSubtotal(subtotal)

    // Calculate discount
    const discountValue = discountType === 'percent' ? (subtotal * discount) / 100 : discount;

    // Calculate total
    const total = subtotal - discountValue + tax;
setTotal(total)
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
      discount: parseFloat(discountValue),
      lineItems,
      total,
      notes,
      date: invoiceDate,
      paymentStatus,
      customer: selectedCustomer.value, // Send customer ID
      user: user._id,
      reminders  // Add this line to include reminders

    };

    // Send POST request to create invoice
    axios
      .post(`${apiUrl}/api/invoices`, data)
      .then((res) => {
        // Reset form fields
        resetFormFields();
        // Navigate to the InvoiceDetails page of the newly created invoice
        navigate(`/invoices/${res.data._id}`);
      })
      .catch((err) => console.log(err));
  };

  const handleSelectCustomer = (selectedOption) => {
    setSelectedCustomer(selectedOption);
    if (selectedOption) {
      // Fetch customer details from the backend based on selected customer ID
      axios
        .get(`${apiUrl}/api/customers/${selectedOption.value}`)
        .then((res) => {
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
        .catch((err) => console.log(err));
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
    axios
      .post(`${apiUrl}/api/customers`, data)
      .then((res) => {
        // Update customers state with the new customer
        setCustomers([...customers, res.data]);
        // Set the newly created customer as selected
        setSelectedCustomer({
          value: res.data._id,
          label: `${res.data.name} - ${res.data.email}`,
        });
      })
      .catch((err) => console.log(err));
  };

  // Option format for React Select dropdown
  const formatOption = (customer) => ({
    value: customer._id,
    label: `${customer.name} - ${customer.email} - Lifetime Value: ${customer.totalOrderValue}`,
  });

  const resetFormFields = () => {
    setClientName("");
    setCompany("");
    setAddress("");
    setPhone("");
    setEmail("");
    setCurrency("INR");
    setAdvancePayment(0);
    setTax(0);
    setDiscount(0);
    setLineItems([{ description: "", quantity: 1, unitPrice: 1 }]);
    setNotes("");
    setInvoiceDate(getISTDate());
    setPaymentStatus("");
  };

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: "", quantity: 1, unitPrice: 1000 },
    ]);
  };

  const handleRemoveLineItem = (index) => {
    const updatedLineItems = [...lineItems];
    updatedLineItems.splice(index, 1);
    setLineItems(updatedLineItems);
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedLineItems = [...lineItems];
    updatedLineItems[index][field] = value;
    console.log(updatedLineItems);
    setLineItems(updatedLineItems);
    if (field == "unitPrice" || field == "quantity") {
      calculateTax(taxRate);
    }
  };

  function getISTDate() {
    const date = new Date();
    const ISTOffset = 330;
    const ISTTime = new Date(date.getTime() + ISTOffset * 60000);
    return ISTTime.toISOString().split("T")[0];
  }

  const colourStyles = {
    control: (styles) => ({ ...styles, color: "#333" }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      //   const color = chroma(data.color);
      return {
        ...styles,
        backgroundColor: isSelected
          ? "#0b4e3a"
          : isFocused
          ? "#1a936f"
          : "#fff",
        color: isSelected ? "#fff" : isFocused ? "#fff" : "#333",
        cursor: isDisabled ? "not-allowed" : "default",
      };
    },
  };

  const handleCurrencyChange = (event) => {
    console.log(event.target.value);
    setCurrency(event.target.value);
  };

  const calculateTax = (taxRate = taxRate) => {

     
    // Calculate subtotal
    const subtotal = lineItems.reduce((acc, item) => {
      const price = parseFloat(item.unitPrice);
      const quantity = parseFloat(item.quantity);
      return !isNaN(price) ? acc + price * quantity : acc;
    }, 0);

    setSubtotal(subtotal)

     // Calculate discount
     const discountValue = discountType === 'percent' ? (subtotal * discount) / 100 : discount;

    // Calculate total
    const totalAmount = subtotal - discountValue;

    // Apply tax rate
    const taxAmount = (totalAmount * taxRate) / 100;
    setTotal(totalAmount + taxAmount)

    setTax(taxAmount);
    // Return total amount including tax
    return taxAmount;
  };

  const handleTaxCategoryChange = (event) => {
    const selectedCategory = event.target.value;
    setTaxCategory(selectedCategory);
    if (selectedCategory === "custom") {
      setTaxRate(customTaxRate);
    } else {
      const taxRates = {
        GST: 18,
        VAT: 12,
        "Service Tax": 15,
        // add more categories as needed
      };
      setTaxRate(taxRates[selectedCategory] || 0);
    }
  };

  const handleCustomTaxRateChange = (event) => {
    const rate = parseFloat(event.target.value);
    setCustomTaxRate(rate);
    if (taxCategory === "custom") {
      setTaxRate(rate);
    }
  };

  const handleCalculateTaxAboveChange = (event) => {
    setCalculateTaxAbove(event.target.checked);
  };

  const handleAddReminder = () => {
    setReminders([...reminders, { date: '', message: '' }]);
};

const handleRemoveReminder = (index) => {
    const updatedReminders = [...reminders];
    updatedReminders.splice(index, 1);
    setReminders(updatedReminders);
};

const handleReminderChange = (index, field, value) => {
    const updatedReminders = [...reminders];
    updatedReminders[index][field] = value;
    setReminders(updatedReminders);
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
        {selectedCustomer && (
          <button
            onClick={() => setSelectedCustomer("")}
            className="invoices__addLineItem"
          >
            Add New Customer
          </button>
        )}
        {/* Render client details only if no customer is selected */}
        {!selectedCustomer && (
          <>
            <label htmlFor="clientName">Client Name:</label>
            <input
              type="text"
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Client Name"
              className="invoices__input"
            />
            <label htmlFor="company">Company:</label>
            <input
              type="text"
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company"
              className="invoices__input"
            />
            <label htmlFor="address">Address:</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
              className="invoices__input"
            />
            <label htmlFor="phone">Phone:</label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className="invoices__input"
            />
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="invoices__input"
            />
            {emailError && <p className="invoices__error">{emailError}</p>}
          </>
        )}
        {!selectedCustomer && (
          <button onClick={handleNewCustomer} className="invoices__addLineItem">
            Create New Customer
          </button>
        )}
        <br />
        <br />
        {selectedCustomer && (
          <>
            <label htmlFor="currency">Currency:</label>
            <select
              value={currency}
              onChange={handleCurrencyChange}
              className="invoices__input invoices__currency"
            >
              <option value="INR">INR (Indian Rupee)</option>
              <option value="USD">USD (US Dollar)</option>
              {currencyData.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {`${currency.code} (${currency.currency})`}
                </option>
              ))}
            </select>
            <br />
            <label htmlFor="advancePayment">Advance Payment:</label>
            <input
              style={{ marginLeft: "5px" }}
              type="number"
              id="advancePayment"
              value={advancePayment}
              onChange={(e) => setAdvancePayment(e.target.value)}
              placeholder="Advance Payment"
              className="invoices__input"
            />
            <div className="invoices__discount">
            <label htmlFor="discount">Discount:</label>
            <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="invoices__input">
                        <option value="amount">Amount Off</option>
                        <option value="percent">Percent Off</option>
                    </select>
                    <input
                        type="number"
                        className="invoices__input"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                    />                    
                </div>
            <div>
              <label htmlFor="paymentStatus">Payment Status:</label>
              <select
                id="paymentStatus"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="invoices__input"
              >
                {/* <option value="">Select Payment Status</option> */}
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partially Paid">Partially Paid</option>
              </select>
            </div>
            <div>
              <label htmlFor="invoiceDate">Invoice Date:</label>
              <input
                type="date"
                id="invoiceDate"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="invoices__input"
              />
            </div>
            <div className="invoices__reminders">
    <label>Reminders:</label>
    {reminders.map((reminder, index) => (
        <div key={index} className="invoices__reminder">
            <input
                type="date"
                className="invoices__input"
                value={reminder.date}
                onChange={(e) => handleReminderChange(index, 'date', e.target.value)}
            />
            <input
                type="text"
                className="invoices__input"
                placeholder="Reminder Message"
                value={reminder.message}
                onChange={(e) => handleReminderChange(index, 'message', e.target.value)}
            />
            <button className="invoices__removeReminder" onClick={() => handleRemoveReminder(index)}>Remove</button>
        </div>
    ))}
    <button className="invoices__addReminder" onClick={handleAddReminder}>Add Reminder</button>
</div>
            <div className="invoices__lineItems">
              <h3 style={{ color: "#fff" }}>Line Items</h3>
              {lineItems.map((item, index) => (
                <div key={index} className="invoices__lineItem">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      handleLineItemChange(index, "description", e.target.value)
                    }
                    placeholder="Description"
                    className="invoices__input invoices__lineItemInput"
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={(e) =>
                      handleLineItemChange(
                        index,
                        "quantity",
                        parseInt(e.target.value)
                      )
                    }
                    className="invoices__input invoices__lineItemInput"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleLineItemChange(index, "unitPrice", e.target.value)
                    }
                    className="invoices__input invoices__lineItemInput"
                  />
                  <button
                    style={{ marginTop: 0, backgroundColor:'#ee0000' }}
                    className="invoices__addLineItem invoices__lineItem"
                    onClick={() => handleRemoveLineItem(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddLineItem}
                className="invoices__addLineItem"
              >
                Add Line Item
              </button>
            </div>
            <div className="invoices__taxSection">
              <label>
                <input
                  type="checkbox"
                  checked={calculateTaxAbove}
                  onChange={handleCalculateTaxAboveChange}
                />
                Calculate tax above invoice value
              </label>
            </div>
            {calculateTaxAbove && (
              <>
                <div className="invoices__taxSection">
                  <label>Tax Category:</label>
                  <select
                    value={taxCategory}
                    onChange={handleTaxCategoryChange}
                  >
                    <option value="">Select Tax Category</option>
                    <option value="GST">GST (18%)</option>
                    <option value="VAT">VAT (12%)</option>
                    <option value="Service Tax">Service Tax (15%)</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                {taxCategory === "custom" && (
                  <div>
                    <label>Custom Tax Rate (%):</label>
                    <input
                      type="number"
                      value={customTaxRate}
                      onChange={handleCustomTaxRateChange}
                    />
                  </div>
                )}
                <br />
               
                <br />
              </>
            )}

                <div>Subtotal: {subtotal}</div>
                <div>Discount: {discountType=="amount"?`${getCurrencySymbol(currency)}`:''} {discount} {discountType=="percent"?`% = ${getCurrencySymbol(currency)} ${subtotal * discount/100} `:``}</div>
                <div>Tax Value: {tax}</div>
                <div>Total: {total}</div>
                <br />

            <label htmlFor="notes">Notes:</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes"
              className="invoices__input"
            />
            <button
              onClick={handleCreateInvoice}
              className="invoices__createButton"
            >
              Create
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default NewInvoice;
