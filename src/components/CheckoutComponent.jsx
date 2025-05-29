import React, { useEffect, useState } from 'react';
import useCartStore from '../store/cartStore';
import { FaCreditCard, FaPaypal, FaMoneyBillWave, FaCheckCircle, FaLock, FaSignInAlt } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import { getMetodosPago, saveMetodoPago, deleteMetodoPago, registrarCompra } from '../utils/api';
import useAuthUser from '../hooks/useAuthUser';

const paymentMethods = [
  { value: 'tarjeta', label: 'Tarjeta', icon: <FaCreditCard className="inline mr-2" /> },
  { value: 'paypal', label: 'PayPal', icon: <FaPaypal className="inline mr-2" /> },
  { value: 'bizum', label: 'Bizum', icon: <FaMoneyBillWave className="inline mr-2" /> },
];

const initialForms = {
  tarjeta: { numero: '', titular: '', caducidad: '', cvc: '' },
  paypal: { email: '' },
  bizum: { telefono: '' },
};

function validateForm(tipo, datos) {
  if (tipo === 'tarjeta') {
    return datos.numero && datos.titular && datos.caducidad && datos.cvc;
  }
  if (tipo === 'paypal') {
    return datos.email && /.+@.+\..+/.test(datos.email);
  }
  if (tipo === 'bizum') {
    return datos.telefono && /^\d{9}$/.test(datos.telefono);
  }
  return false;
}

