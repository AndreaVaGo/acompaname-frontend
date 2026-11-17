import { describe, test, expect } from "vitest";
import { nombreTipo } from "../../utils/nombreTipo";

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
