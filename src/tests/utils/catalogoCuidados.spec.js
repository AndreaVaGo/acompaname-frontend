import { describe, test, expect } from "vitest";
import {
  CUIDADOS,
  cuidadosParaGrupo,
  nombreCuidado,
} from "../../utils/catalogoCuidados";
import { GRUPOS } from "../../utils/catalogoGrupos";

// Códigos de los cuidados que salen para un grupo
function codigosDe(grupo) {
  return cuidadosParaGrupo(grupo).map((cuidado) => cuidado.codigo);
}

describe("catalogoCuidados", () => {
  test("cada cuidado tiene código, nombre y al menos un grupo", () => {
    for (const cuidado of CUIDADOS) {
      expect(cuidado.codigo).toBeTruthy();
      expect(cuidado.nombre).toBeTruthy();
      expect(cuidado.grupos.length).toBeGreaterThan(0);
    }
  });

  test("no hay códigos de cuidado repetidos", () => {
    const codigos = CUIDADOS.map((cuidado) => cuidado.codigo);

    expect(new Set(codigos).size).toBe(codigos.length);
  });

  test("todos los grupos que nombra un cuidado existen en el catálogo de grupos", () => {
    const codigosGrupos = GRUPOS.map((grupo) => grupo.codigo);

    for (const cuidado of CUIDADOS) {
      for (const grupo of cuidado.grupos) {
        expect(codigosGrupos).toContain(grupo);
      }
    }
  });

  test("todos los grupos tienen cuidados para elegir", () => {
    for (const grupo of GRUPOS) {
      expect(cuidadosParaGrupo(grupo.codigo).length).toBeGreaterThan(0);
    }
  });

  test("los siete cuidados de siempre siguen primero y en el mismo orden", () => {
    const primeros = CUIDADOS.slice(0, 7).map((cuidado) => cuidado.codigo);

    expect(primeros).toEqual([
      "movilidad",
      "cognitivo",
      "medicacion",
      "higiene",
      "alimentacion",
      "nocturno",
      "paliativos",
    ]);
  });

  test("para bebés salen sus cuidados y no los de movilidad ni deterioro cognitivo", () => {
    const codigos = codigosDe("BEBES");

    expect(codigos).toContain("lactancia");
    expect(codigos).toContain("sueno");
    expect(codigos).not.toContain("movilidad");
    expect(codigos).not.toContain("cognitivo");
    expect(codigos).not.toContain("traslados");
  });

  test("para niñas y niños sale el apoyo escolar y no el deterioro cognitivo", () => {
    const codigos = codigosDe("NINOS");

    expect(codigos).toContain("escolar");
    expect(codigos).toContain("juego");
    expect(codigos).not.toContain("cognitivo");
    expect(codigos).not.toContain("lactancia");
  });

  test("para personas mayores salen los cuidados de mayores y no los infantiles", () => {
    const codigos = codigosDe("MAYORES");

    expect(codigos).toContain("cognitivo");
    expect(codigos).toContain("paliativos");
    expect(codigos).toContain("traslados");
    expect(codigos).not.toContain("lactancia");
    expect(codigos).not.toContain("escolar");
    expect(codigos).not.toContain("juego");
  });

  test("el apoyo en la comunicación es solo para discapacidad o dependencia", () => {
    for (const grupo of GRUPOS) {
      const sale = codigosDe(grupo.codigo).includes("comunicacion");

      expect(sale).toBe(grupo.codigo === "DISCAPACIDAD_DEPENDENCIA");
    }
  });

  test("medicación, higiene, alimentación, acompañamiento nocturno y paliativos salen en todos los grupos", () => {
    for (const grupo of GRUPOS) {
      const codigos = codigosDe(grupo.codigo);

      expect(codigos).toContain("medicacion");
      expect(codigos).toContain("higiene");
      expect(codigos).toContain("alimentacion");
      expect(codigos).toContain("nocturno");
      expect(codigos).toContain("paliativos");
    }
  });

  test("sin grupo, o con uno que no se conoce, salen todos los cuidados", () => {
    expect(cuidadosParaGrupo("")).toEqual(CUIDADOS);
    expect(cuidadosParaGrupo(undefined)).toEqual(CUIDADOS);
    expect(cuidadosParaGrupo("OTRO")).toEqual(CUIDADOS);
  });

  test("nombreCuidado devuelve el nombre que se ve en pantalla", () => {
    expect(nombreCuidado("higiene")).toBe("Higiene personal");
    expect(nombreCuidado("lactancia")).toBe("Lactancia y biberones");
  });

  test("nombreCuidado devuelve el mismo código si no lo conoce", () => {
    expect(nombreCuidado("otro")).toBe("otro");
  });
});