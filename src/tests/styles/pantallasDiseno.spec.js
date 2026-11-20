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
