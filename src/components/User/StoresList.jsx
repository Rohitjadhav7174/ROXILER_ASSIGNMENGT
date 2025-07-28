import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Box,
  Typography,
  TableSortLabel,
  IconButton,
  Rating,
  CircularProgress
} from '@mui/material';
import { FilterList } from '@mui/icons-material';
import userService from '../../services/user';

const StoresList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    address: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc'
  });

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await userService.getStores({
          ...filters,
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction
        });
        setStores(data);
      } catch (err) {
        setError('Failed to fetch stores');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [filters, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = async (storeId, newValue) => {
    try {
      await userService.submitRating(storeId, newValue);
      // Update local state to reflect the change
      setStores(prev => prev.map(store => {
        if (store.id === storeId) {
          return { ...store, user_rating: newValue };
        }
        return store;
      }));
    } catch (err) {
      setError('Failed to submit rating');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Stores
      </Typography>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Box display="flex" gap={2}>
          <TextField
            label="Search by Name"
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
            size="small"
          />
          <TextField
            label="Search by Address"
            name="address"
            value={filters.address}
            onChange={handleFilterChange}
            size="small"
          />
          <IconButton>
            <FilterList />
          </IconButton>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'name'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>Address</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'overall_rating'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('overall_rating')}
                >
                  Overall Rating
                </TableSortLabel>
              </TableCell>
              <TableCell>Your Rating</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stores.map((store) => (
              <TableRow key={store.id}>
                <TableCell>{store.name}</TableCell>
                <TableCell>{store.address}</TableCell>
                <TableCell>
                  <Rating value={store.overall_rating || 0} precision={0.5} readOnly />
                  <Typography variant="caption">
                    ({store.overall_rating?.toFixed(1) || '0'})
                  </Typography>
                </TableCell>
                <TableCell>
                  <Rating
                    value={store.user_rating || 0}
                    precision={1}
                    onChange={(event, newValue) => handleRatingChange(store.id, newValue)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StoresList;