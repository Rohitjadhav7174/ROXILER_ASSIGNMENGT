import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { passwordSchema } from '../../utils/validators';
import adminService from '../../services/admin';

const AddUserSchema = Yup.object().shape({
  name: Yup.string()
    .min(20, 'Name must be at least 20 characters')
    .max(60, 'Name must be at most 60 characters')
    .required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  address: Yup.string()
    .max(400, 'Address must be at most 400 characters')
    .required('Required'),
  password: passwordSchema,
  role: Yup.string().required('Required')
});

const AddUser = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await adminService.addUser(values);
      setSuccess(true);
      setError('');
      resetForm();
      setTimeout(() => navigate('/admin/users'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to add user');
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Add New User
        </Typography>
        {success && (
          <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
            User added successfully!
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        <Formik
          initialValues={{ name: '', email: '', address: '', password: '', role: '' }}
          validationSchema={AddUserSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched, values, handleChange }) => (
            <Form>
              <Field
                as={TextField}
                margin="normal"
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />
              <Field
                as={TextField}
                margin="normal"
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
              />
              <Field
                as={TextField}
                margin="normal"
                fullWidth
                id="address"
                label="Address"
                name="address"
                autoComplete="address"
                multiline
                rows={3}
                error={touched.address && Boolean(errors.address)}
                helperText={touched.address && errors.address}
              />
              <Field
                as={TextField}
                margin="normal"
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="role-label">Role</InputLabel>
                <Field
                  as={Select}
                  labelId="role-label"
                  id="role"
                  name="role"
                  label="Role"
                  value={values.role}
                  onChange={handleChange}
                  error={touched.role && Boolean(errors.role)}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="normal_user">Normal User</MenuItem>
                  <MenuItem value="store_owner">Store Owner</MenuItem>
                </Field>
                {touched.role && errors.role && (
                  <Typography variant="caption" color="error">
                    {errors.role}
                  </Typography>
                )}
              </FormControl>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
              >
                Add User
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default AddUser;