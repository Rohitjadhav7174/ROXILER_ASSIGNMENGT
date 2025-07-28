import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getDashboardData = async () => {
  const response = await axios.get(`${API_URL}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response.data;
};

const getUsers = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/admin/users`, {
    params: filters,
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response.data;
};

const getStores = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/admin/stores`, {
    params: filters,
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response.data;
};

const addUser = async (userData) => {
  const response = await axios.post(`${API_URL}/admin/users`, userData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response.data;
};

const addStore = async (storeData) => {
  const response = await axios.post(`${API_URL}/admin/stores`, storeData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response.data;
};

export default {
  getDashboardData,
  getUsers,
  getStores,
  addUser,
  addStore
};