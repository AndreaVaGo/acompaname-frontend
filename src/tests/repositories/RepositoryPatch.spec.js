import { describe, test, expect, vi, afterEach } from "vitest";
import Repository from "../../repositories/Repository";

describe("Repository patch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("patch envía los datos con PATCH y devuelve el JSON", async () => {
    const fetchFalso = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ id: 3, activo: false }),
    });
    const repository = new Repository("http://prueba");
    const datos = { activo: false };

    const resultado = await repository.patch("/cosas/3/activo", datos);

    expect(fetchFalso.mock.calls[0][0]).toBe("http://prueba/cosas/3/activo");
    expect(fetchFalso.mock.calls[0][1].method).toBe("PATCH");
    expect(fetchFalso.mock.calls[0][1].body).toBe(JSON.stringify(datos));
    expect(resultado.activo).toBe(false);
  });

  test("patch lanza un error con el código y el mensaje del servidor", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({}),
      text: async () => "El administrador no puede bloquearse a sí mismo",
    });
    const repository = new Repository("http://prueba");

    let error = null;
    try {
      await repository.patch("/cosas/3/activo", {});
    } catch (e) {
      error = e;
    }

    expect(error.message).toBe("Error en la petición PATCH");
    expect(error.status).toBe(403);
    expect(error.detalle).toBe("El administrador no puede bloquearse a sí mismo");
  });
});