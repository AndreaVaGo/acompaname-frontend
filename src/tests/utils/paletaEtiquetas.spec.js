import { describe, test, expect } from "vitest";
import { PALETA, coloresDe } from "../../utils/paletaEtiquetas";

// Contraste entre dos colores (fórmula de las pautas de accesibilidad WCAG)
function luminancia(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lineal = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lineal(r) + 0.7152 * lineal(g) + 0.0722 * lineal(b);
}

function contraste(a, b) {
  const [mayor, menor] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (mayor + 0.05) / (menor + 0.05);
}

describe("paletaEtiquetas", () => {
  test("el texto oscuro se lee bien sobre el fondo suave de cada color", () => {
    for (const [nombre, tonos] of Object.entries(PALETA)) {
      expect(contraste(tonos.fondo, tonos.texto), nombre).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("la letra blanca se lee bien sobre el fondo lleno de cada color", () => {
    for (const [nombre, tonos] of Object.entries(PALETA)) {
      expect(contraste(tonos.solido, "#ffffff"), nombre).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("coloresDe devuelve el color pedido", () => {
    expect(coloresDe("verde")).toBe(PALETA.verde);
  });

  test("coloresDe devuelve el neutro si el color no existe o no se indica", () => {
    expect(coloresDe("fucsia")).toBe(PALETA.neutro);
    expect(coloresDe(undefined)).toBe(PALETA.neutro);
    expect(coloresDe("")).toBe(PALETA.neutro);
  });
});
