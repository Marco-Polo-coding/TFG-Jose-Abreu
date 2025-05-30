import React from 'react';

const PasswordRequirements = ({ password, showErrors = false, mostrar = true }) => {
  if (!mostrar) return null;
  const requirements = [
    {
      text: 'Mínimo 8 caracteres',
      met: password.length >= 8
    },
    {
      text: 'Al menos una mayúscula',
      met: /[A-Z]/.test(password)
    },
    {
      text: 'Al menos una minúscula',
      met: /[a-z]/.test(password)
    },
    {
      text: 'Al menos un número',
      met: /\d/.test(password)
    },
    {
      text: 'Al menos un carácter especial',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  ];

  const allRequirementsMet = requirements.every(req => req.met);

  return (
    <div className="mt-2 space-y-1">
      {requirements.map((req, index) => (
        <div key={index} className="flex items-center text-sm">
          <span className={`mr-2 ${req.met ? 'text-green-500' : showErrors ? 'text-red-500' : 'text-gray-400'}`}>
            {req.met ? '✓' : showErrors ? '✕' : '○'}
          </span>
          <span className={req.met ? 'text-green-500' : showErrors ? 'text-red-500' : 'text-gray-500'}>
            {req.text}
          </span>
        </div>
      ))}
      {showErrors && !allRequirementsMet && (
        <p className="text-red-500 text-sm mt-2">
          La contraseña debe cumplir todos los requisitos
        </p>
      )}
    </div>
  );
};

export default PasswordRequirements; 