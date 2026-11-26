import { describe, test, expect } from "vitest";
import { HOSPITALES } from "@/utils/catalogoHospitales";

describe("catalogoHospitales", () => {
  test("tiene cientos de hospitales", () => {
    expect(HOSPITALES.length).toBeGreaterThan(500);
  });

  test("todos tienen nombre, municipio y provincia", () => {
    for (const hospital of HOSPITALES) {
      expect(hospital.nombre).toBeTruthy();
      expect(hospital.municipio).toBeTruthy();
      expect(hospital.provincia).toBeTruthy();
    }
  });

  test("ningún nombre pasa de 100 caracteres (el límite del campo)", () => {
    for (const hospital of HOSPITALES) {
      expect(hospital.nombre.length).toBeLessThanOrEqual(100);
    }
  });

  test("no hay dos hospitales con el mismo nombre y municipio", () => {
    const claves = HOSPITALES.map((h) => h.nombre + "|" + h.municipio);
    expect(new Set(claves).size).toBe(claves.length);
  });

  test("incluye el Hospital Universitario de Cabueñes, de Gijón", () => {
    const cabuenes = HOSPITALES.find(
      (h) => h.nombre === "Hospital Universitario de Cabueñes",
    );
    expect(cabuenes.municipio).toBe("Gijón");
    expect(cabuenes.provincia).toBe("Asturias");
  });
});
