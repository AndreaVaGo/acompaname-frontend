import Repository from "./Repository";

export default class SolicitudRepository extends Repository {
  constructor() {
    super("http://localhost:8080/api/v1");
  }

  async getById(id) {
    return this.get(`/solicitudes/${id}`);
  }

  async create(solicititudData) {
    return this.post("/solicitudes", solicititudData);
  }

  async cambiarEstado(id, nuevoEstado) {
    const response = await fetch(`${this.uri}/solicitudes/${id}/estado`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    if (!response.ok) throw new Error("Error al cambiar el estado");
    return await response.json();
  }

  async getAll() {
    return this.get("/solicitudes");
  }

  async getMisSolicitudes() {
    return this.get("/solicitudes/mis-solicitudes");
  }
}
