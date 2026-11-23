import { describe, test, expect } from "vitest";
import { CUIDADOS, buscarCuidado } from "../../utils/catalogoCuidados";
import { TITULACIONES } from "../../utils/catalogoTitulaciones";
import { PALETA } from "../../utils/paletaEtiquetas";

// Cada servicio y cada titulación tiene su icono y su color fijos
describe("catálogos · icono y color", () => {
  test("todos los servicios tienen icono y un color que existe en la paleta", () => {
    for (const cuidado of CUIDADOS) {
      expect(cuidado.icono, cuidado.codigo).toBeTruthy();
      expect(PALETA[cuidado.color], cuidado.codigo).toBeDefined();
    }
  });

  test("cada servicio tiene su propio color (no se repite ninguno)", () => {
    const colores = CUIDADOS.map((cuidado) => cuidado.color);
    expect(new Set(colores).size).toBe(CUIDADOS.length);
  });

  test("todas las titulaciones tienen icono y un color que existe en la paleta", () => {
    for (const titulacion of TITULACIONES) {
      expect(titulacion.icono, titulacion.codigo).toBeTruthy();
      expect(PALETA[titulacion.color], titulacion.codigo).toBeDefined();
    }
  });

  test("cada titulación tiene su propio color", () => {
    const colores = TITULACIONES.map((titulacion) => titulacion.color);
    expect(new Set(colores).size).toBe(TITULACIONES.length);
  });

  test("la medicación es verde, como se pensó", () => {
    expect(buscarCuidado("medicacion").color).toBe("verde");
  });

  test("buscarCuidado devuelve undefined si el código no existe", () => {
    expect(buscarCuidado("inventado")).toBeUndefined();
  });
});
