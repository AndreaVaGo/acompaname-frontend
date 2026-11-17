import Repository, { API_URL } from "./Repository";

export default class SugerenciaRepository extends Repository {
  constructor() {
    super(API_URL);
  }

  // Envía una sugerencia de mejora de la web (hace falta tener la sesión iniciada)
  async create(texto) {
    return this.post("/sugerencias", { texto: texto });
  }
}
