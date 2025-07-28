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
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { FilterList, MoreVert } from '@mui/icons-material';
import adminService from '../../services/admin';

const StoresList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc'
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await adminService.getStores({
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

  const handleFilterMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setFilterOpen(true);
  };

  const handleFilterMenuClose = () => {
    setAnchorEl(null);
    setFilterOpen(false);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Stores
      </Typography>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Box>
          <IconButton onClick={handleFilterMenuOpen}>
            <FilterList />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={filterOpen}
            onClose={handleFilterMenuClose}
          >
            <MenuItem>
              <TextField
                label="Name"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                size="small"
              />
            </MenuItem>
            <MenuItem>
              <TextField
                label="Email"
                name="email"
                value={filters.email}
                onChange={handleFilterChange}
                size="small"
              />
            </MenuItem>
            <MenuItem>
              <TextField
                label="Address"
                name="address"
                value={filters.address}
                onChange={handleFilterChange}
                size="small"
              />
            </MenuItem>
          </Menu>
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
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'rating'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('rating')}
                >
                  Rating
                </TableSortLabel>
              </TableCell>
              <TableCell>Total Ratings</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stores.map((store) => (
              <TableRow key={store.id}>
                <TableCell>{store.name}</TableCell>
                <TableCell>{store.email}</TableCell>
                <TableCell>{store.address}</TableCell>
                <TableCell>{store.rating?.toFixed(1) || 'N/A'}</TableCell>
                <TableCell>{store.total_ratings || 0}</TableCell>
                <TableCell>
                  <IconButton>
                    <MoreVert />
                  </IconButton>
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