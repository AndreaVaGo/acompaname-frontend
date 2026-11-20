import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";

// Los estilos compartidos del diseño de Buscar: el fondo con degradado y las tarjetas de cristal
const base = readFileSync("src/styles/base.css", "utf-8");

// Saca el contenido de un bloque @media que empieza en la posición indicada
function bloqueDesde(texto) {
  return base.slice(base.indexOf(texto));
}

describe("base.css · pantalla y tarjeta de cristal", () => {
  test("el fondo usa el degradado de la portada y se desplaza despacio", () => {
    expect(base).toContain(".pantalla::before");
    expect(base).toContain("radial-gradient(circle at 12% 18%, rgba(242, 137, 107");
    expect(base).toContain("radial-gradient(circle at 88% 62%, rgba(46, 125, 91");
    expect(base).toContain("animation: pantalla-degradado");
  });

  test("el fondo no se puede pinchar y va detrás de todo", () => {
    const fondo = bloqueDesde(".pantalla::before");

    expect(fondo.slice(0, 300)).toContain("pointer-events: none");
    expect(fondo.slice(0, 300)).toContain("z-index: -1");
  });

  test("la tarjeta es de cristal", () => {
    expect(base).toContain("background-color: rgba(255, 255, 255, 0.8)");
    expect(base).toContain("backdrop-filter: blur(10px)");
  });

  test("el color de la línea de arriba sale de --borde-tarjeta", () => {
    expect(base).toContain("border-top: 4px solid var(--borde-tarjeta, var(--color-border))");
  });

  test("las tarjetas entran una tras otra con la variable --i", () => {
    expect(base).toContain("animation: tarjeta-entra");
    expect(base).toContain("calc(var(--i, 0) * 60ms)");
  });

  test("el resplandor sigue al ratón con las variables --x e --y", () => {
    expect(base).toContain(".tarjeta-cristal::after");
    expect(base).toContain("var(--x, 50%) var(--y, 50%)");
  });

  test("la elevación y el resplandor solo se ven en pantallas con ratón", () => {
    const bloque = bloqueDesde("@media (hover: hover)");

    expect(bloque).toContain(".tarjeta-cristal:hover");
    expect(bloque).toContain("translateY(-4px)");
  });

  test("con reducir movimiento se apagan el fondo y las tarjetas", () => {
    // El primer "reducir movimiento" del archivo es el de la pantalla y las tarjetas
    const bloque = bloqueDesde("prefers-reduced-motion");

    expect(bloque).toContain("animation: none");
    expect(bloque).toContain(".tarjeta-cristal:hover");
  });
});
