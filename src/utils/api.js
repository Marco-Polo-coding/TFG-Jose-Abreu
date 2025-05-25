export async function getMetodoPago(uid) {
  const res = await fetch(`http://127.0.0.1:8000/usuarios/${uid}/metodo_pago`);
  if (!res.ok) return null;
  return await res.json();
}

export async function saveMetodoPago(uid, tipo, datos) {
  const res = await fetch(`http://localhost:8000/usuarios/${uid}/metodos_pago/${tipo}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  if (!res.ok) throw new Error('Error al guardar el método de pago');
  return await res.json();
}

export async function deleteMetodoPago(uid, tipo) {
  const res = await fetch(`http://localhost:8000/usuarios/${uid}/metodos_pago/${tipo}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Error al eliminar el método de pago');
  return await res.json();
}

export async function registrarCompra(compra) {
  const res = await fetch(`http://127.0.0.1:8000/compras`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(compra)
  });
  return await res.json();
}

export async function getMetodosPago(uid) {
  const res = await fetch(`http://localhost:8000/usuarios/${uid}/metodos_pago`);
  if (!res.ok) throw new Error('Error al obtener los métodos de pago');
  return await res.json();
}
