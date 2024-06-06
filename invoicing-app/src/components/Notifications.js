import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../Notifications.css';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../functions/apiUrl';

const Notifications = () => {
    const [pendingInvoices, setPendingInvoices] = useState([]);
    const [nonRepeatingCustomers, setNonRepeatingCustomers] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        if(user){
            axios.get(`${apiUrl}/api/notifications`)
            .then(res => {
                setPendingInvoices(res.data.pendingInvoices);
                setNonRepeatingCustomers(res.data.nonRepeatingCustomers);
            })
            .catch(err => console.log(err));}
    }, []);

    const markAsRead = async (id, type) => {
        try {
          await axios.patch(`${apiUrl}/api/notifications/${id}/read`);
          
        //   if(type="pendingInvoices"){
        //   setPendingInvoices((prevNotifications) =>
        //     prevNotifications.map((notification) =>
        //       notification._id === id ? { ...notification, read: true } : notification
        //     )
        //   );
        //   } else{
        //   setNonRepeatingCustomers((prevNotifications) =>
        //     prevNotifications.map((notification) =>
        //       notification._id === id ? { ...notification, read: true } : notification
        //     )
        //   );
        // }
        } catch (err) {
          console.error(err);
        }
      };
      
    return (
        <div className="notifications-page">
            <h1>Notifications</h1>
            <div className="notification-category">
                <h2>Invoices Pending</h2>
                {pendingInvoices?.length === 0 && <p>No pending invoices</p>}
                {pendingInvoices?.map(notification => (
                    <div key={notification._id} className={`notification ${notification.isRead ? 'read' : 'unread'}`}>
                        <p>{notification.message}</p>
                        {!notification.isRead && (
                      <button onClick={() => markAsRead(notification._id)}>Mark as Read</button>
                    )}
                        <Link to={`/invoices/${notification.invoiceId}`}>View Invoice</Link>
                    </div>
                ))}
            </div>
            <div className="notification-category">
                <h2>Non-Repeating Customers</h2>
                {nonRepeatingCustomers?.length === 0 && <p>No non-repeating customers</p>}
                {nonRepeatingCustomers?.map(notification => (
                    <div key={notification._id} className={`notification ${notification.isRead ? 'read' : 'unread'}`}>
                        <p>{notification.message}</p>
                        {!notification.isRead && (
                      <button onClick={() => markAsRead(notification._id)}>Mark as Read</button>
                    )}
                        <Link to={`/customers/${notification.customerId}/invoices`}>View Customer</Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
