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

  test("las tarjetas tienen un velo de color propio que se define con --tinte-tarjeta", () => {
    expect(base).toContain("var(--tinte-tarjeta, transparent)");
  });

  test("cada estado de solicitud e historial tiene su velo de color y su icono", () => {
    const solicitud = readFileSync("src/components/SolicitudCard.vue", "utf-8");

    expect(solicitud.match(/--tinte-tarjeta:/g).length).toBe(4);
    expect(solicitud).toContain('content: "⏳ "');
    expect(solicitud).toContain('content: "✔ "');
    expect(historial.match(/--tinte-tarjeta:/g).length).toBe(2);
    expect(historial).toContain('content: "🎉 "');
  });

  test("Mi perfil tiene avatar con degradado y botón de cerrar sesión con color", () => {
    expect(miPerfil).toContain("@keyframes avatar-entra");
    expect(miPerfil).toContain("linear-gradient(135deg, var(--color-accent)");
    expect(miPerfil).toContain(".mi-perfil__acciones .btn--secondary:hover");
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
