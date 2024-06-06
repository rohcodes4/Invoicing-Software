import React, { useState, useContext, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import setAuthToken from '../functions/setAuthToken';
import { apiUrl } from '../functions/apiUrl';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();    
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            const token = localStorage.getItem('authToken')
            if(token){
                login({token})
                setAuthToken(token)
                navigate(-1)
            }
         }, 1);     
    }, [])
    
 
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${apiUrl}/api/login`, { username, password });
            login(res.data);
            console.log(res.data)
            localStorage.setItem('authToken', res.data.token);
            setAuthToken(res.data.token)            
            navigate('/');
        } catch (err) {
            console.error('Login failed', err);
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit">Login</button>
            </form>
            <br/>
            <Link to="/register">Register</Link>
        </div>
        
    );
};

export default Login;
