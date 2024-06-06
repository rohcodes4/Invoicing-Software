// App.js

import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Logout from './components/Logout';
import Register from './components/Register';
import InvoiceList from './components/InvoiceList';
import InvoiceDetails from './components/InvoiceDetails';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import NewInvoice from './components/NewInvoice'; 
import Customers from './components/Customer';
import CustomerInvoices from './components/CustomerInvoices';
import Notifications from './components/Notifications';
import ProfilePage from './components/ProfilePage';

function App() {
  return (
    <AuthProvider>
    <Router>
      <Header/>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/logout" element={<Logout/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/" element={<PrivateRoute />}>
          <Route exact path="/" element={<Dashboard />} />
          <Route exact path="/invoices" element={<InvoiceList />} />
          <Route exact path="/invoices/new" element={<NewInvoice />} /> 
          <Route exact path="/invoices/:id" element={<InvoiceDetails />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:customerId/invoices" element={<CustomerInvoices />} />
          <Route path="/customers/:customerId/new" element={<NewInvoice/>} />
          <Route path="/notifications" element={<Notifications/>} />
          <Route path="/profile" element={<ProfilePage/>} />
        </Route>
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
