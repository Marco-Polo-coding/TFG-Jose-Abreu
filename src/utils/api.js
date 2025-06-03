import { apiManager } from './apiManager';

export async function getMetodoPago(uid) {
  try {
    return await apiManager.get(`/usuarios/uid/${uid}/metodo_pago`);
  } catch (error) {
    return null;
  }
}

export async function saveMetodoPago(uid, tipo, datos) {
  return apiManager.post(`/usuarios/uid/${uid}/metodos_pago/${tipo}`, datos);
}

export async function deleteMetodoPago(uid, tipo) {
  return apiManager.delete(`/usuarios/uid/${uid}/metodos_pago/${tipo}`);
}

export async function registrarCompra(compra) {
  return apiManager.post('/compras', compra);
}

export async function getMetodosPago(uid) {
  return apiManager.get(`/usuarios/uid/${uid}/metodos_pago`);
}
