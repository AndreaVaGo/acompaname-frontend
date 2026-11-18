import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";

// Diseño de las tarjetas de búsqueda: entrada escalonada, foco del ratón y reducir movimiento
const archivo = readFileSync("src/views/family/BuscarView.vue", "utf-8");

describe("BuscarView · diseño de tarjetas", () => {
  test("las tarjetas entran una tras otra usando la variable --i", () => {
    expect(archivo).toContain("animation: buscar-entra");
    expect(archivo).toContain("calc(var(--i, 0) * 60ms)");
    expect(archivo).toContain(":style=\"{ '--i': Math.min(indice, 8) }\"");
  });

  test("cada tarjeta guarda la posición del ratón para el foco", () => {
    expect(archivo).toContain('@mousemove="moverFoco"');
    expect(archivo).toContain(".buscar__card::after");
    expect(archivo).toContain("var(--x, 50%) var(--y, 50%)");
  });

  test("con reducir movimiento se apaga la animación de las tarjetas", () => {
    const bloque = archivo.slice(archivo.indexOf("@media (prefers-reduced-motion: reduce)"));

    expect(bloque).toContain(".buscar__card");
    expect(bloque).toContain("animation: none");
  });
});
