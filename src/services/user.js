import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getStores = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/stores`, {
    params: filters,
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response.data;
};

const submitRating = async (storeId, rating) => {
  const response = await axios.post(`${API_URL}/ratings`, { storeId, rating }, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response.data;
};

export default {
  getStores,
  submitRating
};