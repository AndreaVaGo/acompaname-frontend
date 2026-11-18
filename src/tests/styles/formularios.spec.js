import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";

// Diseño de los formularios y de las tarjetas de solicitudes
const base = readFileSync("src/styles/base.css", "utf-8");
const tarjeta = readFileSync("src/components/SolicitudCard.vue", "utf-8");

describe("formularios · diseño", () => {
  test("los campos cambian de borde con suavidad al enfocar y al pasar el ratón", () => {
    expect(base).toContain("border-color var(--dur-fast) var(--ease-out)");
    expect(base).toContain("select:hover");
    expect(base).toContain("border-color: var(--color-text-muted)");
  });

  test("las casillas y los círculos usan el verde de la marca", () => {
    expect(base).toContain("accent-color: var(--color-secondary)");
  });
});

describe("SolicitudCard · diseño", () => {
  test("la tarjeta aparece con opacidad y no con transform", () => {
    const keyframes = tarjeta.slice(tarjeta.indexOf("@keyframes solicitud-entra"));

    expect(tarjeta).toContain("animation: solicitud-entra");
    expect(keyframes.slice(0, 80)).toContain("opacity: 0");
    expect(keyframes.slice(0, 80)).not.toContain("transform");
  });

  test("al pasar el ratón sube y gana sombra", () => {
    expect(tarjeta).toContain("box-shadow: var(--shadow-card-hover)");
  });

  test("con reducir movimiento se apaga la animación", () => {
    const bloque = tarjeta.slice(tarjeta.indexOf("@media (prefers-reduced-motion: reduce)"));

    expect(bloque).toContain("animation: none");
  });
});
