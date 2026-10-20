import { describe, test, expect } from "vitest";
import { mensajeDeError } from "../../utils/mensajeDeError";

const CONTEXTO = "No se pudo enviar la solicitud.";

// Un error como el que lanza Repository: con código HTTP y, a veces, el texto del servidor
function errorHttp(status, detalle = "") {
  const error = new Error("Error en la petición");
  error.status = status;
  error.detalle = detalle;
  return error;
}

describe("mensajeDeError", () => {
  test("400 dice que los datos no son correctos", () => {
    expect(mensajeDeError(errorHttp(400), CONTEXTO)).toBe(
      "No se pudo enviar la solicitud. Los datos enviados no son correctos.",
    );
  });

  test("400 dice lo mismo aunque el servidor envíe un texto", () => {
    const error = errorHttp(400, '{"email":"Email no válido"}');

    expect(mensajeDeError(error, CONTEXTO)).toBe(
      "No se pudo enviar la solicitud. Los datos enviados no son correctos.",
    );
  });

  test("401 dice que la sesión ha caducado", () => {
    expect(mensajeDeError(errorHttp(401), CONTEXTO)).toBe(
      "No se pudo enviar la solicitud. Tu sesión ha caducado. Vuelve a iniciar sesión.",
    );
  });

  test("403 dice que no se tiene permiso", () => {
    expect(mensajeDeError(errorHttp(403), CONTEXTO)).toBe(
      "No se pudo enviar la solicitud. No tienes permiso para hacer esto.",
    );
  });

  test("404 dice que no se ha encontrado", () => {
    expect(mensajeDeError(errorHttp(404), CONTEXTO)).toBe(
      "No se pudo enviar la solicitud. No se ha encontrado lo que buscas.",
    );
  });

  test("409 con un texto del servidor lo enseña", () => {
    const error = errorHttp(
      409,
      "Ya tienes otro servicio aceptado en esas fechas",
    );

    expect(mensajeDeError(error, CONTEXTO)).toBe(
      "No se pudo enviar la solicitud. Ya tienes otro servicio aceptado en esas fechas.",
    );
  });

  test("409 sin texto del servidor dice que hay un conflicto", () => {
    expect(mensajeDeError(errorHttp(409), CONTEXTO)).toBe(
      "No se pudo enviar la solicitud. Esta acción entra en conflicto con otra ya existente.",
    );
  });

  test("500 y otros errores del servidor dicen que falló el servidor", () => {
    const esperado =
      "No se pudo enviar la solicitud. Ha ocurrido un error en el servidor. Inténtalo más tarde.";

    expect(mensajeDeError(errorHttp(500), CONTEXTO)).toBe(esperado);
    expect(mensajeDeError(errorHttp(503), CONTEXTO)).toBe(esperado);
  });

  test("si no se llega al servidor (TypeError sin código) dice que no hay conexión", () => {
    const error = new TypeError("Failed to fetch");

    expect(mensajeDeError(error, CONTEXTO)).toBe(
      "No se pudo enviar la solicitud. No se pudo conectar con el servidor.",
    );
  });

  test("un error cualquiera sin código deja solo el contexto", () => {
    expect(mensajeDeError(new Error("fallo"), CONTEXTO)).toBe(CONTEXTO);
  });

  test("sin contexto devuelve solo el motivo", () => {
    expect(mensajeDeError(errorHttp(404))).toBe(
      "No se ha encontrado lo que buscas.",
    );
  });

  test("si no llega ningún error devuelve solo el contexto", () => {
    expect(mensajeDeError(undefined, CONTEXTO)).toBe(CONTEXTO);
  });
});