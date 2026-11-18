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

  test("las tarjetas van de una en una, alargadas en pantallas anchas", () => {
    const rejilla = archivo.slice(archivo.indexOf(".buscar__grid {"));

    expect(rejilla.slice(0, 120)).toContain("grid-template-columns: 1fr");
    expect(archivo).toContain("@media (min-width: 901px)");
    expect(archivo).toContain("grid-template-columns: 300px 1fr 200px");
  });

  test("la valoración y las etiquetas van agrupadas en el centro de la tarjeta", () => {
    expect(archivo).toContain('class="buscar__card-centro"');
  });

  test("el fondo usa el degradado de la portada y se desplaza despacio", () => {
    expect(archivo).toContain(".buscar::before");
    expect(archivo).toContain("radial-gradient(circle at 12% 18%, rgba(242, 137, 107");
    expect(archivo).toContain("radial-gradient(circle at 88% 62%, rgba(46, 125, 91");
    expect(archivo).toContain("animation: buscar-degradado");
    expect(archivo).toContain("pointer-events: none");
  });

  test("el panel de filtros es de cristal para que se vea el fondo", () => {
    expect(archivo).toContain("backdrop-filter: blur(14px)");
  });

  test("las tarjetas son de cristal para no ser un bloque blanco", () => {
    expect(archivo).toContain("background-color: rgba(255, 255, 255, 0.8)");
    expect(archivo).toContain("backdrop-filter: blur(10px)");
  });

  test("las tarjetas pares alternan el color de la franja", () => {
    expect(archivo).toContain(".buscar__card:nth-child(even) .buscar__card-cabecera");
  });

  test("con reducir movimiento las manchas del fondo se quedan quietas", () => {
    const bloque = archivo.slice(archivo.indexOf("@media (prefers-reduced-motion: reduce)"));

    expect(bloque).toContain(".buscar::before");
    expect(bloque).toContain("animation: none");
  });

  test("hay un enlace para volver al inicio", () => {
    expect(archivo).toContain('<RouterLink to="/" class="buscar__volver">← Volver al inicio</RouterLink>');
  });
});
