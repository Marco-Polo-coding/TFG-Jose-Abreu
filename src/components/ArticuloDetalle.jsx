import React, { useEffect, useState } from "react";
import { FaHeart, FaBookmark, FaArrowLeft, FaComment } from "react-icons/fa";

const ArticuloDetalle = ({ id }) => {
  const [articulo, setArticulo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nuevoComentario, setNuevoComentario] = useState("");

  useEffect(() => {
    fetch(`http://localhost:8000/articulos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setArticulo(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener el artículo:", error);
        setLoading(false);
      });
  }, [id]);

  const handleSubmitComentario = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el comentario
    console.log("Nuevo comentario:", nuevoComentario);
    setNuevoComentario("");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  if (!articulo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Artículo no encontrado</div>
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

      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        <img
          src={articulo.imagen}
          alt={articulo.titulo}
          className="w-full h-96 object-cover"
        />
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{articulo.titulo}</h1>
          <div className="flex items-center gap-4 text-gray-600 mb-6">
            <span>Por {articulo.autor}</span>
            <span>•</span>
            <span>{new Date(articulo.fecha).toLocaleDateString()}</span>
          </div>
          <div className="prose max-w-none mb-8">{articulo.contenido}</div>

          <div className="flex items-center gap-4 mb-8">
            <button className="text-gray-500 hover:text-red-500 transition-colors">
              <FaHeart className="w-6 h-6" />
            </button>
            <button className="text-gray-500 hover:text-yellow-500 transition-colors">
              <FaBookmark className="w-6 h-6" />
            </button>
          </div>

          {/* Sección de Comentarios */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">Comentarios</h2>
            
            <form onSubmit={handleSubmitComentario} className="mb-8">
              <textarea
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                placeholder="Escribe un comentario..."
                className="w-full p-4 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="4"
              />
              <button
                type="submit"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Publicar Comentario
              </button>
            </form>

            <div className="space-y-6">
              {articulo.comentarios?.map((comentario) => (
                <div key={comentario.id} className="border-b pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{comentario.usuario}</span>
                    <span className="text-gray-500">
                      {new Date(comentario.fecha).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comentario.texto}</p>
                  
                  {/* Respuestas */}
                  {comentario.respuestas?.map((respuesta) => (
                    <div key={respuesta.id} className="ml-8 mt-4 border-l-2 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{respuesta.usuario}</span>
                        <span className="text-gray-500">
                          {new Date(respuesta.fecha).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{respuesta.texto}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default ArticuloDetalle;