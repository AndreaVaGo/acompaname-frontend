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
}