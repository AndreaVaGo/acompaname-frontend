import { describe, test, expect } from "vitest";
import { EMAIL_CONTACTO } from "../../../utils/contacto";
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

  test("describe el servicio para personas de cualquier edad con lenguaje inclusivo", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("personas enfermas o dependientes, de cualquier edad");
    expect(wrapper.text()).not.toContain("cuidadores de personas mayores");
  });

  test("no usa «cuidador» ni «cuidadores» sueltos", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).not.toMatch(/\bcuidadores?\b/i);
  });

  test("aclara que es un proyecto de demostración", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("proyecto formativo y de demostración");
  });

  test("enlaza con la política de privacidad", () => {
    const wrapper = montarVista();

    expect(wrapper.find("a[href='/privacidad']").exists()).toBe(true);
  });

  test("el enlace de contacto usa el correo común", () => {
    const wrapper = montarVista();

    expect(wrapper.find("a[href^='mailto:']").attributes("href")).toBe(
      "mailto:" + EMAIL_CONTACTO,
    );
  });
});