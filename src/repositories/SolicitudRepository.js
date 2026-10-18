import Repository, { API_URL } from "./Repository";

export default class SolicitudRepository extends Repository {
  constructor() {
    super(API_URL);
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
    if (!response.ok) {
      // El servidor explica el motivo en el cuerpo de la respuesta (por ejemplo, un 409)
      const textoServidor = await response.text();
      const error = new Error(textoServidor || "Error al cambiar el estado");
      error.status = response.status;
      throw error;
    }
    return await response.json();
  }

  // Ids de los cuidadores con un servicio aceptado entre estas fechas.
  // Si no hay fecha de fin, solo se pregunta por el día de inicio.
  async getCuidadoresOcupados(inicio, fin) {
    let ruta = `/solicitudes/cuidadores-ocupados?inicio=${inicio}`;
    if (fin) {
      ruta = ruta + `&fin=${fin}`;
    }
    return this.get(ruta);
  }

  async getAll() {
    return this.get("/solicitudes");
  }

  async getMisSolicitudes() {
    return this.get("/solicitudes/mis-solicitudes");
  }
}