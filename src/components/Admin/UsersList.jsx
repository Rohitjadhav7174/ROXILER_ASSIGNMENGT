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

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc'
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminService.getUsers({
          ...filters,
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction
        });
        setUsers(data);
      } catch (err) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
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
        Users
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
            <MenuItem>
              <TextField
                label="Role"
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                size="small"
                select
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="normal_user">Normal User</MenuItem>
                <MenuItem value="store_owner">Store Owner</MenuItem>
              </TextField>
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
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'email'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('email')}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell>Address</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'role'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('role')}
                >
                  Role
                </TableSortLabel>
              </TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.address}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.rating?.toFixed(1) || 'N/A'}</TableCell>
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

export default UsersList;