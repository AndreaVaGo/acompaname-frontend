import Repository, { API_URL } from "./Repository";

export default class UsuarioRepository extends Repository {
  constructor() {
    super(API_URL);
  }

  async getById(id) {
    return this.get(`/usuarios/${id}`);
  }

  async update(id, usuarioData) {
    return this.put(`/usuarios/${id}`, usuarioData);
  }
}