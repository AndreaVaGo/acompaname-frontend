import { describe, test, expect } from "vitest";
import { nombreTipo, colorTipo } from "../../utils/nombreTipo";

describe("nombreTipo", () => {
  test("pone la primera letra en mayúscula", () => {
    expect(nombreTipo("hospitalario")).toBe("Hospitalario");
    expect(nombreTipo("domicilio")).toBe("Domicilio");
  });

  test("si ya empieza en mayúscula lo deja igual", () => {
    expect(nombreTipo("Hospitalario")).toBe("Hospitalario");
  });

  test("si no hay tipo devuelve un texto vacío", () => {
    expect(nombreTipo("")).toBe("");
    expect(nombreTipo(null)).toBe("");
    expect(nombreTipo(undefined)).toBe("");
  });
});

describe("colorTipo", () => {
  test("hospitalario va en azul y domicilio en verde", () => {
    expect(colorTipo("hospitalario")).toBe("azul");
    expect(colorTipo("domicilio")).toBe("verde");
  });

  test("cualquier otro tipo o vacío va en gris", () => {
    expect(colorTipo("otro")).toBe("gris");
    expect(colorTipo("")).toBe("gris");
    expect(colorTipo(null)).toBe("gris");
  });
});
