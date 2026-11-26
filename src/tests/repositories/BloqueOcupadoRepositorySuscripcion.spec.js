import { describe, test, expect, vi, afterEach } from "vitest";
import BloqueOcupadoRepository from "../../repositories/BloqueOcupadoRepository";

const API = "http://localhost:8080/api/v1";

function prepararFetch(respuesta, status = 200) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    status: status,
    json: async () => respuesta,
    text: async () => "",
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});

describe("BloqueOcupadoRepository · calendario sincronizado", () => {
  test("getSuscripcion manda GET /bloques-ocupados/suscripcion", async () => {
    const fetchFalso = prepararFetch({ vinculado: false });
    const repository = new BloqueOcupadoRepository();

    const estado = await repository.getSuscripcion();

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/bloques-ocupados/suscripcion`);
    expect(estado).toEqual({ vinculado: false });
  });

  test("vincularCalendario manda PUT con la dirección", async () => {
    const fetchFalso = prepararFetch({ vinculado: true });
    const repository = new BloqueOcupadoRepository();

    const estado = await repository.vincularCalendario("https://calendar.google.com/x.ics");

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/bloques-ocupados/suscripcion`);
    expect(fetchFalso.mock.calls[0][1].method).toBe("PUT");
    expect(JSON.parse(fetchFalso.mock.calls[0][1].body)).toEqual({ url: "https://calendar.google.com/x.ics" });
    expect(estado).toEqual({ vinculado: true });
  });

  test("sincronizarCalendario manda POST /sincronizar", async () => {
    const fetchFalso = prepararFetch({ vinculado: true, ultimoError: null });
    const repository = new BloqueOcupadoRepository();

    await repository.sincronizarCalendario();

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/bloques-ocupados/suscripcion/sincronizar`);
    expect(fetchFalso.mock.calls[0][1].method).toBe("POST");
  });

  test("desvincularCalendario manda DELETE", async () => {
    const fetchFalso = prepararFetch(null, 204);
    const repository = new BloqueOcupadoRepository();

    await repository.desvincularCalendario();

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/bloques-ocupados/suscripcion`);
    expect(fetchFalso.mock.calls[0][1].method).toBe("DELETE");
  });

  test("envía el token de la sesión", async () => {
    sessionStorage.setItem("token", "token-de-prueba");
    const fetchFalso = prepararFetch({ vinculado: false });
    const repository = new BloqueOcupadoRepository();

    await repository.getSuscripcion();

    expect(fetchFalso.mock.calls[0][1].headers.Authorization).toBe("Bearer token-de-prueba");
  });
});
