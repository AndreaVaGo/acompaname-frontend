import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";

// Comprueba que las animaciones del segundo paso existen y usan los tokens de movimiento de la web
const codigo = readFileSync("src/components/CodigoDosPasos.vue", "utf-8");
const perfil = readFileSync("src/components/DosPasosPerfil.vue", "utf-8");
const login = readFileSync("src/views/auth/LoginView.vue", "utf-8");
const base = readFileSync("src/styles/base.css", "utf-8");

describe("Animaciones del inicio de sesión en dos pasos", () => {
  test("el sobre llega con rebote y luego flota", () => {
    expect(codigo).toContain("@keyframes sobre-llega");
    expect(codigo).toContain("@keyframes sobre-flota");
  });

  test("cada casilla rellenada salta un poco", () => {
    expect(codigo).toContain("@keyframes casilla-pop");
    expect(codigo).toContain(".codigo__casilla--llena");
  });

  test("el escudo late solo cuando el segundo paso está activado", () => {
    expect(perfil).toContain("@keyframes escudo-late");
    expect(perfil).toMatch(/\.dos-pasos__escudo--activo\s*\{\s*animation: escudo-late/);
  });

  test("el formulario del perfil se despliega y el login desliza entre pasos", () => {
    expect(perfil).toContain(".dos-pasos-abre-enter-active");
    expect(login).toContain(".paso-enter-active");
    expect(login).toContain('<Transition name="paso" mode="out-in">');
  });

  test("las transiciones usan las duraciones y la curva de la web", () => {
    expect(login).toContain("var(--dur-med) var(--ease-out)");
    expect(perfil).toContain("var(--dur-med) var(--ease-out)");
  });

  test("el campo del código tiene 16px para que el móvil no haga zoom", () => {
    expect(codigo).toMatch(/\.codigo__campo\s*\{[^}]*font-size: 16px/);
  });

  test("quien reduce el movimiento no ve ninguna de estas animaciones (regla global)", () => {
    expect(base).toContain("@media (prefers-reduced-motion: reduce)");
    expect(base).toContain("animation-duration: 0.01ms !important");
  });

  test("los botones del bloque de dos pasos tienen borde de color y se rellenan al pasar el ratón", () => {
    expect(perfil).toMatch(/\.dos-pasos__boton,\s*\.dos-pasos__botones \.btn--secondary\s*\{[^}]*border: 2px solid var\(--color-secondary\)/);
    expect(perfil).toContain(".dos-pasos__boton--desactivar");
  });

  test("la tarjeta de Mi perfil se divide en bloques con título y Cerrar sesión va separado por una línea", () => {
    const miPerfil = readFileSync("src/views/common/MiPerfilView.vue", "utf-8");
    expect(miPerfil).toContain('<h3 class="mi-perfil__seccion">Tus datos</h3>');
    expect(perfil).toContain('<h3 class="dos-pasos__seccion">Seguridad</h3>');
    expect(miPerfil).toMatch(/\.mi-perfil__acciones\s*\{[^}]*border-top: 1px solid/);
  });

  test("el bloque de dos pasos es una tarjeta blanca con sombra, distinta de las filas grises", () => {
    expect(perfil).toMatch(/\.dos-pasos__cabecera\s*\{[^}]*background-color: var\(--color-white\)[^}]*box-shadow: var\(--shadow-card\)/);
  });
});
