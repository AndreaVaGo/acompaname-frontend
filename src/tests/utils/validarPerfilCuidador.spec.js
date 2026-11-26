import { describe, test, expect } from "vitest";
import {
  validarPerfilCuidador,
  ORDEN_PERFIL,
} from "@/utils/validarPerfilCuidador";

const VALIDOS = {
  especialidad: "Geriatría",
  anosExperiencia: 3,
  tarifaHora: 12,
  recargoPersonaExtra: "",
  bio: "Llevo años cuidando.",
};

function con(cambios) {
  return validarPerfilCuidador({ ...VALIDOS, ...cambios });
}

describe("validarPerfilCuidador", () => {
  test("con datos correctos no hay errores", () => {
    expect(validarPerfilCuidador(VALIDOS)).toEqual({});
  });

  test("especialidad y descripción de solo espacios cuentan como vacías", () => {
    const errores = con({ especialidad: "  ", bio: " " });
    expect(errores.especialidad).toBe("Escribe tu especialidad.");
    expect(errores.bio).toBe("Cuéntales algo sobre ti.");
  });

  test("los años de experiencia no pueden ser negativos (0 sí vale)", () => {
    expect(con({ anosExperiencia: -1 }).anosExperiencia).toBeDefined();
    expect(con({ anosExperiencia: 0 }).anosExperiencia).toBeUndefined();
  });

  test("la tarifa tiene que ser mayor que 0", () => {
    expect(con({ tarifaHora: 0 }).tarifaHora).toBe(
      "La tarifa por hora debe ser mayor que 0.",
    );
    expect(con({ tarifaHora: "" }).tarifaHora).toBeDefined();
  });

  test("el recargo es opcional, pero si se pone es un entero entre 0 y 100", () => {
    expect(con({ recargoPersonaExtra: "" }).recargoPersonaExtra).toBeUndefined();
    expect(con({ recargoPersonaExtra: null }).recargoPersonaExtra).toBeUndefined();
    expect(con({ recargoPersonaExtra: 0 }).recargoPersonaExtra).toBeUndefined();
    expect(con({ recargoPersonaExtra: 100 }).recargoPersonaExtra).toBeUndefined();
    expect(con({ recargoPersonaExtra: 150 }).recargoPersonaExtra).toContain(
      "entre 0 y 100",
    );
    expect(con({ recargoPersonaExtra: 12.5 }).recargoPersonaExtra).toBeDefined();
    expect(con({ recargoPersonaExtra: -1 }).recargoPersonaExtra).toBeDefined();
  });

  test("con todo mal, los errores salen en el orden de la pantalla", () => {
    const errores = validarPerfilCuidador({
      especialidad: "",
      anosExperiencia: -1,
      tarifaHora: 0,
      recargoPersonaExtra: 500,
      bio: "",
    });
    expect(Object.keys(errores)).toEqual(ORDEN_PERFIL);
  });
});
