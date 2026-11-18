import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import { createRouter, createWebHistory } from "vue-router";
import LandingView from "../../../views/common/LandingView.vue";

// Diseño de la portada: entrada al cargar y accesibilidad del movimiento
const archivo = readFileSync("src/views/common/LandingView.vue", "utf-8");

// Monta la página de inicio con un router vacío, porque solo hace falta para los enlaces
function montar() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [],
  });
  return mount(LandingView, { global: { plugins: [router] } });
}

describe("LandingView · diseño", () => {
  test("el título lleva una parte resaltada, sin cambiar el texto completo", () => {
    const titulo = montar().find("h1");

    expect(titulo.find(".landing__resalte").text()).toBe(
      "cuando tu familia más lo necesita",
    );
    expect(titulo.text()).toContain("Personas cuidadoras de confianza,");
  });

  test("la portada tiene las piezas que entran una tras otra", () => {
    const contenido = montar().find(".landing__hero-content");

    // Insignia, título, texto y botones (más el aviso para quien no tiene cuenta)
    expect(contenido.element.children.length).toBeGreaterThanOrEqual(4);
  });

  test("las animaciones de entrada están definidas", () => {
    expect(archivo).toContain("@keyframes entrar");
    expect(archivo).toContain("@keyframes entrar-lado");
    expect(archivo).toContain("@keyframes subrayar");
  });

  test("con reducir movimiento se apaga la entrada de la portada", () => {
    const bloque = archivo.slice(archivo.indexOf("@media (prefers-reduced-motion: reduce)"));

    expect(bloque).toContain(".landing__hero-content > *");
    expect(bloque).toContain(".landing__hero-image");
    expect(bloque).toContain(".landing__resalte");
  });

  test("las transiciones usan los tokens de movimiento", () => {
    expect(archivo).toContain("var(--dur-med) var(--ease-out)");
    expect(archivo).not.toContain("0.25s ease");
  });

  test("el título se divide en palabras que entran una tras otra", () => {
    const palabras = montar().findAll("h1 .landing__palabra");

    // 4 palabras del título y 6 del resaltado
    expect(palabras.length).toBe(10);
    expect(palabras[0].text()).toBe("Personas");
    expect(palabras[0].attributes("style")).toContain("--i: 0");
    expect(palabras[9].attributes("style")).toContain("--i: 9");
  });

  test("las palabras siguen separadas por espacios al leer el título", () => {
    expect(montar().find("h1").text()).toBe(
      "Personas cuidadoras de confianza, cuando tu familia más lo necesita",
    );
  });

  test("la cinta de cuidados está en la portada", () => {
    expect(montar().find(".cinta").exists()).toBe(true);
  });

  test("con reducir movimiento se apagan las palabras del título", () => {
    const bloque = archivo.slice(archivo.indexOf("@media (prefers-reduced-motion: reduce)"));

    expect(bloque).toContain(".landing__palabra");
  });
});
