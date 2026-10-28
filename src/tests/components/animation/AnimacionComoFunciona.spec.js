import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import AnimacionComoFunciona from "../../../components/animation/AnimacionComoFunciona.vue";

// jsdom no trae IntersectionObserver ni matchMedia: los simulamos
let observadores;
let menosMovimiento;

beforeEach(() => {
  observadores = [];
  menosMovimiento = false;
  window.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback;
      this.disconnect = vi.fn();
      observadores.push(this);
    }
    observe() {}
  };
  window.matchMedia = vi.fn(() => ({ matches: menosMovimiento }));
  vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AnimacionComoFunciona", () => {
  test("tiene una descripción para lectores de pantalla", () => {
    const wrapper = mount(AnimacionComoFunciona);
    const escenario = wrapper.find('[role="img"]');
    expect(escenario.attributes("aria-label")).toContain("Animación de 15 segundos");
    expect(escenario.attributes("aria-label")).toContain("Acompáñame");
  });

  test("dibuja las cinco siluetas de la escena de apertura", () => {
    const wrapper = mount(AnimacionComoFunciona);
    expect(wrapper.findAll(".animacion__figura")).toHaveLength(5);
  });

  test("contiene los textos de las escenas y el lema final", () => {
    const wrapper = mount(AnimacionComoFunciona);
    const texto = wrapper.text();
    expect(texto).toContain("Cuidar a quien quieres");
    expect(texto).toContain("Buscar");
    expect(texto).toContain("Solicitar");
    expect(texto).toContain("Coordinar");
    expect(texto).toContain("Cuidado y acompañamiento, a cualquier edad.");
  });

  test("el botón empieza ofreciendo pausar y al pulsarlo cambia a reproducir", async () => {
    const wrapper = mount(AnimacionComoFunciona);
    const boton = wrapper.find(".animacion__pausa");
    expect(boton.text()).toBe("Pausar animación");
    await boton.trigger("click");
    expect(boton.text()).toBe("Reproducir animación");
    await boton.trigger("click");
    expect(boton.text()).toBe("Pausar animación");
  });

  test("si la persona prefiere menos movimiento, empieza pausada", async () => {
    menosMovimiento = true;
    const wrapper = mount(AnimacionComoFunciona);
    await nextTick();
    expect(wrapper.find(".animacion__pausa").text()).toBe("Reproducir animación");
  });

  test("pide al navegador los fotogramas y los cancela al desmontar", () => {
    const wrapper = mount(AnimacionComoFunciona);
    expect(requestAnimationFrame).toHaveBeenCalled();
    wrapper.unmount();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  test("deja de observar cuando se desmonta", () => {
    const wrapper = mount(AnimacionComoFunciona);
    wrapper.unmount();
    expect(observadores[0].disconnect).toHaveBeenCalled();
  });
});