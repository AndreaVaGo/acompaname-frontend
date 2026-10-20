// La URL de la API se puede cambiar con VITE_API_URL en un archivo .env
// (ver .env.example). Si no existe, se usa el backend local.
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

// Lanza el error de una respuesta que no es correcta (400, 403, 404, 500...).
// message es el texto fijo de siempre, status es el código HTTP y
// detalle es el mensaje con el que el servidor explica el motivo (si lo hay).
export async function lanzarError(response, mensaje) {
  const error = new Error(mensaje);
  error.status = response.status;
  error.detalle = "";
  if (response.text) {
    error.detalle = await response.text();
  }
  throw error;
}

export default class Repository {
  constructor(uri) {
    this.uri = uri;
  }

  getHeaders() {
    const credenciales = sessionStorage.getItem("credenciales");
    const headers = {
      "Content-Type": "application/json",
    };
    if (credenciales) {
      headers["Authorization"] = `Basic ${credenciales}`;
    }
    return headers;
  }

  async get(path = "") {
    const response = await fetch(`${this.uri}${path}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) await lanzarError(response, "Error en la petición GET");
    return await response.json();
  }

  async post(path, data) {
    const response = await fetch(`${this.uri}${path}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) await lanzarError(response, "Error en la petición POST");
    return await response.json();
  }

  async put(path, data) {
    const response = await fetch(`${this.uri}${path}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) await lanzarError(response, "Error en la petición PUT");
    return await response.json();
  }

  // PATCH cambia solo una parte del recurso (por ejemplo, bloquear a un usuario)
  async patch(path, data) {
    const response = await fetch(`${this.uri}${path}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) await lanzarError(response, "Error en la petición PATCH");
    return await response.json();
  }

  async delete(path) {
    const response = await fetch(`${this.uri}${path}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!response.ok) await lanzarError(response, "Error en la petición DELETE");
  }
}