import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";

// Comprueba que las hojas de estilo tienen los tokens de movimiento y la regla de accesibilidad
const variables = readFileSync("src/styles/variables.css", "utf-8");
const base = readFileSync("src/styles/base.css", "utf-8");

describe("variables.css · movimiento y tipografía", () => {
  test("define las tres duraciones", () => {
    expect(variables).toContain("--dur-fast:");
    expect(variables).toContain("--dur-med:");
    expect(variables).toContain("--dur-slow:");
  });

  test("define la curva de aceleración", () => {
    expect(variables).toContain("--ease-out:");
  });

  test("define la tipografía de títulos y la de texto con alternativa del sistema", () => {
    expect(variables).toContain("--font-display: 'Fraunces Variable'");
    expect(variables).toContain("--font-base: 'DM Sans Variable', 'Segoe UI'");
  });
});

describe("base.css · movimiento", () => {
  test("los botones se mueven con las duraciones definidas", () => {
    expect(base).toContain("var(--dur-fast) var(--ease-out)");
    expect(base).toContain(".btn:hover:not(:disabled)");
  });

  test("hay estilos para la transición entre páginas", () => {
    expect(base).toContain(".pagina-enter-active");
    expect(base).toContain(".pagina-leave-active");
  });

  test("con reducir movimiento se apagan las animaciones y las transiciones", () => {
    expect(base).toContain("@media (prefers-reduced-motion: reduce)");
    expect(base).toContain("animation-duration: 0.01ms !important");
    expect(base).toContain("transition-duration: 0.01ms !important");
  });

  test("los títulos usan la tipografía de títulos", () => {
    expect(base).toMatch(/h1,\s*h2,\s*h3\s*\{\s*font-family: var\(--font-display\)/);
  });
});
