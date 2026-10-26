import Repository, { API_URL } from "./Repository";

// Llamadas del panel de administración (solo funcionan con el rol ADMIN)
export default class AdminRepository extends Repository {
  constructor() {
    super(API_URL);
  }

  async getEstadisticas() {
    return this.get("/admin/estadisticas");
  }

  async getAvisos() {
    return this.get("/admin/avisos");
  }

  async getMejoresCuidadores() {
    return this.get("/admin/cuidadores/mejor-valorados");
  }

  async getUltimasValoraciones() {
    return this.get("/admin/valoraciones/ultimas");
  }

  async borrarValoracion(id) {
    return this.delete(`/admin/valoraciones/${id}`);
  }

  async getUsuarios() {
    return this.get("/admin/usuarios");
  }

  // Bloquea (activo = false) o desbloquea (activo = true) a un usuario
  async cambiarActivo(id, activo) {
    return this.patch(`/admin/usuarios/${id}/activo`, { activo: activo });
  }

  // Si no se indica estado, salen todas las solicitudes
  async getSolicitudes(estado) {
    if (estado) {
      return this.get(`/admin/solicitudes?estado=${estado}`);
    }
    return this.get("/admin/solicitudes");
  }

  // Resumen y análisis de los pagos: totales, por tipo de cuidado, por mes y cuidadores que más cobran
  async getPagosResumen() {
    return this.get("/admin/pagos/resumen");
  }

  // Si no se indica estado, salen todos los pagos
  async getPagos(estado) {
    if (estado) {
      return this.get(`/admin/pagos?estado=${estado}`);
    }
    return this.get("/admin/pagos");
  }
}