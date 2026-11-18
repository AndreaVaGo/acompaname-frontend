import Repository, { API_URL } from "./Repository";

export default class BloqueOcupadoRepository extends Repository {
  constructor() {
    super(API_URL);
  }

  // Los bloques ocupados de la persona cuidadora con la sesión iniciada, por orden de fecha y hora
  async getMios() {
    return this.get("/bloques-ocupados");
  }

  // Crea un bloque: { fecha: "2026-12-01", horaInicio: "08:00", horaFin: "15:00", motivo: "Turno" }
  async create(bloque) {
    return this.post("/bloques-ocupados", bloque);
  }

  // Borra un bloque (solo puede hacerlo su dueña o dueño)
  async remove(id) {
    return this.delete(`/bloques-ocupados/${id}`);
  }
}
