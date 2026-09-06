import Repository from './Repository'

export default class CuidadorRepository extends Repository {
  constructor() {
    super("http://localhost:8080/api/v1")
  }

  async getAll() {
    return this.get("/cuidadores")
  }

  async getById(id) {
    return this.get(`/cuidadores/${id}`)
  }
}