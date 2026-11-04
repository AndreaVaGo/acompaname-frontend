import { describe, test, expect } from "vitest";
import { CUIDADOS, nombreCuidado } from "../../utils/catalogoCuidados";

describe("catalogoCuidados", () => {
  test("cada cuidado tiene código y nombre", () => {
    for (const cuidado of CUIDADOS) {
      expect(cuidado.codigo).toBeTruthy();
      expect(cuidado.nombre).toBeTruthy();
    }
  });

  test("no hay códigos de cuidado repetidos", () => {
    const codigos = CUIDADOS.map((cuidado) => cuidado.codigo);

    expect(new Set(codigos).size).toBe(codigos.length);
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

  test("incluye la ayuda a domicilio, el acompañamiento general y los traslados", () => {
    const codigos = CUIDADOS.map((cuidado) => cuidado.codigo);

    expect(codigos).toContain("domicilio");
    expect(codigos).toContain("acompanamiento");
    expect(codigos).toContain("traslados");
  });

  test("ya no existe la compañía y conversación", () => {
    const codigos = CUIDADOS.map((cuidado) => cuidado.codigo);

    expect(codigos).not.toContain("compania");
  });

  test("hay diez cuidados en total", () => {
    expect(CUIDADOS).toHaveLength(10);
  });

  test("nombreCuidado devuelve el nombre que se ve en pantalla", () => {
    expect(nombreCuidado("higiene")).toBe("Higiene personal");
    expect(nombreCuidado("domicilio")).toBe("Ayuda a domicilio");
    expect(nombreCuidado("acompanamiento")).toBe("Acompañamiento general");
  });

  test("nombreCuidado devuelve el mismo código si no lo conoce", () => {
    expect(nombreCuidado("otro")).toBe("otro");
  });
});