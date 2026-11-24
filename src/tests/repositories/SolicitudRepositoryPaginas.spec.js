import { describe, test, expect, vi, afterEach } from "vitest";
import SolicitudRepository from "../../repositories/SolicitudRepository";

const API = "http://localhost:8080/api/v1";

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});

describe("SolicitudRepository por páginas", () => {
  test("getMisSolicitudesPaginadas pide la página y el tamaño indicados", async () => {
    const fetchFalso = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ contenido: [], pagina: 2, tamano: 5, totalElementos: 11, totalPaginas: 3 }),
      text: async () => "",
    });

    const resultado = await new SolicitudRepository().getMisSolicitudesPaginadas(2, 5);

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/solicitudes/mis-solicitudes/pagina?page=2&size=5`);
    expect(resultado.totalPaginas).toBe(3);
  });

  test("sin datos pide la primera página de veinte", async () => {
    const fetchFalso = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ contenido: [] }),
      text: async () => "",
    });

    await new SolicitudRepository().getMisSolicitudesPaginadas();

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/solicitudes/mis-solicitudes/pagina?page=0&size=20`);
  });
});
