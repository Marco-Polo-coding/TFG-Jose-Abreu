import React, { useEffect, useState } from "react";
import { FaHeart, FaShoppingCart, FaBookmark, FaArrowLeft } from "react-icons/fa";

const ProductoDetalle = ({ id }) => {
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extraer el número del ID (por ejemplo, "producto_1" -> "1")
    const productoId = id.split('_')[1];
    
    fetch(`http://localhost:8000/productos/${productoId}`)
      .then((res) => res.json())
      .then((data) => {
        setProducto(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener el producto:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Producto no encontrado</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-8"
      >
        <FaArrowLeft /> Volver al inicio
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="w-full h-96 object-cover"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-4">{producto.nombre}</h1>
          <p className="text-2xl font-bold text-purple-600 mb-4">
            ${producto.precio}
          </p>
          <p className="text-gray-600 mb-6">{producto.descripcion}</p>

          <div className="flex items-center gap-4 mb-6">
            <button className="text-gray-500 hover:text-red-500 transition-colors">
              <FaHeart className="w-6 h-6" />
            </button>
            <button className="text-gray-500 hover:text-yellow-500 transition-colors">
              <FaBookmark className="w-6 h-6" />
            </button>
          </div>

          <button className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
            <FaShoppingCart className="w-5 h-5" />
            Añadir al Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle; 