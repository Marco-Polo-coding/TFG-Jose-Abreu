export async function getMetodoPago(uid) {
  const res = await fetch(`http://127.0.0.1:8000/usuarios/${uid}/metodo_pago`);
  if (!res.ok) return null;
  return await res.json();
}

export async function saveMetodoPago(uid, metodo) {
  const res = await fetch(`http://127.0.0.1:8000/usuarios/${uid}/metodo_pago`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metodo)
  });
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
