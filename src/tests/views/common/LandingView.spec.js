import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import LandingView from "../../../views/common/LandingView.vue";

// Monta la página de inicio con un router vacío, porque solo hace falta para los enlaces
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

    expect(wrapper.find("h1").text()).toContain(
      "Personas cuidadoras de confianza",
    );
  });

  test("explica que sirve para cualquier edad", () => {
    const wrapper = montarVista();

    // El subtítulo deja claro que no es solo para personas mayores
    expect(wrapper.find(".landing__hero-text").text()).toContain(
      "sea cual sea su edad",
    );
  });

  test("tiene los botones de registro y de inicio de sesión", () => {
    const wrapper = montarVista();

    const enlaces = wrapper.findAll("a").map((a) => a.attributes("href"));
    expect(enlaces).toContain("/registro");
    expect(enlaces).toContain("/login");
  });

  test("permite ver las personas cuidadoras sin registrarse", () => {
    const wrapper = montarVista();

    const enlaces = wrapper.findAll("a").map((a) => a.attributes("href"));
    expect(enlaces).toContain("/buscar");
  });

  test("explica los tres pasos para usar la aplicación", () => {
    const wrapper = montarVista();

    expect(wrapper.findAll(".landing__step-card")).toHaveLength(3);
  });

  test("la foto principal tiene un texto alternativo que la describe", () => {
    const wrapper = montarVista();

    // El texto alternativo lo leen los lectores de pantalla
    expect(wrapper.find(".landing__hero-image img").attributes("alt")).toContain(
      "manos entrelazadas",
    );
  });

  test("invita a las personas cuidadoras a crear su perfil", () => {
    const wrapper = montarVista();

    expect(wrapper.text()).toContain("Crear mi perfil profesional");
  });

  test("el botón para profesionales abre el registro con el rol cuidador", () => {
    const wrapper = montarVista();

    const enlaces = wrapper.findAll("a").map((a) => a.attributes("href"));
    expect(enlaces).toContain("/registro?rol=cuidador");
  });
});