import { describe, test, expect } from "vitest";
import { GRUPOS, nombreGrupo } from "../../utils/catalogoGrupos";

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

  test("no hay códigos repetidos", () => {
    const codigos = GRUPOS.map((grupo) => grupo.codigo);

    expect(new Set(codigos).size).toBe(codigos.length);
  });

  test("nombreGrupo devuelve el nombre que se ve en pantalla", () => {
    expect(nombreGrupo("NINOS")).toBe("Niñas y niños");
    expect(nombreGrupo("MAYORES")).toBe("Personas mayores");
  });

  test("nombreGrupo devuelve el mismo código si no lo conoce", () => {
    expect(nombreGrupo("OTRO")).toBe("OTRO");
  });
});