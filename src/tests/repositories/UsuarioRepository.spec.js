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
});