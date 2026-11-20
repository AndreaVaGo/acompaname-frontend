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

  test("los perfiles usan el fondo y las tarjetas de cristal globales", () => {
    expect(miPerfil).toContain('class="mi-perfil pantalla"');
    expect(miPerfil).toContain('class="mi-perfil__box tarjeta-cristal"');
    expect(perfilCuidador).toContain('class="perfil pantalla"');
    expect(perfilCuidador).toContain('class="perfil__info tarjeta-cristal"');
    expect(perfilCuidador).toContain('class="perfil__sidebar tarjeta-cristal"');
    expect(perfilCuidador).not.toContain("animation: entra-sube");
  });

  test("la disponibilidad se marca con el color del borde de la tarjeta", () => {
    expect(perfilCuidador).toContain("--borde-tarjeta: var(--color-secondary)");
    expect(perfilCuidador).toContain("--borde-tarjeta: var(--color-error)");
  });

  test("el fondo de pantalla no aísla las ventanas emergentes de la barra de arriba", () => {
    const bloque = base.slice(base.indexOf(".pantalla {"), base.indexOf(".pantalla::before"));

    expect(bloque).not.toContain("isolation");
  });

  test("el historial usa el fondo y las tarjetas de cristal globales", () => {
    expect(historial).toContain('class="historial pantalla"');
    expect(historial).toContain('class="historial__card tarjeta-cristal"');
  });

  test("las tarjetas del historial entran una tras otra y siguen al ratón", () => {
    expect(historial).toContain(":style=\"{ '--i': Math.min(indice, 8) }\"");
    expect(historial).toContain('@mousemove="moverFoco"');
  });

  test("el color de la línea de arriba de cada tarjeta depende del estado", () => {
    expect(historial).toContain("--borde-tarjeta: var(--color-info)");
  });
});
