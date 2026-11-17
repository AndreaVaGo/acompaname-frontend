import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import NoEncontradoView from "../../../views/common/NoEncontradoView.vue";

function montarVista() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [],
  });

  return mount(NoEncontradoView, {
    global: {
      plugins: [router],
    },
  });
}

describe("NoEncontradoView", () => {
  test("muestra el 404 y el mensaje de página no encontrada", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("404");
    expect(wrapper.find("h1").text()).toBe("No encontramos esta página");
  });

  test("tiene un enlace para volver al inicio", () => {
    const wrapper = montarVista();

    const enlace = wrapper.find('a[href="/"]');
    expect(enlace.exists()).toBe(true);
    expect(enlace.text()).toBe("Volver al inicio");
  });

  test("tiene un enlace para ver a las personas cuidadoras", () => {
    const wrapper = montarVista();

    expect(wrapper.find('a[href="/buscar"]').exists()).toBe(true);
  });
});
