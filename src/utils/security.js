import DOMPurify from 'dompurify';

// Sanitización de inputs
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return DOMPurify.sanitize(input.trim());
};

// Validación de tipos MIME para archivos
export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

// Validación de tamaño de archivo
export const validateFileSize = (file, maxSizeInMB) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

// Prevención de XSS en contenido HTML
export const sanitizeHTML = (html) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target']
  });
};

// Validación de números
export const validateNumber = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

// Validación de URLs
export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validación de teléfono
export const validatePhone = (phone) => {
  return /^\+?[\d\s-]{9,15}$/.test(phone);
};

// Validación de tarjeta de crédito
export const validateCreditCard = (number) => {
  // Algoritmo de Luhn
  let sum = 0;
  let isEven = false;
  
  // Eliminar espacios y guiones
  number = number.replace(/[\s-]/g, '');
  
  // Validar que solo contenga números
  if (!/^\d+$/.test(number)) return false;
  
  // Validar longitud
  if (number.length < 13 || number.length > 19) return false;
  
  // Algoritmo de Luhn
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number.charAt(i));
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Validación de fecha de caducidad de tarjeta
export const validateExpiryDate = (expiry) => {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
  
  const [month, year] = expiry.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  const expMonth = parseInt(month);
  const expYear = parseInt(year);
  
  if (expMonth < 1 || expMonth > 12) return false;
  
  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    return false;
  }
  
  return true;
};

// Validación de CVC
export const validateCVC = (cvc) => {
  return /^\d{3,4}$/.test(cvc);
};

// Rate limiting para formularios
export const createRateLimiter = (maxAttempts, timeWindow) => {
  const attempts = new Map();
  
  return (key) => {
    const now = Date.now();
    const userAttempts = attempts.get(key) || [];
    
    // Limpiar intentos antiguos
    const recentAttempts = userAttempts.filter(time => now - time < timeWindow);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    attempts.set(key, recentAttempts);
    return true;
  };
}; 