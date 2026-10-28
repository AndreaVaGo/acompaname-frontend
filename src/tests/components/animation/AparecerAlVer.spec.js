import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import AparecerAlVer from "../../../components/animation/AparecerAlVer.vue";

// jsdom no trae IntersectionObserver: lo simulamos para controlar cuándo "se ve" la pieza
let observadores;

beforeEach(() => {
  observadores = [];
  window.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback;
      this.disconnect = vi.fn();
      this.observe = vi.fn();
      observadores.push(this);
    }
  };
});

afterEach(() => {
  delete window.IntersectionObserver;
});

describe("AparecerAlVer", () => {
  test("muestra el contenido que se le pasa", () => {
    const wrapper = mount(AparecerAlVer, { slots: { default: "<p>Hola</p>" } });

    expect(wrapper.text()).toContain("Hola");
  });

  test("empieza sin animar mientras no se ve en pantalla", () => {
    const wrapper = mount(AparecerAlVer);

    expect(wrapper.classes()).not.toContain("aparecer--visible");
  });

  test("al verse en pantalla se anima y deja de observar", async () => {
    const wrapper = mount(AparecerAlVer);

    observadores[0].callback([{ isIntersecting: true }]);
    await nextTick();

    expect(wrapper.classes()).toContain("aparecer--visible");
    expect(observadores[0].disconnect).toHaveBeenCalled();
  });

  test("si todavía no se ve, no se anima", async () => {
    const wrapper = mount(AparecerAlVer);

    observadores[0].callback([{ isIntersecting: false }]);
    await nextTick();

    expect(wrapper.classes()).not.toContain("aparecer--visible");
  });

  test("el retraso se pasa al CSS en milisegundos", () => {
    const wrapper = mount(AparecerAlVer, { props: { retraso: 300 } });

    expect(wrapper.attributes("style")).toContain("--retraso: 300ms");
  });

  test("sin retraso empieza a la vez", () => {
    const wrapper = mount(AparecerAlVer);

    expect(wrapper.attributes("style")).toContain("--retraso: 0ms");
  });

  test("si el navegador no puede observar la pantalla, se muestra directamente", async () => {
    delete window.IntersectionObserver;

    const wrapper = mount(AparecerAlVer);
    await nextTick();

    expect(wrapper.classes()).toContain("aparecer--visible");
  });

  test("deja de observar cuando se desmonta", () => {
    const wrapper = mount(AparecerAlVer);

    wrapper.unmount();

    expect(observadores[0].disconnect).toHaveBeenCalled();
  });

  test("conserva la clase que se le pone desde fuera", () => {
    const wrapper = mount(AparecerAlVer, { attrs: { class: "tarjeta" } });

    expect(wrapper.classes()).toContain("tarjeta");
    expect(wrapper.classes()).toContain("aparecer");
  });
});