import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import AvisoLegalView from "../../../views/common/AvisoLegalView.vue";

function montarVista() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: "/privacidad", component: { template: "<div />" } }],
  });

  return mount(AvisoLegalView, {
    global: {
      plugins: [router],
    },
  });
}

describe("AvisoLegalView", () => {
  test("muestra el título del aviso legal", () => {
    const wrapper = montarVista();

    expect(wrapper.find("h1").text()).toBe("Aviso legal");
  });

  test("identifica al titular y su contacto", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("Andrea V.G.");
    expect(wrapper.find("a[href^='mailto:']").exists()).toBe(true);
  });

  test("aclara que es un proyecto de demostración", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("proyecto formativo y de demostración");
  });

  test("enlaza con la política de privacidad", () => {
    const wrapper = montarVista();

    expect(wrapper.find("a[href='/privacidad']").exists()).toBe(true);
  });
});