import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Store as StoreIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <Drawer variant="permanent" anchor="left">
      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        
        {user?.role === 'admin' && (
          <>
            <ListItem button component={Link} to="/admin/dashboard">
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button component={Link} to="/admin/users">
              <ListItemIcon><PeopleIcon /></ListItemIcon>
              <ListItemText primary="Users" />
            </ListItem>
            <ListItem button component={Link} to="/admin/stores">
              <ListItemIcon><StoreIcon /></ListItemIcon>
              <ListItemText primary="Stores" />
            </ListItem>
            <ListItem button component={Link} to="/admin/add-user">
              <ListItemIcon><AddIcon /></ListItemIcon>
              <ListItemText primary="Add User" />
            </ListItem>
            <ListItem button component={Link} to="/admin/add-store">
              <ListItemIcon><AddIcon /></ListItemIcon>
              <ListItemText primary="Add Store" />
            </ListItem>
          </>
        )}
        
        {user?.role === 'normal_user' && (
          <ListItem button component={Link} to="/user/stores">
            <ListItemIcon><StoreIcon /></ListItemIcon>
            <ListItemText primary="Stores" />
          </ListItem>
        )}
        
        {user?.role === 'store_owner' && (
          <ListItem button component={Link} to="/store-owner/dashboard">
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
        )}
      </List>
    </Drawer>
  );
};

export default Sidebar;