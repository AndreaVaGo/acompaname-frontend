import { describe, test, expect, vi, afterEach } from "vitest";
import AdminRepository from "../../repositories/AdminRepository";

function prepararFetch() {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => [],
    text: async () => "",
  });
}

describe("AdminRepository · verificaciones", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  test("getVerificaciones sin estado pide todas", async () => {
    const fetchFalso = prepararFetch();

    await new AdminRepository().getVerificaciones();

    expect(fetchFalso.mock.calls[0][0]).toMatch(/\/admin\/verificaciones$/);
  });

  test("getVerificaciones con estado lo manda en la dirección", async () => {
    const fetchFalso = prepararFetch();

    await new AdminRepository().getVerificaciones("PENDIENTE");

    expect(fetchFalso.mock.calls[0][0]).toMatch(/\/admin\/verificaciones\?estado=PENDIENTE$/);
  });

  test("resolverVerificacion manda por PUT si se aprueba y el motivo", async () => {
    const fetchFalso = prepararFetch();

    await new AdminRepository().resolverVerificacion(7, false, "No existe");

    expect(fetchFalso.mock.calls[0][0]).toMatch(/\/admin\/verificaciones\/7$/);
    expect(fetchFalso.mock.calls[0][1].method).toBe("PUT");
    expect(JSON.parse(fetchFalso.mock.calls[0][1].body)).toEqual({
      aprobar: false,
      motivo: "No existe",
    });
  });
});
