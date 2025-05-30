import { useState, useCallback } from 'react';
import { sanitizeInput, createRateLimiter } from '../utils/security';

const useFormValidation = (initialState = {}, validate) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Crear rate limiter: 5 intentos por minuto
  const rateLimiter = createRateLimiter(5, 60000);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    // Sanitizar el input antes de guardarlo
    const sanitizedValue = sanitizeInput(value);
    setValues(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  }, []);

  const handleBlur = useCallback(() => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
  }, [validate, values]);

  const handleSubmit = useCallback((callback) => async (e) => {
    e.preventDefault();
    
    // Verificar rate limiting
    if (!rateLimiter('form_submit')) {
      setErrors({ submit: 'Demasiados intentos. Por favor, espera un momento.' });
      return;
    }

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await callback(values);
        // Resetear intentos después de un envío exitoso
        setAttempts(0);
      } catch (error) {
        setErrors({ submit: error.message });
        setAttempts(prev => prev + 1);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [validate, values, rateLimiter]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    attempts
  };
};

export default useFormValidation; 