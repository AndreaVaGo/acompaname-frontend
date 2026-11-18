import Repository, { API_URL } from "./Repository";

// Mensajes del chat de una solicitud
export default class MensajeRepository extends Repository {
  constructor() {
    super(API_URL);
  }

  // Sin "desde" devuelve toda la conversación; con "desde" solo los mensajes con un id mayor
  async getMensajes(solicitudId, desdeId = null) {
    let ruta = `/solicitudes/${solicitudId}/mensajes`;
    if (desdeId !== null && desdeId !== undefined) {
      ruta = ruta + `?desde=${desdeId}`;
    }
    return this.get(ruta);
  }

  // Mensajes sin leer de la persona: { total, porSolicitud: { idSolicitud: cantidad } }
  async getNoLeidos() {
    return this.get("/mensajes/no-leidos");
  }

  async enviar(solicitudId, texto) {
    return this.post(`/solicitudes/${solicitudId}/mensajes`, { texto: texto });
  }
}
