import { validateCreditCard, validateExpiryDate, validateCVC, validatePhone, validateURL } from './security';

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
  // Validar que solo contenga letras, espacios y algunos caracteres especiales
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name)) {
    return ['El nombre solo puede contener letras, espacios, guiones y apóstrofes'];
  }
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
      errors.password = passwordErrors[0];
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

// Validación de métodos de pago
export const validatePaymentMethod = (type, data) => {
  const errors = {};

  switch (type) {
    case 'tarjeta':
      if (!data.numero || !validateCreditCard(data.numero)) {
        errors.numero = 'Número de tarjeta inválido';
      }
      if (!data.titular || !/^[a-zA-ZÀ-ÿ\s'-]+$/.test(data.titular)) {
        errors.titular = 'Nombre del titular inválido';
      }
      if (!data.caducidad || !validateExpiryDate(data.caducidad)) {
        errors.caducidad = 'Fecha de caducidad inválida';
      }
      if (!data.cvc || !validateCVC(data.cvc)) {
        errors.cvc = 'CVC inválido';
      }
      break;

    case 'paypal':
      if (!data.email || !validateEmail(data.email)) {
        errors.email = 'Email de PayPal inválido';
      }
      break;

    case 'bizum':
      if (!data.telefono || !validatePhone(data.telefono)) {
        errors.telefono = 'Número de teléfono inválido';
      }
      break;
  }

  return errors;
};

// Validación de productos
export const validateProduct = (product) => {
  const errors = {};

  if (!product.nombre || product.nombre.length < 3 || product.nombre.length > 100) {
    errors.nombre = 'El nombre debe tener entre 3 y 100 caracteres';
  }

  if (!product.descripcion || product.descripcion.length < 10 || product.descripcion.length > 1000) {
    errors.descripcion = 'La descripción debe tener entre 10 y 1000 caracteres';
  }

  if (!product.precio || isNaN(product.precio) || product.precio <= 0) {
    errors.precio = 'El precio debe ser un número positivo';
  }

  if (!product.categoria) {
    errors.categoria = 'La categoría es requerida';
  }

  if (!product.estado) {
    errors.estado = 'El estado es requerido';
  }

  return errors;
};

// Validación de artículos
export const validateArticle = (article) => {
  const errors = {};

  if (!article.titulo || article.titulo.length < 5 || article.titulo.length > 200) {
    errors.titulo = 'El título debe tener entre 5 y 200 caracteres';
  }

  if (!article.contenido || article.contenido.length < 50) {
    errors.contenido = 'El contenido debe tener al menos 50 caracteres';
  }

  if (article.imagen && !validateURL(article.imagen)) {
    errors.imagen = 'URL de imagen inválida';
  }

  return errors;
}; 