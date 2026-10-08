import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import LandingView from "../../../views/comun/LandingView.vue";

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

describe("LandingView", () => {
  test("muestra el título principal", () => {
    const wrapper = montarVista();

    expect(wrapper.find("h1").text()).toContain("Cuidadores de confianza");
  });

  test("tiene los botones de registro y de inicio de sesión", () => {
    const wrapper = montarVista();

    const enlaces = wrapper.findAll("a").map((a) => a.attributes("href"));
    expect(enlaces).toContain("/registro");
    expect(enlaces).toContain("/login");
  });

  test("permite ver los cuidadores sin registrarse", () => {
    const wrapper = montarVista();

    const enlaces = wrapper.findAll("a").map((a) => a.attributes("href"));
    expect(enlaces).toContain("/buscar");
  });

  test("explica los tres pasos para usar la aplicación", () => {
    const wrapper = montarVista();

    expect(wrapper.findAll(".landing__step-card")).toHaveLength(3);
  });

  test("invita a los cuidadores a crear su perfil", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("Crear mi perfil de cuidador");
  });
});