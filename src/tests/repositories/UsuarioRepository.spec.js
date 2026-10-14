import { describe, test, expect, vi, afterEach } from "vitest";
import UsuarioRepository from "../../repositories/UsuarioRepository";

function prepararFetch(respuesta) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => respuesta,
  });
}

describe("UsuarioRepository", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("getById pide el usuario al backend", async () => {
    const fetchFalso = prepararFetch({ id: 5, nombre: "Ana" });
    const repository = new UsuarioRepository();

    const usuario = await repository.getById(5);

    expect(fetchFalso.mock.calls[0][0]).toBe(
      "http://localhost:8080/api/v1/usuarios/5"
    );
    expect(usuario.nombre).toBe("Ana");
  });

  test("update envía los datos con PUT", async () => {
    const fetchFalso = prepararFetch({ id: 5, nombre: "Ana Pérez" });
    const repository = new UsuarioRepository();
    const datos = { nombre: "Ana Pérez" };

    const usuario = await repository.update(5, datos);

    expect(fetchFalso.mock.calls[0][0]).toBe(
      "http://localhost:8080/api/v1/usuarios/5"
    );
    expect(fetchFalso.mock.calls[0][1].method).toBe("PUT");
    expect(fetchFalso.mock.calls[0][1].body).toBe(JSON.stringify(datos));
    expect(usuario.nombre).toBe("Ana Pérez");
  });

  test("cambiarPassword envía las dos contraseñas con PATCH", async () => {
    const fetchFalso = prepararFetch({});
    const repository = new UsuarioRepository();

    await repository.cambiarPassword(5, "actual1234", "nueva12345");

    expect(fetchFalso.mock.calls[0][0]).toBe(
      "http://localhost:8080/api/v1/usuarios/5/password"
    );
    expect(fetchFalso.mock.calls[0][1].method).toBe("PATCH");
    expect(fetchFalso.mock.calls[0][1].body).toBe(
      JSON.stringify({
        passwordActual: "actual1234",
        passwordNueva: "nueva12345",
      })
    );
  });

  test("cambiarPassword lanza un error si el backend responde con fallo", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false });
    const repository = new UsuarioRepository();

    let mensaje = "";
    try {
      await repository.cambiarPassword(5, "mala", "nueva12345");
    } catch (error) {
      mensaje = error.message;
    }

    expect(mensaje).toBe("Error al cambiar la contraseña");
  });

  test("actualizarContacto envía nombre, email y teléfono con PATCH", async () => {
    const fetchFalso = prepararFetch({ id: 5, nombre: "Ana Nueva" });
    const repository = new UsuarioRepository();

    const usuario = await repository.actualizarContacto(
      5,
      "Ana Nueva",
      "nueva@test.com",
      "699000111"
    );

    expect(fetchFalso.mock.calls[0][0]).toBe(
      "http://localhost:8080/api/v1/usuarios/5/contacto"
    );
    expect(fetchFalso.mock.calls[0][1].method).toBe("PATCH");
    expect(fetchFalso.mock.calls[0][1].body).toBe(
      JSON.stringify({
        nombre: "Ana Nueva",
        email: "nueva@test.com",
        telefono: "699000111",
      })
    );
    expect(usuario.nombre).toBe("Ana Nueva");
  });

  test("actualizarContacto lanza un error si el backend responde con fallo", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false });
    const repository = new UsuarioRepository();

    let mensaje = "";
    try {
      await repository.actualizarContacto(5, "Ana", "repetido@test.com", "600");
    } catch (error) {
      mensaje = error.message;
    }

    expect(mensaje).toBe("Error al actualizar los datos");
  });
});