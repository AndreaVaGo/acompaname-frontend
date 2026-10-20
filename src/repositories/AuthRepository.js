import Repository, { API_URL, lanzarError } from "./Repository";

export default class AuthRepository extends Repository {
  constructor() {
    super(API_URL);
  }

  async login(email, password) {
    const credenciales = btoa(`${email}:${password}`);
    const response = await fetch(`${this.uri}/login`, {
      headers: {
        Authorization: `Basic ${credenciales}`,
      },
    });
    if (!response.ok) await lanzarError(response, "Credenciales incorrectas");
    const data = await response.json();
    return { ...data, credenciales };
  }

  async register(usuarioData) {
    return this.post("/usuarios", usuarioData);
  }
}