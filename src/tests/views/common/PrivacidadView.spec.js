import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import PrivacidadView from "../../../views/common/PrivacidadView.vue";

function montarVista() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: "/aviso-legal", component: { template: "<div />" } }],
  });

  return mount(PrivacidadView, {
    global: {
      plugins: [router],
    },
  });
}

describe("PrivacidadView", () => {
  test("muestra el título de la política de privacidad", () => {
    const wrapper = montarVista();

    expect(wrapper.find("h1").text()).toBe("Política de privacidad");
  });

  test("indica quién es el responsable y cómo contactar", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("Andrea V.G.");
    expect(wrapper.find("a[href^='mailto:']").exists()).toBe(true);
  });

  test("explica que no se usan cookies", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("no utiliza cookies");
  });

  test("informa de los derechos y de la AEPD", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("acceso, rectificación, supresión");
    expect(wrapper.find("a[href='https://www.aepd.es']").exists()).toBe(true);
  });

  test("enlaza con el aviso legal", () => {
    const wrapper = montarVista();

    expect(wrapper.find("a[href='/aviso-legal']").exists()).toBe(true);
  });
});