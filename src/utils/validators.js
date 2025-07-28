import * as Yup from 'yup';

export const passwordSchema = Yup.string()
  .min(8, 'Password must be at least 8 characters')
  .max(16, 'Password must be at most 16 characters')
  .matches(
    /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/,
    'Password must contain at least one uppercase letter and one special character'
  )
  .required('Required');

export const nameSchema = Yup.string()
  .min(20, 'Name must be at least 20 characters')
  .max(60, 'Name must be at most 60 characters')
  .required('Required');

export const addressSchema = Yup.string()
  .max(400, 'Address must be at most 400 characters')
  .required('Required');

export const emailSchema = Yup.string()
  .email('Invalid email')
  .required('Required');