import { useState } from 'react';

export function useForm(initialValues, onSubmit, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (validate) setErrors(validate(values));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (validate) {
      const fieldErrors = validate(values);
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length > 0) {
        setIsSubmitting(false);
        return;
      }
    }
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, setValues, setErrors };
}
