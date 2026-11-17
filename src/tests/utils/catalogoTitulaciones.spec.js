import { describe, test, expect } from "vitest";
import {
  TITULACIONES,
  buscarTitulacion,
  nombreTitulacion,
  nombreCortoTitulacion,
} from "../../utils/catalogoTitulaciones";

describe("catalogoTitulaciones", () => {
  test("cada titulación tiene código, nombre y nombre corto", () => {
    for (const titulacion of TITULACIONES) {
      expect(titulacion.codigo).toBeTruthy();
      expect(titulacion.nombre).toBeTruthy();
      expect(titulacion.corto).toBeTruthy();
    }
  });

  test("no hay códigos repetidos", () => {
    const codigos = TITULACIONES.map((titulacion) => titulacion.codigo);

    expect(new Set(codigos).size).toBe(codigos.length);
  });

  test("los códigos coinciden con el enum Titulacion del back", () => {
    const codigos = TITULACIONES.map((titulacion) => titulacion.codigo);

    expect(codigos).toEqual([
      "ENFERMERIA",
      "AUXILIAR_ENFERMERIA",
      "ATENCION_DEPENDENCIA",
      "ATENCION_SOCIOSANITARIA",
      "PRIMEROS_AUXILIOS",
    ]);
  });

  test("buscarTitulacion devuelve la titulación completa", () => {
    expect(buscarTitulacion("ENFERMERIA").nombre).toBe("Enfermería");
  });

  test("buscarTitulacion con un código desconocido devuelve undefined", () => {
    expect(buscarTitulacion("MEDICO")).toBeUndefined();
  });

  test("nombreTitulacion devuelve el nombre completo", () => {
    expect(nombreTitulacion("AUXILIAR_ENFERMERIA")).toBe(
      "Auxiliar de enfermería (TCAE)",
    );
  });

  test("nombreCortoTitulacion devuelve el nombre breve", () => {
    expect(nombreCortoTitulacion("AUXILIAR_ENFERMERIA")).toBe("TCAE");
  });

  test("con un código desconocido se devuelve el propio código", () => {
    expect(nombreTitulacion("MEDICO")).toBe("MEDICO");
    expect(nombreCortoTitulacion("MEDICO")).toBe("MEDICO");
  });
});
