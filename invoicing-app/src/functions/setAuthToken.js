import axios from 'axios';

// Function to set token in Axios headers
const setAuthToken = (token) => {
  if (token) {
    // Apply token to every request header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Delete token from headers if not provided
    delete axios.defaults.headers.common['Authorization'];
  }
};

export default setAuthToken;
