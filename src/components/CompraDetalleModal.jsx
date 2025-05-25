import React from 'react';
import { FaTimes, FaCreditCard, FaPaypal, FaMoneyBillWave } from 'react-icons/fa';

const icons = {
  tarjeta: <FaCreditCard className="inline mr-2 text-purple-600" />,
  paypal: <FaPaypal className="inline mr-2 text-blue-500" />,
  bizum: <FaMoneyBillWave className="inline mr-2 text-green-500" />,
};

const CompraDetalleModal = ({ isOpen, onClose, compra }) => {
  if (!isOpen || !compra) return null;

  const { fecha, total, metodo_pago, productos = [] } = compra;
  const fechaBonita = fecha ? new Date(fecha).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="fixed inset-0 z-[300] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Fondo oscuro con gradiente */}
        <div 
          className="fixed inset-0 bg-gradient-to-br from-purple-900/80 via-indigo-900/70 to-black/80 transition-opacity"
          onClick={onClose}
        />
        {/* Modal */}
        <div className="inline-block transform overflow-hidden rounded-3xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle animate-fade-in">
          <div className="relative bg-white px-8 pt-8 pb-6 sm:p-10">
            {/* Botón de cerrar */}
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-gray-400 hover:text-purple-600 transition-colors text-xl"
              title="Cerrar"
            >
              <FaTimes className="w-6 h-6" />
            </button>
            {/* Contenido */}
            <div className="text-center">
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                Compra del {fechaBonita}
              </h3>
              <p className="text-lg text-gray-700 mb-4 font-semibold">Total: {total}€</p>
              <div className="mb-4">
                <span className="font-semibold text-gray-700">Método de pago: </span>
                {metodo_pago?.tipo && icons[metodo_pago.tipo]}
                <span className="capitalize">{metodo_pago?.tipo}</span>
                {metodo_pago?.tipo === 'tarjeta' && metodo_pago.datos?.numero && (
                  <span className="ml-2 text-gray-500 text-sm">•••• {metodo_pago.datos.numero.slice(-4)}</span>
                )}
                {metodo_pago?.tipo === 'paypal' && metodo_pago.datos?.email && (
                  <span className="ml-2 text-gray-500 text-sm">{metodo_pago.datos.email}</span>
                )}
                {metodo_pago?.tipo === 'bizum' && metodo_pago.datos?.telefono && (
                  <span className="ml-2 text-gray-500 text-sm">{metodo_pago.datos.telefono}</span>
                )}
              </div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Productos comprados:</span>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-3">
                {productos.length === 0 ? (
                  <p className="text-gray-500">No hay productos en esta compra.</p>
                ) : (
                  productos.map((prod, idx) => (
                    <div key={prod.id || idx} className="flex items-center gap-4 bg-purple-50 rounded-xl p-3 border border-purple-100 shadow-sm">
                      <img src={prod.imagen || 'https://cataas.com/cat'} alt={prod.nombre} className="w-14 h-14 object-cover rounded-lg border border-purple-200" />
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-900 truncate max-w-[160px]">{prod.nombre}</div>
                        <div className="text-xs text-gray-500">Cantidad: {prod.quantity || 1}</div>
                        <div className="text-xs text-gray-500">Precio: {prod.precio}€</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompraDetalleModal; 