import Repository, { API_URL } from "./Repository";

export default class PagoRepository extends Repository {
  constructor() {
    super(API_URL);
  }

  async getMisPagos() {
    return this.get("/pagos");
  }

  async marcarComoPagado(id) {
    const response = await fetch(`${this.uri}/pagos/${id}/pagar`, {
      method: "PATCH",
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error("Error al realizar el pago");
    return await response.json();
  }
}