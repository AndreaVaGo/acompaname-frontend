import Repository, { API_URL } from "./Repository";

// Verificaciones de titulación y de antecedentes de las personas cuidadoras
export default class VerificacionRepository extends Repository {
  constructor() {
    super(`${API_URL}/verificaciones`);
  }

  // Público (sin iniciar sesión): [{ cuidadorId, titulacionVerificada, antecedentesVerificados }]
  async getPublicas() {
    return this.get("/publicas");
  }

  // Las verificaciones de la persona cuidadora que ha entrado
  async getMias() {
    return this.get("/mias");
  }

  // Envía (o vuelve a enviar) la referencia de una prueba. tipo: "TITULACION" o "ANTECEDENTES"
  async enviar(tipo, referencia) {
    return this.put(`/${tipo}`, { referencia });
  }
}
