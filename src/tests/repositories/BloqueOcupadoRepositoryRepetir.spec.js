import { describe, test, expect, vi, afterEach } from "vitest";
import BloqueOcupadoRepository from "../../repositories/BloqueOcupadoRepository";

const API = "http://localhost:8080/api/v1";

function prepararFetch(respuesta, status = 201) {
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

describe("BloqueOcupadoRepository · repetir", () => {
  const datos = {
    desde: "2026-12-14",
    hasta: "2026-12-31",
    diasSemana: ["MONDAY", "TUESDAY"],
    horaInicio: "07:00",
    horaFin: "15:00",
    motivo: "Turno de mañana",
  };

  test("repetir manda POST /bloques-ocupados/repetir con los datos tal cual", async () => {
    const fetchFalso = prepararFetch({ creados: 6, duplicados: 0 });
    const repository = new BloqueOcupadoRepository();

    const resultado = await repository.repetir(datos);

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/bloques-ocupados/repetir`);
    expect(fetchFalso.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(fetchFalso.mock.calls[0][1].body)).toEqual(datos);
    expect(resultado).toEqual({ creados: 6, duplicados: 0 });
  });

  test("repetir envía el token de la sesión", async () => {
    sessionStorage.setItem("token", "token-de-prueba");
    const fetchFalso = prepararFetch({ creados: 0, duplicados: 0 });
    const repository = new BloqueOcupadoRepository();

    await repository.repetir(datos);

    expect(fetchFalso.mock.calls[0][1].headers.Authorization).toBe("Bearer token-de-prueba");
  });

  test("si el servidor da un error, repetir lo lanza con su código", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({}),
      text: async () => "La fecha de inicio no puede estar en el pasado",
    });
    const repository = new BloqueOcupadoRepository();

    await expect(repository.repetir(datos)).rejects.toMatchObject({ status: 400 });
  });
});
