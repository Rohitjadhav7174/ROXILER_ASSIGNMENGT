import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Rating
} from '@mui/material';
import storeOwnerService from '../../services/storeOwner';

const StoreOwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await storeOwnerService.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!dashboardData) return null;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Store Owner Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Store Information
              </Typography>
              <Typography variant="h6">{dashboardData.store.name}</Typography>
              <Typography>{dashboardData.store.address}</Typography>
              <Typography>{dashboardData.store.email}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Average Rating
              </Typography>
              <Box display="flex" alignItems="center" mt={2}>
                <Rating value={dashboardData.averageRating} precision={0.5} readOnly />
                <Typography variant="h4" sx={{ ml: 2 }}>
                  {dashboardData.averageRating.toFixed(1)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Typography variant="h5" gutterBottom>
        Recent Ratings
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dashboardData.ratingUsers.map((rating) => (
              <TableRow key={`${rating.email}-${rating.created_at}`}>
                <TableCell>{rating.name}</TableCell>
                <TableCell>{rating.email}</TableCell>
                <TableCell>
                  <Rating value={rating.rating} precision={1} readOnly />
                </TableCell>
                <TableCell>
                  {new Date(rating.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StoreOwnerDashboard;