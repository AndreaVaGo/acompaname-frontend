import { describe, test, expect } from "vitest";
import {
  GRUPOS,
  buscarGrupo,
  nombreGrupo,
  edadValidaParaGrupo,
} from "../../utils/catalogoGrupos";

describe("catalogoGrupos", () => {
  test("tiene los seis grupos de edad del back", () => {
    const codigos = GRUPOS.map((grupo) => grupo.codigo);

    expect(codigos).toEqual([
      "BEBES",
      "NINOS",
      "ADOLESCENTES",
      "ADULTOS",
      "MAYORES",
      "DISCAPACIDAD_DEPENDENCIA",
    ]);
  });

  test("cada grupo tiene nombre y rango de edades para enseñar", () => {
    for (const grupo of GRUPOS) {
      expect(grupo.nombre).toBeTruthy();
      expect(grupo.edades).toBeTruthy();
    }
  });

  test("cada grupo tiene sus límites de edad y sus textos de ejemplo para el formulario", () => {
    for (const grupo of GRUPOS) {
      expect(grupo.edadMin).toBeLessThanOrEqual(grupo.edadMax);
      expect(grupo.ejemploNombre).toBeTruthy();
      expect(grupo.ejemploNotas).toBeTruthy();
      // El ejemplo de edad tiene que caber en el propio grupo
      expect(edadValidaParaGrupo(grupo.codigo, Number(grupo.ejemploEdad))).toBe(true);
    }
  });

  test("los grupos por edad se siguen unos a otros sin huecos ni solapes", () => {
    const porEdad = GRUPOS.filter((grupo) => grupo.codigo !== "DISCAPACIDAD_DEPENDENCIA");

    for (let i = 1; i < porEdad.length; i++) {
      expect(porEdad[i].edadMin).toBe(porEdad[i - 1].edadMax + 1);
    }
  });

  test("no hay códigos repetidos", () => {
    const codigos = GRUPOS.map((grupo) => grupo.codigo);

    expect(new Set(codigos).size).toBe(codigos.length);
  });

  test("buscarGrupo devuelve el grupo entero o undefined si no existe", () => {
    expect(buscarGrupo("BEBES").nombre).toBe("Bebés");
    expect(buscarGrupo("OTRO")).toBeUndefined();
  });

  test("nombreGrupo devuelve el nombre que se ve en pantalla", () => {
    expect(nombreGrupo("NINOS")).toBe("Niñas y niños");
    expect(nombreGrupo("MAYORES")).toBe("Personas mayores");
  });

  test("nombreGrupo devuelve el mismo código si no lo conoce", () => {
    expect(nombreGrupo("OTRO")).toBe("OTRO");
  });

  test("edadValidaParaGrupo acepta las edades del grupo y rechaza las demás", () => {
    expect(edadValidaParaGrupo("BEBES", 0)).toBe(true);
    expect(edadValidaParaGrupo("BEBES", 3)).toBe(true);
    expect(edadValidaParaGrupo("BEBES", 4)).toBe(false);
    expect(edadValidaParaGrupo("MAYORES", 64)).toBe(false);
    expect(edadValidaParaGrupo("MAYORES", 81)).toBe(true);
  });

  test("con discapacidad o dependencia vale cualquier edad razonable", () => {
    expect(edadValidaParaGrupo("DISCAPACIDAD_DEPENDENCIA", 0)).toBe(true);
    expect(edadValidaParaGrupo("DISCAPACIDAD_DEPENDENCIA", 90)).toBe(true);
    expect(edadValidaParaGrupo("DISCAPACIDAD_DEPENDENCIA", 150)).toBe(false);
  });

  test("con un grupo que no se conoce vale cualquier edad", () => {
    expect(edadValidaParaGrupo("OTRO", 200)).toBe(true);
  });
});