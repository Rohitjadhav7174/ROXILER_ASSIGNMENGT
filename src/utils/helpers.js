export const validatePassword = (password) => {
  const { minLength, maxLength, requireUppercase, requireSpecialChar } = PASSWORD_REQUIREMENTS;
  if (password.length < minLength || password.length > maxLength) {
    return false;
  }
  if (requireUppercase && !/[A-Z]/.test(password)) {
    return false;
  }
  if (requireSpecialChar && !/[!@#$%^&*]/.test(password)) {
    return false;
  }
  return true;
};

export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};  