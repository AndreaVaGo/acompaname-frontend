import { describe, test, expect } from "vitest";
import {
  gruposDePersonas,
  textoGrupos,
  hayVariosGrupos,
} from "../../utils/personasSolicitud";

const mixta = {
  grupoEdad: "NINOS",
  personas: [
    { nombre: "Zoe", edad: 5, grupoEdad: "NINOS" },
    { nombre: "Ada", edad: 9, grupoEdad: "NINOS" },
    { nombre: "Abuelo", edad: 80, grupoEdad: "MAYORES" },
  ],
};

describe("personasSolicitud: grupos de edad", () => {
  test("los grupos no se repiten y mantienen el orden", () => {
    expect(gruposDePersonas(mixta)).toEqual(["NINOS", "MAYORES"]);
  });

  test("el texto junta los nombres de los grupos", () => {
    expect(textoGrupos(mixta)).toBe("Niñas y niños, Personas mayores");
  });

  test("con varios grupos distintos hayVariosGrupos es verdadero", () => {
    expect(hayVariosGrupos(mixta)).toBe(true);
  });

  test("con un solo grupo repetido no hay varios grupos", () => {
    const solicitud = {
      personas: [
        { nombre: "Zoe", edad: 5, grupoEdad: "NINOS" },
        { nombre: "Ada", edad: 9, grupoEdad: "NINOS" },
      ],
    };

    expect(hayVariosGrupos(solicitud)).toBe(false);
    expect(textoGrupos(solicitud)).toBe("Niñas y niños");
  });

  test("una persona sin grupo usa el grupo de la solicitud", () => {
    const solicitud = {
      grupoEdad: "MAYORES",
      personas: [{ nombre: "Carmen", edad: 82 }],
    };

    expect(gruposDePersonas(solicitud)).toEqual(["MAYORES"]);
  });

  test("una solicitud antigua con nombre suelto usa su grupo", () => {
    const solicitud = { nombrePaciente: "Manuel", edadPaciente: 80, grupoEdad: "MAYORES" };

    expect(textoGrupos(solicitud)).toBe("Personas mayores");
  });

  test("una solicitud sin personas pero con grupo lo enseña", () => {
    expect(gruposDePersonas({ grupoEdad: "BEBES" })).toEqual(["BEBES"]);
  });

  test("sin ningún grupo el texto está vacío", () => {
    expect(textoGrupos({ nombrePaciente: "Manuel", edadPaciente: 80 })).toBe("");
    expect(textoGrupos(null)).toBe("");
    expect(hayVariosGrupos({})).toBe(false);
  });
});
