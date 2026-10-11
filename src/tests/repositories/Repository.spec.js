import { describe, test, expect, vi, afterEach } from "vitest";
import Repository from "../../repositories/Repository";

function prepararFetch(respuesta, ok = true) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: ok,
    json: async () => respuesta,
  });
}

describe("Repository", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  test("getHeaders no incluye Authorization si no hay credenciales", () => {
    const repository = new Repository("http://prueba");

    const cabeceras = repository.getHeaders();

    expect(cabeceras["Content-Type"]).toBe("application/json");
    expect(cabeceras.Authorization).toBeUndefined();
  });

  test("getHeaders incluye Authorization si hay credenciales guardadas", () => {
    sessionStorage.setItem("credenciales", "abc123");
    const repository = new Repository("http://prueba");

    const cabeceras = repository.getHeaders();

    expect(cabeceras.Authorization).toBe("Basic abc123");
  });

  test("get pide la ruta y devuelve el JSON", async () => {
    const fetchFalso = prepararFetch([{ id: 1 }]);
    const repository = new Repository("http://prueba");

    const resultado = await repository.get("/cosas");

    expect(fetchFalso.mock.calls[0][0]).toBe("http://prueba/cosas");
    expect(resultado).toEqual([{ id: 1 }]);
  });

  test("get lanza un error si la respuesta no es correcta", async () => {
    prepararFetch({}, false);
    const repository = new Repository("http://prueba");

    let mensaje = "";
    try {
      await repository.get("/cosas");
    } catch (error) {
      mensaje = error.message;
    }

    expect(mensaje).toBe("Error en la petición GET");
  });

  test("post envía los datos con POST", async () => {
    const fetchFalso = prepararFetch({ id: 2 });
    const repository = new Repository("http://prueba");
    const datos = { nombre: "Ana" };

    const resultado = await repository.post("/cosas", datos);

    expect(fetchFalso.mock.calls[0][1].method).toBe("POST");
    expect(fetchFalso.mock.calls[0][1].body).toBe(JSON.stringify(datos));
    expect(resultado.id).toBe(2);
  });

  test("post lanza un error si la respuesta no es correcta", async () => {
    prepararFetch({}, false);
    const repository = new Repository("http://prueba");

    let mensaje = "";
    try {
      await repository.post("/cosas", {});
    } catch (error) {
      mensaje = error.message;
    }

    expect(mensaje).toBe("Error en la petición POST");
  });

  test("put envía los datos con PUT", async () => {
    const fetchFalso = prepararFetch({ id: 3 });
    const repository = new Repository("http://prueba");
    const datos = { nombre: "Luis" };

    const resultado = await repository.put("/cosas/3", datos);

    expect(fetchFalso.mock.calls[0][0]).toBe("http://prueba/cosas/3");
    expect(fetchFalso.mock.calls[0][1].method).toBe("PUT");
    expect(resultado.id).toBe(3);
  });

  test("put lanza un error si la respuesta no es correcta", async () => {
    prepararFetch({}, false);
    const repository = new Repository("http://prueba");

    let mensaje = "";
    try {
      await repository.put("/cosas/3", {});
    } catch (error) {
      mensaje = error.message;
    }

    expect(mensaje).toBe("Error en la petición PUT");
  });

  test("delete llama a la ruta con DELETE", async () => {
    const fetchFalso = prepararFetch({});
    const repository = new Repository("http://prueba");

    await repository.delete("/cosas/3");

    expect(fetchFalso.mock.calls[0][0]).toBe("http://prueba/cosas/3");
    expect(fetchFalso.mock.calls[0][1].method).toBe("DELETE");
  });

  test("delete lanza un error si la respuesta no es correcta", async () => {
    prepararFetch({}, false);
    const repository = new Repository("http://prueba");

    let mensaje = "";
    try {
      await repository.delete("/cosas/3");
    } catch (error) {
      mensaje = error.message;
    }

    expect(mensaje).toBe("Error en la petición DELETE");
  });
});