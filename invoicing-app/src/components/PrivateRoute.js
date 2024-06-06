import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Assuming you have an AuthContext to provide authentication state

const PrivateRoute = () => {
  const { user } = useAuth(); // useAuth should return the authentication state
  const location = useLocation();

  const token = localStorage.getItem('authToken');
// console.log(user)
// if(token && !user){
// setUser({token})
// }
if (!user) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return <Outlet />;
};

export default PrivateRoute;
