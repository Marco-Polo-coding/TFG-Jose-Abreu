import React, { useState } from 'react';
import useCartStore from '../store/cartStore';
import { FaCreditCard, FaPaypal, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';

const paymentMethods = [
  { value: 'tarjeta', label: 'Tarjeta', icon: <FaCreditCard className="inline mr-2" /> },
  { value: 'paypal', label: 'PayPal', icon: <FaPaypal className="inline mr-2" /> },
  { value: 'bizum', label: 'Bizum', icon: <FaMoneyBillWave className="inline mr-2" /> },
];

function CheckoutComponent() {
  const { items, clearCart } = useCartStore();
  const [selectedMethod, setSelectedMethod] = useState('tarjeta');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const total = items.reduce((sum, item) => sum + (item.precio * item.quantity), 0);

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      clearCart();
    }, 2000);
  };

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
    return <p className="text-center text-gray-500">Tu carrito está vacío.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-6">Resumen de tu pedido</h2>
      <ul className="divide-y divide-gray-200 mb-6">
        {items.map(item => (
          <li key={item.id} className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <img src={item.imagen} alt={item.nombre} className="w-16 h-16 object-cover rounded" />
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
          </label>
        ))}
      </div>
      <button
        onClick={handlePay}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-full font-semibold text-lg shadow hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
      >
        Pagar
      </button>
    </div>
  );
}

export default CheckoutComponent; 