import { describe, test, expect, vi, afterEach } from "vitest";
import CuidadorRepository from "../../repositories/CuidadorRepository";

const API = "http://localhost:8080/api/v1";

function prepararFetch(respuesta) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => respuesta,
    text: async () => "",
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});

describe("CuidadorRepository · cercanía", () => {
  test("getCerca pide las distancias del lugar con GET", async () => {
    const fetchFalso = prepararFetch({ lugarEncontrado: true, distancias: [{ cuidadorId: 2, km: 25.1 }] });
    const repository = new CuidadorRepository();

    const resultado = await repository.getCerca("Oviedo");

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/cuidadores/cerca?lugar=Oviedo`);
    expect(resultado.lugarEncontrado).toBe(true);
    expect(resultado.distancias[0].km).toBe(25.1);
  });

  test("getCerca codifica los acentos, espacios y símbolos del lugar", async () => {
    const fetchFalso = prepararFetch({ lugarEncontrado: false, distancias: [] });
    const repository = new CuidadorRepository();

    await repository.getCerca("Gijón & más");

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/cuidadores/cerca?lugar=Gij%C3%B3n%20%26%20m%C3%A1s`);
  });
});
