import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import LandingView from "../../../views/common/LandingView.vue";
import fuente from "../../../views/common/LandingView.vue?raw";

// ACOM-198: la tarjeta "¿Eres persona cuidadora profesional?" lleva ventajas, una vista previa y un botón con flecha
function montar() {
  const router = createRouter({ history: createWebHistory(), routes: [] });
  return mount(LandingView, { global: { plugins: [router] } });
}

describe("LandingView · tarjeta para profesionales", () => {
  test("enseña tres ventajas", () => {
    const wrapper = montar();

    const ventajas = wrapper.findAll(".landing__cta-ventajas li").map((li) => li.text());
    expect(ventajas).toEqual(["Tú pones tu tarifa", "Tú eliges tus horarios", "Familias cerca de ti"]);
  });

  test("el botón sigue llevando al registro como persona cuidadora", () => {
    const wrapper = montar();

    const enlace = wrapper.find(".landing__cta-boton");
    expect(enlace.attributes("href")).toBe("/registro?rol=cuidador");
    expect(enlace.text()).toContain("Crear mi perfil profesional");
  });

  test("el botón es el único enlace de la tarjeta", () => {
    const wrapper = montar();

    expect(wrapper.findAll(".landing__cta a")).toHaveLength(1);
  });

  test("la flecha del botón es decorativa", () => {
    const wrapper = montar();

    expect(wrapper.find(".landing__cta-flecha").attributes("aria-hidden")).toBe("true");
  });

  test("tiene una vista previa de un perfil de ejemplo", () => {
    const wrapper = montar();
    const vista = wrapper.find('[data-testid="vista-previa-perfil"]');

    expect(vista.exists()).toBe(true);
    expect(vista.text()).toContain("Tu nombre");
    expect(vista.text()).toContain("18 €/hora");
    expect(vista.text()).toContain("Disponible");
  });

  test("la vista previa es solo decoración: escondida a los lectores de pantalla y sin enlaces ni botones", () => {
    const wrapper = montar();
    const vista = wrapper.find('[data-testid="vista-previa-perfil"]');

    expect(vista.attributes("aria-hidden")).toBe("true");
    expect(vista.find("a").exists()).toBe(false);
    expect(vista.find("button").exists()).toBe(false);
  });

  test("la vista previa no lleva el nombre de ninguna persona real", () => {
    const wrapper = montar();
    const texto = wrapper.find('[data-testid="vista-previa-perfil"]').text();

    expect(texto).toContain("Tu especialidad");
    expect(texto).toContain("Tu nombre");
  });

  test("el título, el texto y el icono de la tarjeta siguen igual", () => {
    const wrapper = montar();

    expect(wrapper.find(".landing__cta h2").text()).toBe("¿Eres persona cuidadora profesional?");
    expect(wrapper.find(".landing__cta-texto p").text()).toContain("Publica tu perfil");
    expect(wrapper.find(".landing__cta-icon svg").exists()).toBe(true);
  });

  test("la tarjeta sigue apareciendo al verse en pantalla", () => {
    const wrapper = montar();

    expect(wrapper.find(".landing__cta.aparecer").exists()).toBe(true);
  });
});

// jsdom no pinta CSS, así que se comprueba en el código que el movimiento nuevo se desactiva
describe("LandingView · tarjeta para profesionales: estilos", () => {
  const bloqueReducido = fuente.slice(fuente.indexOf("@media (prefers-reduced-motion: reduce)"));

  test("con menos movimiento la vista previa no flota y la flecha no se desliza", () => {
    expect(bloqueReducido).toContain(".landing__cta-perfil");
    expect(bloqueReducido).toContain(".landing__cta-flecha");
    expect(bloqueReducido).toContain(".landing__cta-boton:hover .landing__cta-flecha");
  });

  test("en el móvil la tarjeta pasa a una sola columna", () => {
    const bloqueMovil = fuente.slice(fuente.indexOf("@media (max-width: 768px)"));
    expect(bloqueMovil).toMatch(/\.landing__cta \{\s*grid-template-columns: 1fr;/);
  });
});
