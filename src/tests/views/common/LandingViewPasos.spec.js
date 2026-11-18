import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import LandingView from "../../../views/common/LandingView.vue";

// "Así de sencillo": en pantallas grandes se queda fija y los pasos se encienden al bajar
function montar() {
  const router = createRouter({ history: createWebHistory(), routes: [] });
  return mount(LandingView, { global: { plugins: [router] } });
}

// Simula una pantalla grande sin la opción de reducir movimiento
function simularPantallaGrande() {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
}

// Simula cuánto se ha bajado: "top" es lo que sube el bloque de pasos
function simularScroll(wrapper, top) {
  vi.spyOn(wrapper.find(".landing__steps-bloque").element, "getBoundingClientRect").mockReturnValue({
    top: top,
    height: 1800,
  });
  window.dispatchEvent(new Event("scroll"));
}

describe("LandingView · pasos fijos", () => {
  afterEach(() => {
    delete window.matchMedia;
    vi.restoreAllMocks();
  });

  test("sin saber de pantallas (o en pantallas pequeñas) los tres pasos se ven normales", () => {
    const wrapper = montar();

    expect(wrapper.find(".landing__steps-bloque--fijo").exists()).toBe(false);
    expect(wrapper.find(".landing__progreso").exists()).toBe(false);
    expect(wrapper.findAll(".landing__step-card--apagada").length).toBe(0);
  });

  test("en pantalla grande el bloque se queda fijo y aparece la barra de progreso", async () => {
    simularPantallaGrande();

    const wrapper = montar();
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".landing__steps-bloque--fijo").exists()).toBe(true);
    expect(wrapper.find(".landing__steps--fijo").exists()).toBe(true);
    expect(wrapper.find(".landing__progreso").exists()).toBe(true);
  });

  test("al empezar solo está encendido el primer paso", async () => {
    simularPantallaGrande();
    const wrapper = montar();
    await wrapper.vm.$nextTick();

    simularScroll(wrapper, 0);
    await wrapper.vm.$nextTick();

    const tarjetas = wrapper.findAll(".landing__step-card");
    expect(tarjetas[0].classes()).not.toContain("landing__step-card--apagada");
    expect(tarjetas[1].classes()).toContain("landing__step-card--apagada");
    expect(tarjetas[2].classes()).toContain("landing__step-card--apagada");
  });

  test("a mitad del recorrido están encendidos los dos primeros", async () => {
    simularPantallaGrande();
    const wrapper = montar();
    await wrapper.vm.$nextTick();

    // Recorrido = 1800 - altura de la ventana; se ha subido un poco más de la mitad
    simularScroll(wrapper, -(1800 - window.innerHeight) * 0.55);
    await wrapper.vm.$nextTick();

    const tarjetas = wrapper.findAll(".landing__step-card");
    expect(tarjetas[1].classes()).not.toContain("landing__step-card--apagada");
    expect(tarjetas[2].classes()).toContain("landing__step-card--apagada");
  });

  test("al acabar el recorrido están encendidos los tres y la barra está llena", async () => {
    simularPantallaGrande();
    const wrapper = montar();
    await wrapper.vm.$nextTick();

    simularScroll(wrapper, -5000);
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".landing__step-card--apagada").length).toBe(0);
    expect(wrapper.find(".landing__progreso-relleno").attributes("style")).toContain("width: 100%");
  });

  test("al quitar la página se deja de escuchar el scroll", () => {
    simularPantallaGrande();
    const quitar = vi.spyOn(window, "removeEventListener");
    const wrapper = montar();

    wrapper.unmount();

    expect(quitar).toHaveBeenCalledWith("scroll", expect.any(Function));
  });
});
