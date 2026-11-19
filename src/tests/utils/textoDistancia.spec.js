import { describe, test, expect } from "vitest";
import { textoDistancia } from "../../utils/textoDistancia";

describe("textoDistancia", () => {
  test("menos de 1 km es la misma zona", () => {
    expect(textoDistancia(0)).toBe("En tu zona");
    expect(textoDistancia(0.4)).toBe("En tu zona");
  });

  test("entre 1 y 10 km enseña un decimal con coma", () => {
    expect(textoDistancia(4.5)).toBe("A unos 4,5 km");
    expect(textoDistancia(1)).toBe("A unos 1,0 km");
  });

  test("desde 10 km enseña kilómetros enteros", () => {
    expect(textoDistancia(25.1)).toBe("A unos 25 km");
    expect(textoDistancia(25.6)).toBe("A unos 26 km");
    expect(textoDistancia(10)).toBe("A unos 10 km");
  });

  test("sin distancia no devuelve nada", () => {
    expect(textoDistancia(undefined)).toBe("");
    expect(textoDistancia(null)).toBe("");
  });
});
