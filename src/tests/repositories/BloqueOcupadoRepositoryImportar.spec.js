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

describe("BloqueOcupadoRepository · importar", () => {
  test("importar manda POST /bloques-ocupados/importar con el texto del archivo", async () => {
    const fetchFalso = prepararFetch({ importados: 2, duplicados: 0, omitidos: 1 });
    const repository = new BloqueOcupadoRepository();

    const resultado = await repository.importar("BEGIN:VCALENDAR\nEND:VCALENDAR");

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/bloques-ocupados/importar`);
    expect(fetchFalso.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(fetchFalso.mock.calls[0][1].body)).toEqual({
      contenido: "BEGIN:VCALENDAR\nEND:VCALENDAR",
    });
    expect(resultado).toEqual({ importados: 2, duplicados: 0, omitidos: 1 });
  });

  test("importar envía el token de la sesión", async () => {
    sessionStorage.setItem("token", "token-de-prueba");
    const fetchFalso = prepararFetch({ importados: 0, duplicados: 0, omitidos: 0 });
    const repository = new BloqueOcupadoRepository();

    await repository.importar("BEGIN:VCALENDAR");

    expect(fetchFalso.mock.calls[0][1].headers.Authorization).toBe("Bearer token-de-prueba");
  });
});
