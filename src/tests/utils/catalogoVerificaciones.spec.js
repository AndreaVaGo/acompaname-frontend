import { describe, test, expect } from "vitest";
import {
  TIPOS_VERIFICACION,
  nombreTipoVerificacion,
  nombreEstadoVerificacion,
} from "../../utils/catalogoVerificaciones";

describe("catalogoVerificaciones", () => {
  test("hay dos tipos: titulación y antecedentes, cada uno con su ayuda", () => {
    expect(TIPOS_VERIFICACION.map((t) => t.codigo)).toEqual(["TITULACION", "ANTECEDENTES"]);
    for (const tipo of TIPOS_VERIFICACION) {
      expect(tipo.ayuda.length).toBeGreaterThan(20);
      expect(tipo.etiqueta).not.toBe("");
    }
  });

  test("la ayuda deja claro que no se sube ningún documento", () => {
    for (const tipo of TIPOS_VERIFICACION) {
      expect(tipo.ayuda).toContain("No subimos");
    }
  });

  test("nombreTipoVerificacion traduce el código y deja igual los desconocidos", () => {
    expect(nombreTipoVerificacion("TITULACION")).toBe("Titulación");
    expect(nombreTipoVerificacion("OTRO")).toBe("OTRO");
  });

  test("nombreEstadoVerificacion traduce los estados y deja igual los desconocidos", () => {
    expect(nombreEstadoVerificacion("PENDIENTE")).toBe("En revisión");
    expect(nombreEstadoVerificacion("VERIFICADO")).toBe("Verificado");
    expect(nombreEstadoVerificacion("RECHAZADO")).toBe("Rechazado");
    expect(nombreEstadoVerificacion("RARO")).toBe("RARO");
  });
});
