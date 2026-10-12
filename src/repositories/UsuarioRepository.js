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

  async cambiarPassword(id, passwordActual, passwordNueva) {
    const response = await fetch(`${this.uri}/usuarios/${id}/password`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ passwordActual, passwordNueva }),
    });
    // El backend responde 204 (sin cuerpo), así que no hay json que leer
    if (!response.ok) throw new Error("Error al cambiar la contraseña");
  }

  async actualizarContacto(id, nombre, email, telefono) {
    const response = await fetch(`${this.uri}/usuarios/${id}/contacto`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ nombre, email, telefono }),
    });
    if (!response.ok) throw new Error("Error al actualizar los datos");
    return response.json();
  }
}