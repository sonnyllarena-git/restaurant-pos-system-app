export const validateLoginForm = (values) => {
  const errors = {};
  if (!values.username || values.username.trim() === '') errors.username = 'Username is required';
  if (!values.password || values.password.length < 6) errors.password = 'Password must be at least 6 characters';
  return errors;
};

export const validatePaymentForm = (values) => {
  const errors = {};
  if (!values.cashReceived || parseFloat(values.cashReceived) === 0) errors.cashReceived = 'Cash amount is required';
  else if (parseFloat(values.cashReceived) < parseFloat(values.amountDue)) errors.cashReceived = 'Insufficient cash';
  return errors;
};
