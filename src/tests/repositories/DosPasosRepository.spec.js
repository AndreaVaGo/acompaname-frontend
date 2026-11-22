import { describe, test, expect, vi, afterEach } from "vitest";
import DosPasosRepository from "../../repositories/DosPasosRepository";

function prepararFetch(respuesta) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ activo: true }),
    text: async () => "",
    ...respuesta,
  });
}

describe("DosPasosRepository", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  test("getEstado pide /dos-pasos con el token de la sesión", async () => {
    sessionStorage.setItem("token", "mi-token");
    const fetchFalso = prepararFetch();

    const estado = await new DosPasosRepository().getEstado();

    expect(fetchFalso.mock.calls[0][0]).toMatch(/\/dos-pasos$/);
    expect(fetchFalso.mock.calls[0][1].headers.Authorization).toBe("Bearer mi-token");
    expect(estado).toEqual({ activo: true });
  });

  test("cambiar envía por PUT si se activa y la contraseña", async () => {
    const fetchFalso = prepararFetch();

    await new DosPasosRepository().cambiar(true, "Clave123!");

    expect(fetchFalso.mock.calls[0][0]).toMatch(/\/dos-pasos$/);
    expect(fetchFalso.mock.calls[0][1].method).toBe("PUT");
    expect(JSON.parse(fetchFalso.mock.calls[0][1].body)).toEqual({
      activo: true,
      password: "Clave123!",
    });
  });

  test("cambiar lanza el error con su código si la contraseña no vale", async () => {
    prepararFetch({ ok: false, status: 400, text: async () => "La contraseña no es correcta" });

    await expect(new DosPasosRepository().cambiar(true, "mala")).rejects.toMatchObject({
      status: 400,
    });
  });
});
