import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const verifyToken = async (token) => {
  const response = await api.get('/auth/verify', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.user;
};

export const updatePassword = async (currentPassword, newPassword, userId) => {
  const response = await api.put('/users/password', 
    { currentPassword, newPassword }
  );
  return response.data;
};

const authService = {
  login,
  register,
  verifyToken,
  updatePassword
};

export default authService;