import { describe, test, expect } from "vitest";
import { EMAIL_CONTACTO } from "../../../utils/contacto";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import TerminosView from "../../../views/common/TerminosView.vue";

function montarVista() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/privacidad", component: { template: "<div />" } },
      { path: "/aviso-legal", component: { template: "<div />" } },
    ],
  });

  return mount(TerminosView, {
    global: {
      plugins: [router],
    },
  });
}

describe("TerminosView", () => {
  test("muestra el título de los términos y condiciones", () => {
    const wrapper = montarVista();

    expect(wrapper.find("h1").text()).toBe("Términos y condiciones de uso");
  });

  test("aclara que es un proyecto de demostración con pagos simulados", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("proyecto formativo y de demostración");
    expect(wrapper.text()).toContain("simulados");
  });

  test("tiene un correo de contacto para la baja", () => {
    const wrapper = montarVista();

    expect(wrapper.find("a[href^='mailto:']").exists()).toBe(true);
  });

  test("enlaza con la política de privacidad y con el aviso legal", () => {
    const wrapper = montarVista();

    expect(wrapper.find("a[href='/privacidad']").exists()).toBe(true);
    expect(wrapper.find("a[href='/aviso-legal']").exists()).toBe(true);
  });

  test("el enlace de contacto usa el correo común", () => {
    const wrapper = montarVista();

    expect(wrapper.find("a[href^='mailto:']").attributes("href")).toBe(
      "mailto:" + EMAIL_CONTACTO,
    );
  });

  test("aclara que la tarifa incluye el desplazamiento", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("incluye su desplazamiento");
    expect(wrapper.text()).toContain("ningún importe aparte");
  });
});
