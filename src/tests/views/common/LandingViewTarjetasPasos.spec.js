import { describe, test, expect, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import LandingView from "../../../views/common/LandingView.vue";
import fuente from "../../../views/common/LandingView.vue?raw";

// ACOM-198: las tarjetas de "Así de sencillo" llevan un número grande, un color por paso y un icono redondo
function montar() {
  const router = createRouter({ history: createWebHistory(), routes: [] });
  return mount(LandingView, { global: { plugins: [router] } });
}

afterEach(() => {
  delete window.matchMedia;
});

describe("LandingView · tarjetas de los pasos", () => {
  test("hay tres tarjetas con su número grande de fondo", () => {
    const wrapper = montar();

    const numeros = wrapper.findAll(".landing__step-numero").map((numero) => numero.text());
    expect(numeros).toEqual(["01", "02", "03"]);
  });

  test("el número grande es solo decoración: los lectores de pantalla no lo leen", () => {
    const wrapper = montar();

    for (const numero of wrapper.findAll(".landing__step-numero")) {
      expect(numero.attributes("aria-hidden")).toBe("true");
    }
  });

  test("cada número está dentro de su tarjeta", () => {
    const wrapper = montar();

    for (const tarjeta of wrapper.findAll(".landing__step-card")) {
      expect(tarjeta.findAll(".landing__step-numero")).toHaveLength(1);
    }
  });

  test("cada tarjeta tiene su icono con un dibujo dentro", () => {
    const wrapper = montar();

    for (const tarjeta of wrapper.findAll(".landing__step-card")) {
      expect(tarjeta.find(".landing__step-icon svg").exists()).toBe(true);
    }
  });

  test("los títulos y textos de los pasos siguen igual", () => {
    const wrapper = montar();

    const titulos = wrapper.findAll(".landing__step-card h3").map((titulo) => titulo.text());
    expect(titulos).toEqual(["1. Cuéntanos qué necesitas", "2. Elige a la persona", "3. Solicita y acompaña"]);
    expect(wrapper.find(".landing__steps-grid").text()).toContain("Perfiles con experiencia, tarifa y valoraciones reales.");
  });

  test("el título de la sección sigue siendo un h2 y cada paso un h3", () => {
    const wrapper = montar();

    expect(wrapper.find(".landing__steps h2").text()).toBe("Así de sencillo");
    expect(wrapper.findAll(".landing__steps-grid h3")).toHaveLength(3);
  });
});

// jsdom no pinta CSS, así que se comprueba en el propio código que el movimiento nuevo se desactiva
describe("LandingView · tarjetas de los pasos: estilos", () => {
  const bloqueReducido = fuente.slice(fuente.indexOf("@media (prefers-reduced-motion: reduce)"));

  test("el número grande también se quieta si la persona pidió menos movimiento", () => {
    expect(bloqueReducido).toContain(".landing__step-numero");
  });

  test("al pasar el ratón el número no se mueve si se pidió menos movimiento", () => {
    expect(bloqueReducido).toContain(".landing__step-card:hover .landing__step-numero");
  });

  test("cada paso tiene su propio color", () => {
    expect(fuente).toContain(".landing__step-card:nth-child(2) {");
    expect(fuente).toContain(".landing__step-card:nth-child(3) {");
    expect(fuente).toContain("--paso-color");
    expect(fuente).toContain("--paso-fondo");
  });

  test("el dibujo del icono toma el color del paso", () => {
    expect(fuente).toContain("stroke: currentColor");
  });
});
