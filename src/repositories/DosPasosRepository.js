import Repository, { API_URL } from "./Repository";

// Activar, desactivar y consultar el inicio de sesión en dos pasos de la persona que ha entrado
export default class DosPasosRepository extends Repository {
  constructor() {
    super(`${API_URL}/dos-pasos`);
  }

  // Devuelve { activo: true|false }
  async getEstado() {
    return this.get("");
  }

  // Hay que escribir la contraseña actual para poder cambiarlo. Devuelve el nuevo estado
  async cambiar(activo, password) {
    return this.put("", { activo, password });
  }
}
