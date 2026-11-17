import { describe, test, expect, vi, afterEach } from "vitest";
import SugerenciaRepository from "../../repositories/SugerenciaRepository";

const API = "http://localhost:8080/api/v1";

function prepararFetch(respuesta) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    status: 201,
    json: async () => respuesta,
    text: async () => "",
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});

describe("SugerenciaRepository", () => {
  test("create envía el texto con POST a /sugerencias y devuelve la sugerencia", async () => {
    const fetchFalso = prepararFetch({ id: 1, texto: "Más colores" });
    const repository = new SugerenciaRepository();

    const resultado = await repository.create("Más colores");

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/sugerencias`);
    expect(fetchFalso.mock.calls[0][1].method).toBe("POST");
    expect(fetchFalso.mock.calls[0][1].body).toBe(JSON.stringify({ texto: "Más colores" }));
    expect(resultado.id).toBe(1);
  });

  test("create envía el token de la sesión", async () => {
    sessionStorage.setItem("token", "token-de-prueba");
    const fetchFalso = prepararFetch({ id: 1 });
    const repository = new SugerenciaRepository();

    await repository.create("Hola");

    expect(fetchFalso.mock.calls[0][1].headers.Authorization).toBe("Bearer token-de-prueba");
  });

  test("create lanza un error con el código si el servidor responde con fallo", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({}),
      text: async () => "",
    });
    const repository = new SugerenciaRepository();

    await expect(repository.create("Hola")).rejects.toMatchObject({ status: 429 });
  });
});
