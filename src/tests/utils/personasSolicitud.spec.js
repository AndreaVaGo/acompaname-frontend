import { describe, test, expect } from "vitest";
import {
  listaDePersonas,
  nombresDePersonas,
  resumenDePersonas,
  detalleDePersonas,
  hayVariasPersonas,
} from "../../utils/personasSolicitud";

const matrimonio = {
  personas: [
    { nombre: "Carmen", edad: 82 },
    { nombre: "Antonio", edad: 85 },
  ],
};
const tres = {
  personas: [
    { nombre: "Zoe", edad: 5 },
    { nombre: "Ada", edad: 9 },
    { nombre: "Leo", edad: 2 },
  ],
};
const antigua = { nombrePaciente: "Manuel", edadPaciente: 80 };

describe("personasSolicitud", () => {
  test("una solicitud con lista devuelve esa lista", () => {
    expect(listaDePersonas(matrimonio)).toHaveLength(2);
  });

  test("una solicitud antigua cuenta como una sola persona", () => {
    expect(listaDePersonas(antigua)).toEqual([{ nombre: "Manuel", edad: 80 }]);
  });

  test("una lista vacía usa el nombre y la edad sueltos", () => {
    const solicitud = { ...antigua, personas: [] };

    expect(listaDePersonas(solicitud)).toHaveLength(1);
  });

  test("sin datos devuelve una lista vacía", () => {
    expect(listaDePersonas({})).toEqual([]);
    expect(listaDePersonas(null)).toEqual([]);
    expect(listaDePersonas(undefined)).toEqual([]);
  });

  test("los nombres de una persona van solos", () => {
    expect(nombresDePersonas(antigua)).toBe("Manuel");
  });

  test("los nombres de dos personas van unidos con 'y'", () => {
    expect(nombresDePersonas(matrimonio)).toBe("Carmen y Antonio");
  });

  test("los nombres de tres personas van con comas y 'y' al final", () => {
    expect(nombresDePersonas(tres)).toBe("Zoe, Ada y Leo");
  });

  test("los nombres sin datos son un texto vacío", () => {
    expect(nombresDePersonas({})).toBe("");
  });

  test("el resumen enseña cada nombre con su edad", () => {
    expect(resumenDePersonas(matrimonio)).toBe("Carmen (82), Antonio (85)");
  });

  test("el resumen no enseña la edad si no se sabe", () => {
    const solicitud = { personas: [{ nombre: "Carmen" }] };

    expect(resumenDePersonas(solicitud)).toBe("Carmen");
  });

  test("el resumen enseña la edad 0 de un bebé", () => {
    const solicitud = { personas: [{ nombre: "Lucía", edad: 0 }] };

    expect(resumenDePersonas(solicitud)).toBe("Lucía (0)");
  });

  test("el detalle de una persona es 'Nombre, N años'", () => {
    expect(detalleDePersonas(antigua)).toBe("Manuel, 80 años");
  });

  test("el detalle de varias personas pone los años entre paréntesis", () => {
    expect(detalleDePersonas(matrimonio)).toBe(
      "Carmen (82 años), Antonio (85 años)",
    );
  });

  test("hayVariasPersonas distingue una de varias", () => {
    expect(hayVariasPersonas(antigua)).toBe(false);
    expect(hayVariasPersonas(matrimonio)).toBe(true);
    expect(hayVariasPersonas({})).toBe(false);
  });
});
