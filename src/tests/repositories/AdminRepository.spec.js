import { describe, test, expect, vi, afterEach } from "vitest";
import AdminRepository from "../../repositories/AdminRepository";

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
});

describe("AdminRepository", () => {
  test("getEstadisticas pide las estadísticas", async () => {
    const fetchFalso = prepararFetch({ totalFamilias: 10 });
    const repository = new AdminRepository();

    const resultado = await repository.getEstadisticas();

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/admin/estadisticas`);
    expect(resultado.totalFamilias).toBe(10);
  });

  test("getAvisos pide los avisos", async () => {
    const fetchFalso = prepararFetch({ pendientesVencidas: 1 });
    const repository = new AdminRepository();

    const resultado = await repository.getAvisos();

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/admin/avisos`);
    expect(resultado.pendientesVencidas).toBe(1);
  });

  test("getMejoresCuidadores pide los cuidadores mejor valorados", async () => {
    const fetchFalso = prepararFetch([{ id: 1, nombre: "Pepe" }]);
    const repository = new AdminRepository();

    const resultado = await repository.getMejoresCuidadores();

    expect(fetchFalso.mock.calls[0][0]).toBe(
      `${API}/admin/cuidadores/mejor-valorados`
    );
    expect(resultado[0].nombre).toBe("Pepe");
  });

  test("getUltimasValoraciones pide las últimas valoraciones", async () => {
    const fetchFalso = prepararFetch([{ id: 2 }]);
    const repository = new AdminRepository();

    const resultado = await repository.getUltimasValoraciones();

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/admin/valoraciones/ultimas`);
    expect(resultado[0].id).toBe(2);
  });

  test("borrarValoracion borra la valoración con DELETE", async () => {
    const fetchFalso = prepararFetch({});
    const repository = new AdminRepository();

    await repository.borrarValoracion(7);

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/admin/valoraciones/7`);
    expect(fetchFalso.mock.calls[0][1].method).toBe("DELETE");
  });

  test("getUsuarios pide la lista de usuarios", async () => {
    const fetchFalso = prepararFetch([{ id: 1, nombre: "Ana" }]);
    const repository = new AdminRepository();

    const resultado = await repository.getUsuarios();

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/admin/usuarios`);
    expect(resultado[0].nombre).toBe("Ana");
  });

  test("cambiarActivo envía el nuevo valor con PATCH", async () => {
    const fetchFalso = prepararFetch({ id: 4, activo: false });
    const repository = new AdminRepository();

    const resultado = await repository.cambiarActivo(4, false);

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/admin/usuarios/4/activo`);
    expect(fetchFalso.mock.calls[0][1].method).toBe("PATCH");
    expect(fetchFalso.mock.calls[0][1].body).toBe(JSON.stringify({ activo: false }));
    expect(resultado.activo).toBe(false);
  });

  test("getSolicitudes sin estado pide todas las solicitudes", async () => {
    const fetchFalso = prepararFetch([]);
    const repository = new AdminRepository();

    await repository.getSolicitudes();

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/admin/solicitudes`);
  });

  test("getSolicitudes con estado pide solo las de ese estado", async () => {
    const fetchFalso = prepararFetch([]);
    const repository = new AdminRepository();

    await repository.getSolicitudes("PENDIENTE");

    expect(fetchFalso.mock.calls[0][0]).toBe(
      `${API}/admin/solicitudes?estado=PENDIENTE`
    );
  });

  test("si el servidor responde con error, el repositorio lanza el error con su código", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({}),
      text: async () => "Access denied",
    });
    const repository = new AdminRepository();

    let error = null;
    try {
      await repository.getEstadisticas();
    } catch (e) {
      error = e;
    }

    expect(error.status).toBe(403);
    expect(error.detalle).toBe("Access denied");
  });
});