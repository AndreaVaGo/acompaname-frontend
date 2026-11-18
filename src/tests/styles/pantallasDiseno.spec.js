import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";

// Movimiento del historial y de los perfiles
const base = readFileSync("src/styles/base.css", "utf-8");
const historial = readFileSync("src/views/common/HistorialView.vue", "utf-8");
const miPerfil = readFileSync("src/views/common/MiPerfilView.vue", "utf-8");
const perfilCuidador = readFileSync("src/views/family/PerfilCuidadorView.vue", "utf-8");

describe("pantallas · diseño", () => {
  test("la animación de subir y aparecer está en el CSS global", () => {
    expect(base).toContain("@keyframes entra-sube");
  });

  test("los perfiles usan la entrada global", () => {
    expect(miPerfil).toContain("animation: entra-sube");
    expect(perfilCuidador.match(/animation: entra-sube/g).length).toBe(2);
  });

  test("las tarjetas del historial aparecen con fundido y ganan sombra al pasar el ratón", () => {
    expect(historial).toContain("animation: historial-entra");
    expect(historial).toContain("box-shadow: var(--shadow-card-hover)");
  });

  test("con reducir movimiento el historial no se anima", () => {
    const bloque = historial.slice(historial.indexOf("@media (prefers-reduced-motion: reduce)"));

    expect(bloque).toContain("animation: none");
  });
});
