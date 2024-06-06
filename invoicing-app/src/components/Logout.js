import React, { useState, useContext, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import setAuthToken from '../functions/setAuthToken';

const Logout = () => {
    const { logout } = useAuth();    
    const navigate = useNavigate();
    
    const handleLogout = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/logout');
            logout(res.data);
            console.log(res.data)
            // localStorage.setItem('authToken', res.data.token);
            // setAuthToken(res.data.token)            
            navigate('/login');
        } catch (err) {
            console.error('Login failed', err);
        }
    };

    handleLogout();

    return (
        <div>
            <h1>Logging out...</h1>           
        </div>
    );
};

export default Logout;
