import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../NotificationsDropdown.css';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../functions/apiUrl';

const NotificationsDropdown = () => {
    const [pendingInvoices, setPendingInvoices] = useState([]);
    const [nonRepeatingCustomers, setNonRepeatingCustomers] = useState([]);
    const { user } = useAuth();
    const[unreadNotifications, setUnreadNotifications] = useState(0);
    useEffect(() => {
       if(user){
         axios.get(`${apiUrl}/api/notifications`)
            .then(res => {
                setPendingInvoices(res.data.pendingInvoices);
                setNonRepeatingCustomers(res.data.nonRepeatingCustomers);
                
                
            })
            .catch(err => console.log(err));}
    }, []);

    useEffect(() => {
        setUnreadNotifications(0);
        console.log(unreadNotifications)
        let unread = 0;
        pendingInvoices.forEach((notification)=>{
            console.log(notification)
            if(notification.isRead===false) unread +=1;
        })
        console.log(unreadNotifications)
        
        nonRepeatingCustomers.forEach((notification)=>{
            if(notification.isRead===false) unread +=1;
        })
        setUnreadNotifications(unread)
        console.log(unreadNotifications)
    }, [pendingInvoices, nonRepeatingCustomers])
    

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

    if(pendingInvoices.length==0 && nonRepeatingCustomers.length==0){
        return(<></>)
    }
    return (
        
            <div className="notifications-dropdown">
             
             <button class="dropdown-button">
             <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"/>

                <i class="fas fa-bell"></i>
                <span class="badge">{unreadNotifications}</span>
            </button>
            <div className="dropdown-content">
                {pendingInvoices.length>0 && <>
                <h3>Invoices Pending</h3>
                {pendingInvoices?.slice(0, 3).map(notification => (
                    <div key={notification._id} className={`notification-item ${notification.isRead ? 'read' : ''}`}>
                    <p>{notification.message}</p>
                    {!notification.isRead && (
                      <button onClick={() => markAsRead(notification._id)}>Mark as Read</button>
                    )}
                    <Link to={`/invoices/${notification.invoiceId}`}>View Invoice</Link>
                  </div>
                ))}
                </>}
                {nonRepeatingCustomers.length>0 && <>
                <h3>Non-Repeating Customers</h3>
                {nonRepeatingCustomers?.slice(0, 2).map(notification => (
                     <div key={notification._id} className={`notification-item ${notification.isRead ? 'read' : ''}`}>
                     <p>{notification.message}</p>
                     {!notification.isRead && (
                       <button onClick={() => markAsRead(notification._id)}>Mark as Read</button>
                     )}
                        <Link to={`/customers/${notification.customerId}/invoices`}>View Customer</Link>
                   </div>
                ))}
                </>}
                <Link to="/notifications" className="view-all-link">View All</Link>
            </div>
           
        </div>
        
    );
};

export default NotificationsDropdown;
