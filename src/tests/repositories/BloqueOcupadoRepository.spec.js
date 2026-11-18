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

describe("BloqueOcupadoRepository", () => {
  test("getMios pide GET /bloques-ocupados y devuelve la lista", async () => {
    const fetchFalso = prepararFetch([{ id: 1, fecha: "2026-12-01" }]);
    const repository = new BloqueOcupadoRepository();

    const resultado = await repository.getMios();

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/bloques-ocupados`);
    expect(resultado).toEqual([{ id: 1, fecha: "2026-12-01" }]);
  });

  test("getMios envía el token de la sesión", async () => {
    sessionStorage.setItem("token", "token-de-prueba");
    const fetchFalso = prepararFetch([]);
    const repository = new BloqueOcupadoRepository();

    await repository.getMios();

    expect(fetchFalso.mock.calls[0][1].headers.Authorization).toBe("Bearer token-de-prueba");
  });

  test("create envía el bloque con POST a /bloques-ocupados", async () => {
    const fetchFalso = prepararFetch({ id: 5 }, 201);
    const repository = new BloqueOcupadoRepository();
    const bloque = { fecha: "2026-12-01", horaInicio: "08:00", horaFin: "15:00", motivo: "Turno" };

    const resultado = await repository.create(bloque);

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/bloques-ocupados`);
    expect(fetchFalso.mock.calls[0][1].method).toBe("POST");
    expect(fetchFalso.mock.calls[0][1].body).toBe(JSON.stringify(bloque));
    expect(resultado.id).toBe(5);
  });

  test("remove pide DELETE a /bloques-ocupados/{id}", async () => {
    const fetchFalso = prepararFetch(null, 204);
    const repository = new BloqueOcupadoRepository();

    await repository.remove(7);

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/bloques-ocupados/7`);
    expect(fetchFalso.mock.calls[0][1].method).toBe("DELETE");
  });

  test("getMios lanza un error con el código si el servidor responde con fallo", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({}),
      text: async () => "",
    });
    const repository = new BloqueOcupadoRepository();

    await expect(repository.getMios()).rejects.toMatchObject({ status: 403 });
  });

  test("create lanza un error con el código y el detalle si el servidor responde 400", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({}),
      text: async () => "La fecha no puede estar en el pasado",
    });
    const repository = new BloqueOcupadoRepository();

    await expect(repository.create({})).rejects.toMatchObject({
      status: 400,
      detalle: "La fecha no puede estar en el pasado",
    });
  });
});
