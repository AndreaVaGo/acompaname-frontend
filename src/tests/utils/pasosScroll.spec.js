import { describe, test, expect } from "vitest";
import { progresoDeScroll, pasoDeProgreso } from "../../utils/pasosScroll";

describe("progresoDeScroll", () => {
  test("al llegar al bloque (arriba en 0) el progreso es 0", () => {
    expect(progresoDeScroll(0, 1800, 800)).toBe(0);
  });

  test("antes de llegar (el bloque está más abajo) el progreso es 0", () => {
    expect(progresoDeScroll(400, 1800, 800)).toBe(0);
  });

  test("a mitad del recorrido el progreso es 0,5", () => {
    // Recorrido = 1800 - 800 = 1000; se ha subido 500
    expect(progresoDeScroll(-500, 1800, 800)).toBe(0.5);
  });

  test("al acabar el recorrido el progreso es 1", () => {
    expect(progresoDeScroll(-1000, 1800, 800)).toBe(1);
  });

  test("pasado el bloque el progreso no se pasa de 1", () => {
    expect(progresoDeScroll(-3000, 1800, 800)).toBe(1);
  });

  test("si el bloque cabe en la ventana, el progreso es 1", () => {
    expect(progresoDeScroll(0, 600, 800)).toBe(1);
  });
});

describe("pasoDeProgreso", () => {
  test("al principio está el primer paso", () => {
    expect(pasoDeProgreso(0, 3)).toBe(0);
  });

  test("a un tercio pasa al segundo paso", () => {
    expect(pasoDeProgreso(0.34, 3)).toBe(1);
  });

  test("a dos tercios pasa al tercer paso", () => {
    expect(pasoDeProgreso(0.67, 3)).toBe(2);
  });

  test("al acabar sigue en el último paso, sin pasarse", () => {
    expect(pasoDeProgreso(1, 3)).toBe(2);
  });
});
