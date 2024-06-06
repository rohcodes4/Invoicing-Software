import React, {useState} from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
  } from "react-router-dom";
import '../Header.css'; 
import NotificationsDropdown from './NotificationsDropdown';
import { useAuth } from '../context/AuthContext';

const Header = () => {

  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="header">
      <div className="logo">      
        <Link to="/" className="nav-link">ROHCODES</Link>
      </div>
      {user && <div className="navigation nav">
      <Link to="/" className="nav-link">Home</Link>
      <Link to="/invoices" className="nav-link">Invoices</Link>
      <Link to="/customers" className="nav-link">Customers</Link>
      <Link to="/invoices/new" className="nav-link">Create New Invoice</Link>
      <NotificationsDropdown/>
      {user && (
          <div className="dropdown">
             <button className="dropdown-button">
                <i className="fas fa-user"></i>
            </button>
            <div className="dropdown-menu">
              <Link to="/profile">Profile</Link>
              <Link to="/logout">Logout</Link>
            </div>
          </div>
        )}
      </div>}
    </div>
  );
};

export default Header;
