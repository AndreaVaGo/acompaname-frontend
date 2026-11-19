import Repository, { API_URL } from "./Repository";

export default class CuidadorRepository extends Repository {
  constructor() {
    super(API_URL);
  }

  async getAll() {
    return this.get("/cuidadores");
  }

  // Distancia desde un lugar (ciudad o código postal) hasta la ciudad de cada persona cuidadora.
  // Devuelve { lugarEncontrado, distancias: [{ cuidadorId, km }] }, de la más cerca a la más lejos
  async getCerca(lugar) {
    return this.get(`/cuidadores/cerca?lugar=${encodeURIComponent(lugar)}`);
  }

  async getById(id) {
    return this.get(`/cuidadores/${id}`);
  }

  async getMiPerfil() {
    return this.get("/cuidadores/mi-perfil");
  }

  async update(id, cuidadorData) {
    return this.put(`/cuidadores/${id}`, cuidadorData);
  }
}
