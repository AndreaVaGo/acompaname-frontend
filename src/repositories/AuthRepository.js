import Repository, { API_URL, lanzarError } from "./Repository";

export default class AuthRepository extends Repository {
  constructor() {
    super(API_URL);
  }

  // Devuelve los datos de la persona y el token que enviará en cada petición
  async login(email, password) {
    const response = await fetch(`${this.uri}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    // true: el 401 del login es "email o contraseña mal", no una sesión caducada
    if (!response.ok) {
      await lanzarError(response, "Credenciales incorrectas", true);
    }
    return await response.json();
  }

  async register(usuarioData) {
    return this.post("/usuarios", usuarioData);
  }
}