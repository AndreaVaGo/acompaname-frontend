import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import ManosQueSeEncuentran from "../../components/animation/ManosQueSeEncuentran.vue";

// ACOM-242: dos manos que se dan la mano en el login y el registro
const archivo = readFileSync("src/components/animation/ManosQueSeEncuentran.vue", "utf-8");

describe("ManosQueSeEncuentran", () => {
  test("es un dibujo SVG decorativo, escondido a los lectores de pantalla", () => {
    const wrapper = mount(ManosQueSeEncuentran);
    const svg = wrapper.find("svg");

    expect(svg.exists()).toBe(true);
    expect(svg.attributes("aria-hidden")).toBe("true");
    expect(svg.attributes("focusable")).toBe("false");
  });

  test("tiene dos manos y un corazón", () => {
    const wrapper = mount(ManosQueSeEncuentran);

    expect(wrapper.findAll(".manos__mano")).toHaveLength(2);
    expect(wrapper.find(".manos__mano--izquierda").exists()).toBe(true);
    expect(wrapper.find(".manos__mano--derecha").exists()).toBe(true);
    expect(wrapper.find(".manos__corazon").exists()).toBe(true);
  });

  test("no lleva texto: no hay nada que leer ni que traducir", () => {
    const wrapper = mount(ManosQueSeEncuentran);

    expect(wrapper.text()).toBe("");
  });

  test("las manos llegan, se saludan y aparece el corazón", () => {
    expect(archivo).toContain("@keyframes llegar-izquierda");
    expect(archivo).toContain("@keyframes llegar-derecha");
    expect(archivo).toContain("@keyframes saludar");
    expect(archivo).toContain("@keyframes aparecer-corazon");
  });

  test("la animación no se repite en bucle", () => {
    expect(archivo).not.toContain("infinite");
  });

  test("solo se anima transform y opacity", () => {
    const keyframes = archivo.match(/@keyframes[^{]+\{[\s\S]*?\n\}/g).join("\n");
    const propiedades = keyframes.match(/^\s+([a-z-]+):/gm).map((p) => p.trim().replace(":", ""));

    for (const propiedad of propiedades) {
      expect(["transform", "opacity"]).toContain(propiedad);
    }
  });

  test("con reducir movimiento el dibujo sale terminado, sin animar", () => {
    const bloque = archivo.slice(archivo.indexOf("@media (prefers-reduced-motion: reduce)"));

    expect(bloque).toContain("animation: none");
  });
});
