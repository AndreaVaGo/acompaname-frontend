import { describe, test, expect, vi, afterEach } from "vitest";
import Repository from "../../repositories/Repository";

function prepararFetch(respuesta, ok = true) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: ok,
    json: async () => respuesta,
  });
}

// Una respuesta de error del servidor, con su código y su mensaje en texto
function prepararFetchConError(status, texto) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: false,
    status: status,
    json: async () => ({}),
    text: async () => texto,
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

  test("get lanza un error con el código y el mensaje que explica el servidor", async () => {
    prepararFetchConError(404, "Solicitud no encontrada. Id 9 no existe.");
    const repository = new Repository("http://prueba");

    let error = null;
    try {
      await repository.get("/cosas/9");
    } catch (e) {
      error = e;
    }

    expect(error.message).toBe("Error en la petición GET");
    expect(error.status).toBe(404);
    expect(error.detalle).toBe("Solicitud no encontrada. Id 9 no existe.");
  });

  test("post lanza un error con el código y el mensaje que explica el servidor", async () => {
    prepararFetchConError(409, "El email ya está registrado");
    const repository = new Repository("http://prueba");

    let error = null;
    try {
      await repository.post("/cosas", {});
    } catch (e) {
      error = e;
    }

    expect(error.status).toBe(409);
    expect(error.detalle).toBe("El email ya está registrado");
  });

  test("put lanza un error con el código y el mensaje que explica el servidor", async () => {
    prepararFetchConError(403, "No tiene permiso para acceder a esta cosa");
    const repository = new Repository("http://prueba");

    let error = null;
    try {
      await repository.put("/cosas/3", {});
    } catch (e) {
      error = e;
    }

    expect(error.status).toBe(403);
    expect(error.detalle).toBe("No tiene permiso para acceder a esta cosa");
  });

  test("delete lanza un error con el código y el mensaje que explica el servidor", async () => {
    prepararFetchConError(500, "Error interno del servidor");
    const repository = new Repository("http://prueba");

    let error = null;
    try {
      await repository.delete("/cosas/3");
    } catch (e) {
      error = e;
    }

    expect(error.status).toBe(500);
    expect(error.detalle).toBe("Error interno del servidor");
  });

  test("si la respuesta de error no tiene cuerpo, el error se queda sin detalle", async () => {
    // prepararFetch no define text(), como una respuesta sin cuerpo que se pueda leer
    prepararFetch({}, false);
    const repository = new Repository("http://prueba");

    let error = null;
    try {
      await repository.get("/cosas");
    } catch (e) {
      error = e;
    }

    expect(error.message).toBe("Error en la petición GET");
    expect(error.detalle).toBe("");
  });
});