export default class UsuarioRepository extends Repository {
    constructor() {
        super("http://localhost:8080/api/v1")
    }

    async getById(id) {
        return this.getById(`/usuarios/${id}`)
    }

    async update(id, usuarioData) {
        return this.update(`/usuarios/${id}`, usuarioData)
    }
  }