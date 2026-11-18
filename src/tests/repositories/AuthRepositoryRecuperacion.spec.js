import { describe, test, expect, vi, afterEach } from "vitest";
import AuthRepository from "../../repositories/AuthRepository";

const API = "http://localhost:8080/api/v1";

function respuestaCorrecta(status, texto) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    status: status,
    json: async () => {
      throw new Error("Esta respuesta no trae JSON");
    },
    text: async () => texto,
  });
}

function respuestaConError(status, texto) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: false,
    status: status,
    json: async () => ({}),
    text: async () => texto,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});

describe("AuthRepository: olvidePassword", () => {
  test("envía el email con POST a /olvide-password y devuelve el texto del servidor", async () => {
    const fetchFalso = respuestaCorrecta(202, "Si el correo está registrado, te hemos enviado un enlace");

    const texto = await new AuthRepository().olvidePassword("ana@test.com");

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/olvide-password`);
    expect(fetchFalso.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(fetchFalso.mock.calls[0][1].body)).toEqual({ email: "ana@test.com" });
    expect(texto).toBe("Si el correo está registrado, te hemos enviado un enlace");
  });

  test("no envía la cabecera Authorization aunque haya un token guardado", async () => {
    sessionStorage.setItem("token", "token-viejo");
    const fetchFalso = respuestaCorrecta(202, "ok");

    await new AuthRepository().olvidePassword("ana@test.com");

    expect(fetchFalso.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  test("lanza un error con el código si el servidor responde con error", async () => {
    respuestaConError(429, "Demasiados intentos");

    try {
      await new AuthRepository().olvidePassword("ana@test.com");
      expect.unreachable("tenía que lanzar un error");
    } catch (error) {
      expect(error.status).toBe(429);
      expect(error.detalle).toBe("Demasiados intentos");
    }
  });

  test("un 401 no borra la sesión ni redirige (la ruta es pública)", async () => {
    sessionStorage.setItem("token", "token-viejo");
    respuestaConError(401, "");

    await expect(new AuthRepository().olvidePassword("ana@test.com")).rejects.toThrow();

    expect(sessionStorage.getItem("token")).toBe("token-viejo");
  });
});

describe("AuthRepository: restablecerPassword", () => {
  test("envía el token y la contraseña nueva con POST a /restablecer-password", async () => {
    const fetchFalso = respuestaCorrecta(204, "");

    await new AuthRepository().restablecerPassword("mi-token", "Nueva1234!");

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/restablecer-password`);
    expect(fetchFalso.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(fetchFalso.mock.calls[0][1].body)).toEqual({
      token: "mi-token",
      passwordNueva: "Nueva1234!",
    });
  });

  test("con 204 no intenta leer ningún JSON", async () => {
    respuestaCorrecta(204, "");

    // Si intentara leer el JSON, la respuesta falsa lanzaría un error
    await expect(new AuthRepository().restablecerPassword("t", "Nueva1234!")).resolves.toBeUndefined();
  });

  test("no envía la cabecera Authorization", async () => {
    sessionStorage.setItem("token", "token-viejo");
    const fetchFalso = respuestaCorrecta(204, "");

    await new AuthRepository().restablecerPassword("t", "Nueva1234!");

    expect(fetchFalso.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  test("con un 400 lanza un error con el mensaje del servidor", async () => {
    respuestaConError(400, "El enlace no es válido o ha caducado. Pide uno nuevo.");

    try {
      await new AuthRepository().restablecerPassword("falso", "Nueva1234!");
      expect.unreachable("tenía que lanzar un error");
    } catch (error) {
      expect(error.status).toBe(400);
      expect(error.detalle).toBe("El enlace no es válido o ha caducado. Pide uno nuevo.");
    }
  });
});
