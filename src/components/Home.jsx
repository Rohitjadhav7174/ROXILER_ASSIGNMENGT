import React from 'react';
import { useAuth } from '../Context/AuthContext';
import { Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', mt: 10 }}>
      <Typography variant="h3" gutterBottom>
        Welcome to Store Rating System
      </Typography>
      {user ? (
        <Typography variant="h5">
          Welcome back, {user.name} ({user.role})
        </Typography>
      ) : (
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            sx={{ mr: 2 }}
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/register')}
          >
            Register
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Home;