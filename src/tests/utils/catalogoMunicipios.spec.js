import { describe, test, expect } from "vitest";
import { MUNICIPIOS } from "@/utils/catalogoMunicipios";

describe("catalogoMunicipios", () => {
  test("tiene los más de 8.000 municipios de España", () => {
    expect(MUNICIPIOS.length).toBeGreaterThan(8000);
  });

  test("todos tienen nombre y provincia", () => {
    for (const municipio of MUNICIPIOS) {
      expect(municipio[0]).toBeTruthy();
      expect(municipio[1]).toBeTruthy();
    }
  });

  test("ningún nombre pasa de 100 caracteres (el límite del campo)", () => {
    for (const municipio of MUNICIPIOS) {
      expect(municipio[0].length).toBeLessThanOrEqual(100);
    }
  });

  test("los nombres con artículo detrás se escriben como se dicen", () => {
    const nombres = MUNICIPIOS.map((m) => m[0]);
    expect(nombres).toContain("A Coruña");
    expect(nombres).toContain("Las Palmas de Gran Canaria");
    expect(nombres).toContain("L'Hospitalet de Llobregat");
    expect(nombres).not.toContain("Coruña, A");
  });

  test("incluye Oviedo y Gijón, de Asturias", () => {
    expect(MUNICIPIOS).toContainEqual(["Oviedo", "Asturias"]);
    expect(MUNICIPIOS).toContainEqual(["Gijón", "Asturias"]);
  });
});
