import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { passwordSchema } from '../../utils/validators';
import adminService from '../../services/admin';

const AddStoreSchema = Yup.object().shape({
  name: Yup.string()
    .min(20, 'Name must be at least 20 characters')
    .max(60, 'Name must be at most 60 characters')
    .required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  address: Yup.string()
    .max(400, 'Address must be at most 400 characters')
    .required('Required'),
  ownerName: Yup.string()
    .min(20, 'Name must be at least 20 characters')
    .max(60, 'Name must be at most 60 characters')
    .required('Required'),
  ownerPassword: passwordSchema
});

const AddStore = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await adminService.addStore(values);
      setSuccess(true);
      setError('');
      resetForm();
      setTimeout(() => navigate('/admin/stores'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to add store');
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Add New Store
        </Typography>
        {success && (
          <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
            Store added successfully!
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        <Formik
          initialValues={{ 
            name: '', 
            email: '', 
            address: '', 
            ownerName: '', 
            ownerPassword: '' 
          }}
          validationSchema={AddStoreSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Store Information
              </Typography>
              <Field
                as={TextField}
                margin="normal"
                fullWidth
                id="name"
                label="Store Name"
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
                label="Store Email"
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
                label="Store Address"
                name="address"
                autoComplete="address"
                multiline
                rows={3}
                error={touched.address && Boolean(errors.address)}
                helperText={touched.address && errors.address}
              />
              
              <Typography variant="h6" sx={{ mt: 2 }}>
                Owner Information
              </Typography>
              <Field
                as={TextField}
                margin="normal"
                fullWidth
                id="ownerName"
                label="Owner Name"
                name="ownerName"
                autoComplete="name"
                error={touched.ownerName && Boolean(errors.ownerName)}
                helperText={touched.ownerName && errors.ownerName}
              />
              <Field
                as={TextField}
                margin="normal"
                fullWidth
                name="ownerPassword"
                label="Owner Password"
                type="password"
                id="ownerPassword"
                autoComplete="new-password"
                error={touched.ownerPassword && Boolean(errors.ownerPassword)}
                helperText={touched.ownerPassword && errors.ownerPassword}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
              >
                Add Store
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default AddStore;