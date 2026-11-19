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

  // Importa los ratos ocupados de un calendario externo. contenido es el texto del archivo .ics
  // Devuelve { importados, duplicados, omitidos }
  async importar(contenido) {
    return this.post("/bloques-ocupados/importar", { contenido: contenido });
  }

  // Repite un rato ocupado varios días de la semana entre dos fechas (turnos).
  // datos: { desde, hasta, diasSemana: ["MONDAY", ...], horaInicio, horaFin, motivo }
  // Si la hora de fin es anterior a la de inicio es un turno de noche. Devuelve { creados, duplicados }
  async repetir(datos) {
    return this.post("/bloques-ocupados/repetir", datos);
  }

  // Borra un bloque (solo puede hacerlo su dueña o dueño)
  async remove(id) {
    return this.delete(`/bloques-ocupados/${id}`);
  }
}
