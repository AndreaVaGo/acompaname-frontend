import { describe, test, expect } from "vitest";
import {
  erroresDelServidor,
  primerCampoConError,
  hayErrores,
} from "../../utils/erroresDeCampos";

// Un error como el que lanza Repository: con código HTTP y el texto del servidor
function errorHttp(status, detalle = "") {
  const error = new Error("Error en la petición");
  error.status = status;
  error.detalle = detalle;
  return error;
}

describe("erroresDelServidor", () => {
  test("convierte el JSON de un 400 en un mapa campo -> mensaje", () => {
    const error = errorHttp(
      400,
      '{"fechaCuidado":"La fecha del cuidado no puede estar en el pasado","horaFin":"La hora de fin no puede ser nula"}',
    );

    expect(erroresDelServidor(error)).toEqual({
      fechaCuidado: "La fecha del cuidado no puede estar en el pasado",
      horaFin: "La hora de fin no puede ser nula",
    });
  });

  test("usa traducirCampo para cambiar el nombre del campo", () => {
    const error = errorHttp(400, '{"fechaCuidado":"Mal"}');
    const traducir = (campo) => (campo === "fechaCuidado" ? "fechaInicio" : campo);

    expect(erroresDelServidor(error, traducir)).toEqual({ fechaInicio: "Mal" });
  });

  test("si dos campos del servidor acaban en el mismo, se queda el primero", () => {
    const error = errorHttp(400, '{"a":"Primero","b":"Segundo"}');

    expect(erroresDelServidor(error, () => "campo")).toEqual({ campo: "Primero" });
  });

  test("ignora lo que no es un mensaje de texto", () => {
    const error = errorHttp(400, '{"a":"Bien","b":5,"c":"","d":null}');

    expect(erroresDelServidor(error)).toEqual({ a: "Bien" });
  });

  test("devuelve {} si el texto del servidor no es un JSON", () => {
    const error = errorHttp(400, "El cuerpo de la petición no es válido");

    expect(erroresDelServidor(error)).toEqual({});
  });

  test("devuelve {} si el JSON es una lista o un número", () => {
    expect(erroresDelServidor(errorHttp(400, '["a","b"]'))).toEqual({});
    expect(erroresDelServidor(errorHttp(400, "5"))).toEqual({});
    expect(erroresDelServidor(errorHttp(400, "null"))).toEqual({});
  });

  test("devuelve {} si no es un 400", () => {
    expect(erroresDelServidor(errorHttp(409, '{"a":"Hola"}'))).toEqual({});
    expect(erroresDelServidor(errorHttp(500, '{"a":"Hola"}'))).toEqual({});
  });

  test("devuelve {} si no hay error o no trae texto", () => {
    expect(erroresDelServidor(undefined)).toEqual({});
    expect(erroresDelServidor(null)).toEqual({});
    expect(erroresDelServidor(errorHttp(400, ""))).toEqual({});
  });
});

describe("primerCampoConError", () => {
  const orden = ["grupoEdad", "tipoCuidado", "fechaInicio", "horaInicio"];

  test("devuelve el primero según el orden de la pantalla, no el del mapa", () => {
    const errores = { horaInicio: "Falta", fechaInicio: "Falta" };

    expect(primerCampoConError(errores, orden)).toBe("fechaInicio");
  });

  test("devuelve un texto vacío si ningún campo tiene error", () => {
    expect(primerCampoConError({}, orden)).toBe("");
  });

  test("ignora los errores de campos que no están en el orden", () => {
    expect(primerCampoConError({ otro: "Falta" }, orden)).toBe("");
  });
});

describe("hayErrores", () => {
  test("es true solo si el mapa tiene algún error", () => {
    expect(hayErrores({})).toBe(false);
    expect(hayErrores({ a: "Falta" })).toBe(true);
  });
});
