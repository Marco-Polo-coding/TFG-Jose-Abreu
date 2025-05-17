import { useState } from 'react';

const useFormValidation = (initialState = {}, validate) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value
    });
  };

  const handleBlur = () => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
  };

  const handleSubmit = (callback) => async (e) => {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await callback(values);
      } catch (error) {
        setErrors({ submit: error.message });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues
  };
};

export default useFormValidation; 