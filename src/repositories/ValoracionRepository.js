import Repository from './Repository'

export default class ValoracionRepository extends Repository {
  constructor() {
    super("http://localhost:8080/api/v1")
  }

  async getAll() {
    return this.get("/valoraciones")
  }

  async create(valoracionData) {
    return this.post("/valoraciones", valoracionData)
  }
}