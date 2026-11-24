import { describe, test, expect, vi, afterEach } from "vitest";
import FichajeRepository from "../../repositories/FichajeRepository";

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

describe("FichajeRepository", () => {
  test("getConfiguracion pide /fichajes/configuracion", async () => {
    const fetchFalso = prepararFetch({ verificarLugar: true });

    const resultado = await new FichajeRepository().getConfiguracion();

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/fichajes/configuracion`);
    expect(resultado.verificarLugar).toBe(true);
  });

  test("getFichajes pide los fichajes de la solicitud", async () => {
    const fetchFalso = prepararFetch([{ id: 1, tipo: "INICIO" }]);

    const resultado = await new FichajeRepository().getFichajes(7);

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/fichajes/7`);
    expect(resultado).toHaveLength(1);
  });

  test("empezar envía la ubicación con POST a /inicio", async () => {
    const fetchFalso = prepararFetch({ id: 1, tipo: "INICIO" });

    await new FichajeRepository().empezar(7, { latitud: 43.5, longitud: -5.6 });

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/fichajes/7/inicio`);
    expect(fetchFalso.mock.calls[0][1].method).toBe("POST");
    expect(fetchFalso.mock.calls[0][1].body).toBe(
      JSON.stringify({ latitud: 43.5, longitud: -5.6 }),
    );
  });

  test("terminar sin ubicación envía un cuerpo vacío a /fin", async () => {
    const fetchFalso = prepararFetch({ id: 2, tipo: "FIN" });

    await new FichajeRepository().terminar(7);

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/fichajes/7/fin`);
    expect(fetchFalso.mock.calls[0][1].body).toBe("{}");
  });

  test("lanza un error con el código si el servidor responde con fallo", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({}),
      text: async () => "Ya has empezado este servicio",
    });

    await expect(new FichajeRepository().empezar(7)).rejects.toMatchObject({
      status: 409,
    });
  });
});
