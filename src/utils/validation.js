export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  if (password.length < minLength) {
    errors.push(`La contraseña debe tener al menos ${minLength} caracteres`);
  }
  if (!hasUpperCase) {
    errors.push('La contraseña debe contener al menos una mayúscula');
  }
  if (!hasLowerCase) {
    errors.push('La contraseña debe contener al menos una minúscula');
  }
  if (!hasNumbers) {
    errors.push('La contraseña debe contener al menos un número');
  }
  if (!hasSpecialChar) {
    errors.push('La contraseña debe contener al menos un carácter especial');
  }

  return errors;
};

export const validateName = (name) => {
  if (!name) return ['El nombre es requerido'];
  if (name.length < 2) return ['El nombre debe tener al menos 2 caracteres'];
  if (name.length > 50) return ['El nombre no puede tener más de 50 caracteres'];
  return [];
};

export const validateForm = (values, isLogin = false) => {
  const errors = {};

  // Validar email
  if (!values.email) {
    errors.email = 'El email es requerido';
  } else if (!validateEmail(values.email)) {
    errors.email = 'El email no es válido';
  }

  // Validar contraseña
  if (!values.password) {
    errors.password = 'La contraseña es requerida';
  } else if (!isLogin) {
    const passwordErrors = validatePassword(values.password);
    if (passwordErrors.length > 0) {
      errors.password = passwordErrors[0]; // Mostrar solo el primer error
    }
  }

  // Validar nombre solo en registro
  if (!isLogin && !values.name) {
    errors.name = 'El nombre es requerido';
  } else if (!isLogin) {
    const nameErrors = validateName(values.name);
    if (nameErrors.length > 0) {
      errors.name = nameErrors[0];
    }
  }

  return errors;
}; 