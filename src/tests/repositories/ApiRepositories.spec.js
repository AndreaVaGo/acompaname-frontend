import { describe, test, expect, vi, afterEach } from "vitest";
import AuthRepository from "../../repositories/AuthRepository";
import CuidadorRepository from "../../repositories/CuidadorRepository";
import PagoRepository from "../../repositories/PagoRepository";
import RoleRepository from "../../repositories/RoleRepository";
import SolicitudRepository from "../../repositories/SolicitudRepository";
import ValoracionRepository from "../../repositories/ValoracionRepository";

const API = "http://localhost:8080/api/v1";

function prepararFetch(respuesta, ok = true) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: ok,
    json: async () => respuesta,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AuthRepository", () => {
  test("login envía las credenciales y devuelve los datos con las credenciales", async () => {
    const fetchFalso = prepararFetch({ id: 1, rol: "FAMILIA" });
    const repository = new AuthRepository();

    const resultado = await repository.login("ana@test.com", "1234");

    const credenciales = btoa("ana@test.com:1234");
    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/login`);
    expect(fetchFalso.mock.calls[0][1].headers.Authorization).toBe(
      `Basic ${credenciales}`
    );
    expect(resultado.id).toBe(1);
    expect(resultado.credenciales).toBe(credenciales);
  });

  test("login lanza un error si las credenciales son incorrectas", async () => {
    prepararFetch({}, false);
    const repository = new AuthRepository();

    let mensaje = "";
    try {
      await repository.login("ana@test.com", "mal");
    } catch (error) {
      mensaje = error.message;
    }

    expect(mensaje).toBe("Credenciales incorrectas");
  });

  test("register envía el usuario con POST a /usuarios", async () => {
    const fetchFalso = prepararFetch({ id: 9 });
    const repository = new AuthRepository();
    const usuario = { nombre: "Ana" };

    const resultado = await repository.register(usuario);

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/usuarios`);
    expect(fetchFalso.mock.calls[0][1].method).toBe("POST");
    expect(resultado.id).toBe(9);
  });
});

describe("CuidadorRepository", () => {
  test("getAll pide todos los cuidadores", async () => {
    const fetchFalso = prepararFetch([{ id: 1 }]);

    await new CuidadorRepository().getAll();

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/cuidadores`);
  });

  test("getById pide un cuidador por su id", async () => {
    const fetchFalso = prepararFetch({ id: 4 });

    await new CuidadorRepository().getById(4);

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/cuidadores/4`);
  });

  test("getMiPerfil pide el perfil del cuidador logueado", async () => {
    const fetchFalso = prepararFetch({ id: 4 });

    await new CuidadorRepository().getMiPerfil();

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/cuidadores/mi-perfil`);
  });

  test("update envía los datos con PUT", async () => {
    const fetchFalso = prepararFetch({ id: 4 });

    await new CuidadorRepository().update(4, { especialidad: "Enfermería" });

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/cuidadores/4`);
    expect(fetchFalso.mock.calls[0][1].method).toBe("PUT");
  });
});

describe("PagoRepository", () => {
  test("getMisPagos pide los pagos del usuario", async () => {
    const fetchFalso = prepararFetch([]);

    await new PagoRepository().getMisPagos();

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/pagos`);
  });

  test("marcarComoPagado usa PATCH sobre el pago", async () => {
    const fetchFalso = prepararFetch({ id: 3, estado: "COMPLETADO" });

    const resultado = await new PagoRepository().marcarComoPagado(3);

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/pagos/3/pagar`);
    expect(fetchFalso.mock.calls[0][1].method).toBe("PATCH");
    expect(resultado.estado).toBe("COMPLETADO");
  });

  test("marcarComoPagado lanza un error si falla", async () => {
    prepararFetch({}, false);

    let mensaje = "";
    try {
      await new PagoRepository().marcarComoPagado(3);
    } catch (error) {
      mensaje = error.message;
    }

    expect(mensaje).toBe("Error al realizar el pago");
  });
});

describe("RoleRepository", () => {
  test("getAll pide los roles", async () => {
    const fetchFalso = prepararFetch([{ id: 4, name: "FAMILIA" }]);

    const roles = await new RoleRepository().getAll();

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/roles`);
    expect(roles[0].name).toBe("FAMILIA");
  });
});

describe("SolicitudRepository", () => {
  test("getById pide una solicitud por su id", async () => {
    const fetchFalso = prepararFetch({ id: 7 });

    await new SolicitudRepository().getById(7);

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/solicitudes/7`);
  });

  test("create envía la solicitud con POST", async () => {
    const fetchFalso = prepararFetch({ id: 8 });

    await new SolicitudRepository().create({ nombrePaciente: "Antonio" });

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/solicitudes`);
    expect(fetchFalso.mock.calls[0][1].method).toBe("POST");
  });

  test("cambiarEstado envía el nuevo estado con PATCH", async () => {
    const fetchFalso = prepararFetch({ id: 7, estado: "ACEPTADA" });

    const resultado = await new SolicitudRepository().cambiarEstado(
      7,
      "ACEPTADA"
    );

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/solicitudes/7/estado`);
    expect(fetchFalso.mock.calls[0][1].method).toBe("PATCH");
    expect(fetchFalso.mock.calls[0][1].body).toBe(
      JSON.stringify({ estado: "ACEPTADA" })
    );
    expect(resultado.estado).toBe("ACEPTADA");
  });

  test("cambiarEstado lanza un error si falla", async () => {
    prepararFetch({}, false);

    let mensaje = "";
    try {
      await new SolicitudRepository().cambiarEstado(7, "ACEPTADA");
    } catch (error) {
      mensaje = error.message;
    }

    expect(mensaje).toBe("Error al cambiar el estado");
  });

  test("getAll pide todas las solicitudes", async () => {
    const fetchFalso = prepararFetch([]);

    await new SolicitudRepository().getAll();

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/solicitudes`);
  });

  test("getMisSolicitudes pide las solicitudes del usuario", async () => {
    const fetchFalso = prepararFetch([]);

    await new SolicitudRepository().getMisSolicitudes();

    expect(fetchFalso.mock.calls[0][0]).toBe(
      `${API}/solicitudes/mis-solicitudes`
    );
  });
});

describe("ValoracionRepository", () => {
  test("getAll pide todas las valoraciones", async () => {
    const fetchFalso = prepararFetch([]);

    await new ValoracionRepository().getAll();

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/valoraciones`);
  });

  test("create envía la valoración con POST", async () => {
    const fetchFalso = prepararFetch({ id: 1 });

    await new ValoracionRepository().create({ puntuacion: 5 });

    expect(fetchFalso.mock.calls[0][0]).toBe(`${API}/valoraciones`);
    expect(fetchFalso.mock.calls[0][1].method).toBe("POST");
  });
});