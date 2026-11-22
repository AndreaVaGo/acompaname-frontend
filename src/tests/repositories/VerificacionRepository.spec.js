import { describe, test, expect, vi, afterEach } from "vitest";
import VerificacionRepository from "../../repositories/VerificacionRepository";

function prepararFetch(cuerpo = []) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => cuerpo,
    text: async () => "",
  });
}

describe("VerificacionRepository", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  test("getPublicas pide /verificaciones/publicas", async () => {
    const lista = [{ cuidadorId: 1, titulacionVerificada: true, antecedentesVerificados: false }];
    const fetchFalso = prepararFetch(lista);

    const respuesta = await new VerificacionRepository().getPublicas();

    expect(fetchFalso.mock.calls[0][0]).toMatch(/\/verificaciones\/publicas$/);
    expect(respuesta).toEqual(lista);
  });

  test("getMias pide /verificaciones/mias con el token de la sesión", async () => {
    sessionStorage.setItem("token", "mi-token");
    const fetchFalso = prepararFetch();

    await new VerificacionRepository().getMias();

    expect(fetchFalso.mock.calls[0][0]).toMatch(/\/verificaciones\/mias$/);
    expect(fetchFalso.mock.calls[0][1].headers.Authorization).toBe("Bearer mi-token");
  });

  test("enviar manda por PUT la referencia al tipo indicado", async () => {
    const fetchFalso = prepararFetch({ id: 1 });

    await new VerificacionRepository().enviar("ANTECEDENTES", "SD:ABC123");

    expect(fetchFalso.mock.calls[0][0]).toMatch(/\/verificaciones\/ANTECEDENTES$/);
    expect(fetchFalso.mock.calls[0][1].method).toBe("PUT");
    expect(JSON.parse(fetchFalso.mock.calls[0][1].body)).toEqual({ referencia: "SD:ABC123" });
  });

  test("enviar lanza el error con su código si el servidor la rechaza", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => "Esta verificación ya está comprobada",
    });

    await expect(new VerificacionRepository().enviar("TITULACION", "1")).rejects.toMatchObject({
      status: 400,
    });
  });
});
