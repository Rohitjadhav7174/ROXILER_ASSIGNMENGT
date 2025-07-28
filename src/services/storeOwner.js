import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getDashboardData = async () => {
  const response = await axios.get(`${API_URL}/store-owner/dashboard`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response.data;
};

export default {
  getDashboardData
};