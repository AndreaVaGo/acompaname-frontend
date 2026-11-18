import { describe, test, expect, vi, afterEach } from "vitest";
import MensajeRepository from "../../repositories/MensajeRepository";

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

describe("MensajeRepository", () => {
  test("getMensajes pide toda la conversación de la solicitud con GET", async () => {
    const fetchFalso = prepararFetch([{ id: 1, texto: "Hola" }]);
    const repository = new MensajeRepository();

    const resultado = await repository.getMensajes(7);

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/solicitudes/7/mensajes`);
    expect(resultado).toHaveLength(1);
  });

  test("getMensajes con desde añade el parámetro para pedir solo los nuevos", async () => {
    const fetchFalso = prepararFetch([]);
    const repository = new MensajeRepository();

    await repository.getMensajes(7, 12);

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/solicitudes/7/mensajes?desde=12`);
  });

  test("getMensajes con desde 0 también añade el parámetro", async () => {
    const fetchFalso = prepararFetch([]);
    const repository = new MensajeRepository();

    await repository.getMensajes(7, 0);

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/solicitudes/7/mensajes?desde=0`);
  });

  test("enviar manda el texto con POST y devuelve el mensaje creado", async () => {
    const fetchFalso = prepararFetch({ id: 3, texto: "Buenas" });
    const repository = new MensajeRepository();

    const resultado = await repository.enviar(7, "Buenas");

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/solicitudes/7/mensajes`);
    expect(fetchFalso.mock.calls[0][1].method).toBe("POST");
    expect(fetchFalso.mock.calls[0][1].body).toBe(JSON.stringify({ texto: "Buenas" }));
    expect(resultado.id).toBe(3);
  });

  test("envía el token de la sesión", async () => {
    sessionStorage.setItem("token", "token-de-prueba");
    const fetchFalso = prepararFetch([]);
    const repository = new MensajeRepository();

    await repository.getMensajes(7);

    expect(fetchFalso.mock.calls[0][1].headers.Authorization).toBe("Bearer token-de-prueba");
  });

  test("lanza un error si el servidor responde con fallo", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ message: "No participas en esta solicitud" }),
      text: async () => "",
    });
    const repository = new MensajeRepository();

    await expect(repository.getMensajes(7)).rejects.toBeDefined();
  });
});
