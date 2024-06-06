import React, { createContext, useContext, useEffect, useState } from 'react';
import setAuthToken from '../functions/setAuthToken';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const token = localStorage.getItem('authToken')
  const [user, setUser] = useState(null);

//   console.log(user)
//   console.log(token)
  useEffect(() => {
  if(token!=null){
    // setUser({token})
  }
}, [token])

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    setAuthToken();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
