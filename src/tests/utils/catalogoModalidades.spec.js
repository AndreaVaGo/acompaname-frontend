import { describe, test, expect } from "vitest";
import {
  MODALIDADES,
  EXTRAS,
  buscarModalidad,
  buscarExtra,
  codigoModalidad,
} from "../../utils/catalogoModalidades";
import { GRUPOS } from "../../utils/catalogoGrupos";
import { PALETA } from "../../utils/paletaEtiquetas";

describe("catalogoModalidades", () => {
  test("las modalidades son hospital, domicilio y las dos, con los nombres de siempre", () => {
    expect(MODALIDADES.map((m) => m.nombre)).toEqual([
      "Hospitalario",
      "A domicilio",
      "Hospital y domicilio",
    ]);
  });

  test("los datos sueltos son disponible ahora y vehículo propio", () => {
    expect(EXTRAS.map((e) => e.nombre)).toEqual(["Disponible ahora", "Vehículo propio"]);
  });

  test("todos llevan icono y un color que existe en la paleta", () => {
    for (const dato of [...MODALIDADES, ...EXTRAS, ...GRUPOS]) {
      expect(dato.icono, dato.codigo).toBeTruthy();
      expect(PALETA[dato.color], dato.codigo).toBeDefined();
    }
  });

  test("cada grupo de edad tiene su propio color", () => {
    expect(new Set(GRUPOS.map((g) => g.color)).size).toBe(GRUPOS.length);
  });

  test("buscarModalidad y buscarExtra devuelven undefined si no existen", () => {
    expect(buscarModalidad("inventada")).toBeUndefined();
    expect(buscarExtra("inventado")).toBeUndefined();
    expect(buscarModalidad("domicilio").icono).toBe("🏠");
    expect(buscarExtra("vehiculo").icono).toBe("🚗");
  });

  test("codigoModalidad deja los conocidos y convierte el resto en 'ambos'", () => {
    expect(codigoModalidad("hospitalario")).toBe("hospitalario");
    expect(codigoModalidad("domicilio")).toBe("domicilio");
    expect(codigoModalidad(undefined)).toBe("ambos");
    expect(codigoModalidad(null)).toBe("ambos");
    expect(codigoModalidad("raro")).toBe("ambos");
  });
});
