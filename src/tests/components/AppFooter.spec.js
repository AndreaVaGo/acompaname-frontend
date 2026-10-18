import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import AppFooter from "../../components/AppFooter.vue";

// El footer lleva enlaces (RouterLink), así que necesita un router para montarse
function montarFooter() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/aviso-legal", component: { template: "<div />" } },
      { path: "/privacidad", component: { template: "<div />" } },
    ],
  });

  return mount(AppFooter, {
    global: {
      plugins: [router],
    },
  });
}

describe("AppFooter", () => {
  test("muestra el nombre de la aplicación", () => {
    const wrapper = montarFooter();

    expect(wrapper.find(".footer__logo-text").text()).toBe("Acompáñame");
  });

  test("muestra el texto de copyright", () => {
    const wrapper = montarFooter();

    expect(wrapper.find(".footer__text").text()).toContain("© 2026 Acompáñame");
  });

  test("tiene un enlace al aviso legal", () => {
    const wrapper = montarFooter();

    const enlaces = wrapper.findAll(".footer__enlace");
    expect(enlaces[0].text()).toBe("Aviso legal");
    expect(enlaces[0].attributes("href")).toBe("/aviso-legal");
  });

  test("tiene un enlace a la política de privacidad", () => {
    const wrapper = montarFooter();

    const enlaces = wrapper.findAll(".footer__enlace");
    expect(enlaces[1].text()).toBe("Política de privacidad");
    expect(enlaces[1].attributes("href")).toBe("/privacidad");
  });

  test("tiene un enlace a mi perfil de GitHub con su icono", () => {
    const wrapper = montarFooter();

    const enlace = wrapper.find(".footer__github");
    expect(enlace.text()).toBe("AndreaVaGo");
    expect(enlace.attributes("href")).toBe("https://github.com/AndreaVaGo");
    expect(enlace.find("svg").exists()).toBe(true);
  });

  test("el enlace de GitHub se abre en otra pestaña de forma segura", () => {
    const wrapper = montarFooter();

    const enlace = wrapper.find(".footer__github");
    expect(enlace.attributes("target")).toBe("_blank");
    expect(enlace.attributes("rel")).toContain("noopener");
  });
});