import Repository, { API_URL } from "./Repository";

export default class ValoracionRepository extends Repository {
  constructor() {
    super(API_URL);
  }

  async getAll() {
    return this.get("/valoraciones");
  }

  async create(valoracionData) {
    return this.post("/valoraciones", valoracionData);
  }

  // Valoraciones públicas de un cuidador (no hace falta iniciar sesión)
  async getPorCuidador(cuidadorId) {
    return this.get(`/valoraciones/cuidador/${cuidadorId}`);
  }
}