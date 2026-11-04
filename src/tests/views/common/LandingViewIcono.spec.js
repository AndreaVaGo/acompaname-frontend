import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import LandingView from "../../../views/common/LandingView.vue";

// Monta la página de inicio con un router vacío, porque solo hace falta para los enlaces
function montarVista() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [],
  });

  return mount(LandingView, {
    global: {
      plugins: [router],
    },
  });
}

describe("LandingView icono de la tarjeta para profesionales", () => {
  test("la tarjeta lleva el icono de la marca, que es decorativo", () => {
    const wrapper = montarVista();

    const icono = wrapper.find(".landing__cta-icon svg");
    expect(icono.exists()).toBe(true);
    expect(icono.attributes("aria-hidden")).toBe("true");
  });

  test("el icono es el mismo de manos y corazón que usa la animación", () => {
    const wrapper = montarVista();

    // El corazón con manos se dibuja con cuatro trazos
    expect(wrapper.findAll(".landing__cta-icon svg path")).toHaveLength(4);
  });

  test("ya no se usa el emoji de la casa", () => {
    const wrapper = montarVista();

    expect(wrapper.find(".landing__cta-icon").text()).toBe("");
    expect(wrapper.text()).not.toContain("🏠");
  });

  test("el título de la tarjeta sigue explicando para quién es", () => {
    const wrapper = montarVista();

    expect(wrapper.find(".landing__cta h2").text()).toBe(
      "¿Eres cuidador o cuidadora profesional?",
    );
  });
});