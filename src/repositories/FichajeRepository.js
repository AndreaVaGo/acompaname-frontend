import Repository, { API_URL } from "./Repository";

// Fichar el inicio y el fin de un servicio (solo la persona cuidadora) y ver los fichajes
export default class FichajeRepository extends Repository {
  constructor() {
    super(API_URL);
  }

  // Dice si hay que pedir la ubicación al navegador antes de fichar
  async getConfiguracion() {
    return this.get("/fichajes/configuracion");
  }

  async getFichajes(solicitudId) {
    return this.get(`/fichajes/${solicitudId}`);
  }

  // ubicacion es { latitud, longitud } o nada: sin ubicación se ficha igual, solo con la hora
  async empezar(solicitudId, ubicacion) {
    return this.post(`/fichajes/${solicitudId}/inicio`, ubicacion || {});
  }

  async terminar(solicitudId, ubicacion) {
    return this.post(`/fichajes/${solicitudId}/fin`, ubicacion || {});
  }
}
