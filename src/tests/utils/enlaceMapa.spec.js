import { describe, test, expect } from "vitest";
import { enlaceMapa } from "../../utils/enlaceMapa";

describe("enlaceMapa", () => {
  test("crea el enlace de búsqueda de Google Maps con la dirección", () => {
    expect(enlaceMapa("Calle Uría 10, Oviedo")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Calle%20Ur%C3%ADa%2010%2C%20Oviedo",
    );
  });

  test("quita los espacios de los lados antes de codificar", () => {
    expect(enlaceMapa("  Gijón  ")).toBe("https://www.google.com/maps/search/?api=1&query=Gij%C3%B3n");
  });

  test("codifica los caracteres que romperían el enlace (&, #, ?)", () => {
    const enlace = enlaceMapa("Calle A & B #3?");
    expect(enlace).toContain("Calle%20A%20%26%20B%20%233%3F");
    expect(enlace.split("query=")[1]).not.toContain("&");
  });

  test("sin dirección devuelve texto vacío", () => {
    expect(enlaceMapa("")).toBe("");
    expect(enlaceMapa("   ")).toBe("");
    expect(enlaceMapa(null)).toBe("");
    expect(enlaceMapa(undefined)).toBe("");
  });
});
