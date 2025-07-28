import React, { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { TextField, Button, Container, Typography, Box, Alert } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { passwordSchema } from '../../utils/validators';

const PasswordUpdateSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required')
});

const PasswordUpdate = () => {
  const { updatePassword } = useAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const result = await updatePassword(values.currentPassword, values.newPassword);
      if (result.success) {
        setSuccess(true);
        setError('');
        resetForm();
      } else {
        setError(result.message || 'Password update failed');
        setSuccess(false);
      }
    } catch (err) {
      setError('An error occurred during password update');
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Update Password
        </Typography>
        {success && (
          <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
            Password updated successfully!
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        <Formik
          initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
          validationSchema={PasswordUpdateSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <Field
                as={TextField}
                margin="normal"
                fullWidth
                name="currentPassword"
                label="Current Password"
                type="password"
                error={touched.currentPassword && Boolean(errors.currentPassword)}
                helperText={touched.currentPassword && errors.currentPassword}
              />
              <Field
                as={TextField}
                margin="normal"
                fullWidth
                name="newPassword"
                label="New Password"
                type="password"
                error={touched.newPassword && Boolean(errors.newPassword)}
                helperText={touched.newPassword && errors.newPassword}
              />
              <Field
                as={TextField}
                margin="normal"
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                helperText={touched.confirmPassword && errors.confirmPassword}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
              >
                Update Password
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default PasswordUpdate;