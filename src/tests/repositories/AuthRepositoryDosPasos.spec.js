import { describe, test, expect, vi, afterEach } from "vitest";
import AuthRepository from "../../repositories/AuthRepository";

function prepararFetch(respuesta) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({}),
    text: async () => "",
    ...respuesta,
  });
}

describe("AuthRepository · dos pasos", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  test("verificarCodigo envía el desafío y el código a /login/verificar", async () => {
    const fetchFalso = prepararFetch({
      json: async () => ({ id: 1, token: "t" }),
    });

    const datos = await new AuthRepository().verificarCodigo("desafio-1", "123456");

    expect(fetchFalso.mock.calls[0][0]).toContain("/login/verificar");
    expect(fetchFalso.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(fetchFalso.mock.calls[0][1].body)).toEqual({
      desafio: "desafio-1",
      codigo: "123456",
    });
    expect(datos).toEqual({ id: 1, token: "t" });
  });

  test("verificarCodigo lanza el error con su código si el servidor dice 400", async () => {
    prepararFetch({ ok: false, status: 400, text: async () => "El código no es válido" });

    await expect(
      new AuthRepository().verificarCodigo("d", "000000")
    ).rejects.toMatchObject({ status: 400, detalle: "El código no es válido" });
  });

  test("un 401 al verificar no borra una sesión que no existe ni cambia de página", async () => {
    sessionStorage.setItem("token", "viejo");
    prepararFetch({ ok: false, status: 401 });

    await expect(
      new AuthRepository().verificarCodigo("d", "000000")
    ).rejects.toMatchObject({ status: 401 });

    expect(sessionStorage.getItem("token")).toBe("viejo");
  });

  test("login devuelve el desafío cuando el servidor responde 202", async () => {
    prepararFetch({
      status: 202,
      json: async () => ({ requiereCodigo: true, desafio: "abc" }),
    });

    const datos = await new AuthRepository().login("ana@test.com", "1234");

    expect(datos).toEqual({ requiereCodigo: true, desafio: "abc" });
  });
});