function CheckoutComponent() {
  const { items, clearCart } = useCartStore();
  const uid = useAuthUser();
  const [selectedMethod, setSelectedMethod] = useState('tarjeta');
  const [form, setForm] = useState(initialForms['tarjeta']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [metodosGuardados, setMetodosGuardados] = useState({});

  const total = items.reduce((sum, item) => sum + (item.precio * item.quantity), 0);

  useEffect(() => {
    if (uid) {
      getMetodosPago(uid).then(data => {
        setMetodosGuardados(data || {});
        const tipos = Object.keys(data || {});
        if (tipos.length > 0) {
          setSelectedMethod(tipos[0]);
          setForm({ ...initialForms[tipos[0]], ...data[tipos[0]] });
        }
      });
    }
  }, [uid]);

  useEffect(() => {
    if (metodosGuardados[selectedMethod]) {
      setForm({ ...initialForms[selectedMethod], ...metodosGuardados[selectedMethod] });
    } else {
      setForm(initialForms[selectedMethod]);
    }
    setSaved(false);
    setError('');
  }, [selectedMethod, metodosGuardados]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setSaved(false);
    setError('');
  };

  const handleSaveMetodoPago = async () => {
    if (!uid) return;
    setLoadingSave(true);
    setError('');
    try {
      await saveMetodoPago(uid, selectedMethod, form);
      setMetodosGuardados(prev => ({ ...prev, [selectedMethod]: form }));
      setSaved(true);
    } catch (err) {
      setError('Error al guardar el método de pago');
    }
    setLoadingSave(false);
  };

  const handleDeleteMetodoPago = async (tipo) => {
    if (!uid) return;
    setIsDeleting(true);
    setError('');
    try {
      await deleteMetodoPago(uid, tipo);
      setMetodosGuardados(prev => {
        const nuevo = { ...prev };
        delete nuevo[tipo];
        return nuevo;
      });
      if (selectedMethod === tipo) {
        setSelectedMethod('tarjeta');
        setForm(initialForms['tarjeta']);
      }
    } catch (err) {
      setError('Error al eliminar el método de pago');
    }
    setIsDeleting(false);
  };

  const handlePay = async () => {
    if (!uid) return;
    setLoading(true);
    setError('');
    try {
      await saveMetodoPago(uid, selectedMethod, form);
      await registrarCompra({
        uid,
        productos: items,
        total,
        metodo_pago: { tipo: selectedMethod, datos: form },
        fecha: new Date().toISOString(),
      });
      clearCart();
      setSuccess(true);
    } catch (err) {
      setError('Error al procesar el pago');
    }
    setLoading(false);
  };

  if (!uid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center transform transition-all duration-300 hover:scale-105">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
              <FaLock className="w-10 h-10 text-purple-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso Requerido
          </h2>
          <p className="text-gray-600 mb-8">
            Para continuar con tu compra, necesitas iniciar sesión o crear una cuenta.
          </p>
          <div className="space-y-4">
            <a
              href="/tienda"
              className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold shadow hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <FaSignInAlt className="w-5 h-5" />
              Iniciar Sesión
            </a>
            <a
              href="/tienda"
              className="block w-full bg-white border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-all duration-300"
            >
              Volver a la tienda
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner />
        <p className="text-lg text-gray-700 mt-6">Procesando pago...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <FaCheckCircle className="text-green-500 text-6xl mb-4" />
        <h2 className="text-2xl font-bold mb-2">¡Pago realizado con éxito!</h2>
        <p className="text-gray-700 mb-6">Gracias por tu compra. Pronto recibirás un email con los detalles.</p>
        <a href="/tienda" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold shadow hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">Volver a la tienda</a>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white rounded-2xl shadow-xl mx-auto mt-12 max-w-xl p-10 animate-fade-in">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-purple-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3.75h1.386c.51 0 .96.343 1.09.836l.272 1.017m0 0L6.75 9.75m-1.952-4.147h15.404c.86 0 1.47.86 1.21 1.68l-2.1 6.3a1.125 1.125 0 01-1.07.77H7.01m0 0L5.25 4.5m1.76 5.25l1.5 6.75m0 0a2.25 2.25 0 104.24 0m-4.24 0h4.24" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-600 mb-6">Añade productos para poder realizar una compra.</p>
        <a href="/tienda" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold shadow hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">Ir a la tienda</a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-6">Resumen de tu pedido</h2>
      <ul className="divide-y divide-gray-200 mb-6">
        {items.map(item => (
          <li key={item.id} className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <img src={Array.isArray(item.imagenes) && item.imagenes.length > 0 ? item.imagenes[0] : (item.imagen || 'https://cataas.com/cat')} alt={item.nombre} className="w-16 h-16 object-cover rounded" />
              <div>
                <h4 className="font-medium">{item.nombre.length > 18 ? item.nombre.slice(0, 18) + '...' : item.nombre}</h4>
                <p className="text-gray-500">Cantidad: {item.quantity}</p>
              </div>
            </div>
            <span className="font-semibold text-purple-700">{item.precio}€</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between items-center border-t pt-4 mb-8">
        <span className="font-bold text-lg">Total:</span>
        <span className="font-bold text-2xl text-purple-700">{total.toFixed(2)}€</span>
      </div>
      <h3 className="text-lg font-semibold mb-4">Elige método de pago</h3>
      <div className="flex gap-6 mb-8">
        {paymentMethods.map(method => (
          <label key={method.value} className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border transition-all duration-200 ${selectedMethod === method.value ? 'border-purple-600 bg-purple-50' : 'border-gray-300 bg-white hover:bg-gray-100'}`}>
            <input
              type="radio"
              name="paymentMethod"
              value={method.value}
              checked={selectedMethod === method.value}
              onChange={() => setSelectedMethod(method.value)}
              className="form-radio text-purple-600"
            />
            {method.icon}
            <span>{method.label}</span>
            {metodosGuardados[method.value] && (
              <button
                type="button"
                title="Eliminar método"
                className="ml-2 text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded"
                onClick={e => { e.stopPropagation(); handleDeleteMetodoPago(method.value); }}
                disabled={loadingSave}
              >
                Eliminar
              </button>
            )}
          </label>
        ))}
      </div>
      <div className="flex flex-col gap-2 mt-2 mb-4">
        {Object.entries(metodosGuardados).length > 0 && (
          <div className="text-sm text-gray-600 font-semibold mb-1">Métodos guardados:</div>
        )}
        {Object.entries(metodosGuardados).map(([tipo, datos]) => (
          <div key={tipo} className="flex items-center gap-2 text-gray-700 bg-purple-50 rounded px-3 py-2 text-sm">
            <span className="capitalize font-bold">{tipo}</span>
            <span className="text-gray-500">{tipo === 'tarjeta' && datos.numero ? `•••• ${datos.numero.slice(-4)}` : tipo === 'paypal' && datos.email ? datos.email : tipo === 'bizum' && datos.telefono ? datos.telefono : ''}</span>
            <button
              type="button"
              className="ml-auto text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded"
              onClick={() => handleDeleteMetodoPago(tipo)}
              disabled={loadingSave}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
      {/* Formulario dinámico */}
      <div className="mb-8">
        {selectedMethod === 'tarjeta' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="numero" value={form.numero} onChange={handleInputChange} placeholder="Número de tarjeta" className="border rounded-lg px-4 py-2" maxLength={19} />
            <input type="text" name="titular" value={form.titular} onChange={handleInputChange} placeholder="Titular" className="border rounded-lg px-4 py-2" />
            <input type="text" name="caducidad" value={form.caducidad} onChange={handleInputChange} placeholder="MM/AA" className="border rounded-lg px-4 py-2" maxLength={5} />
            <input type="text" name="cvc" value={form.cvc} onChange={handleInputChange} placeholder="CVC" className="border rounded-lg px-4 py-2" maxLength={4} />
          </div>
        )}
        {selectedMethod === 'paypal' && (
          <input type="email" name="email" value={form.email} onChange={handleInputChange} placeholder="Email de PayPal" className="border rounded-lg px-4 py-2 w-full" />
        )}
        {selectedMethod === 'bizum' && (
          <input type="text" name="telefono" value={form.telefono} onChange={handleInputChange} placeholder="Teléfono Bizum" className="border rounded-lg px-4 py-2 w-full" maxLength={9} />
        )}
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleSaveMetodoPago}
          disabled={loadingSave || !validateForm(selectedMethod, form) || metodosGuardados[selectedMethod]}
          className={`bg-white border-2 border-purple-400 text-gray-700 px-6 py-2 rounded-full font-medium transition-all duration-300 ${
            metodosGuardados[selectedMethod] 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-purple-50'
          }`}
        >
          {loadingSave ? (isDeleting ? 'Procesando...' : 'Guardando...') : 
           saved ? 'Método guardado' : 
           metodosGuardados[selectedMethod] ? 'Método ya guardado' : 
           'Guardar método de pago'}
        </button>
        <button
          onClick={handlePay}
          disabled={!validateForm(selectedMethod, form) || loading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-full font-semibold text-lg shadow hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
        >
          Pagar
        </button>
      </div>
    </div>
  );
}

export default CheckoutComponent;
