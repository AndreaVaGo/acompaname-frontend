import Repository, { API_URL, lanzarError } from "./Repository";

export default class AuthRepository extends Repository {
  constructor() {
    super(API_URL);
  }

  // Devuelve los datos de la persona y el token que enviará en cada petición
  // captchaToken solo se envía si el CAPTCHA está activado (si es undefined, JSON.stringify lo omite)
  async login(email, password, captchaToken) {
    const response = await fetch(`${this.uri}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, captchaToken }),
    });
    // true: el 401 del login es "email o contraseña mal", no una sesión caducada
    if (!response.ok) {
      await lanzarError(response, "Credenciales incorrectas", true);
    }
    return await response.json();
  }

  // Segundo paso del login: envía el desafío que dio el login y el código que llegó por correo.
  // Si valen, devuelve lo mismo que un login normal (datos de la persona y token)
  async verificarCodigo(desafio, codigo) {
    const response = await fetch(`${this.uri}/login/verificar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ desafio, codigo }),
    });
    // true: es una ruta pública, un 401 aquí nunca es una sesión caducada
    if (!response.ok) {
      await lanzarError(response, "Código incorrecto", true);
    }
    return await response.json();
  }

  async register(usuarioData) {
    return this.post("/usuarios", usuarioData);
  }

  // Pide el enlace para recuperar la contraseña. El servidor contesta siempre lo mismo,
  // exista o no el correo, y devuelve un texto (no un JSON)
  async olvidePassword(email) {
    const response = await fetch(`${this.uri}/olvide-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    // true: es una ruta pública, un 401 aquí nunca es una sesión caducada
    if (!response.ok) {
      await lanzarError(response, "No se pudo pedir el enlace", true);
    }
    return await response.text();
  }

  // Pone la contraseña nueva usando el token del enlace. Si va bien, el servidor
  // contesta 204 (sin cuerpo), así que no hay nada que leer
  async restablecerPassword(token, passwordNueva) {
    const response = await fetch(`${this.uri}/restablecer-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, passwordNueva }),
    });
    if (!response.ok) {
      await lanzarError(response, "No se pudo cambiar la contraseña", true);
    }
  }
}
