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

  test("muestra la animación que explica cómo funciona, con descripción para lectores de pantalla", () => {
    const wrapper = montarVista();

    // La animación sustituye a la foto y su texto alternativo lo leen los lectores de pantalla
    const animacion = wrapper.find('.landing__hero-image [role="img"]');
    expect(animacion.exists()).toBe(true);
    expect(animacion.attributes("aria-label")).toContain("Animación de 15 segundos");
  });

  test("la animación se puede pausar", () => {
    const wrapper = montarVista();

    expect(wrapper.find(".landing__hero-image button").text()).toContain(
      "Pausar animación",
    );
  });

  test("las tres tarjetas de los pasos aparecen una tras otra", () => {
    const wrapper = montarVista();

    const tarjetas = wrapper.findAll(".landing__step-card.aparecer");
    expect(tarjetas).toHaveLength(3);
    expect(tarjetas[0].attributes("style")).toContain("--retraso: 0ms");
    expect(tarjetas[1].attributes("style")).toContain("--retraso: 250ms");
    expect(tarjetas[2].attributes("style")).toContain("--retraso: 500ms");
  });

  test("la tarjeta para profesionales también aparece al verse", () => {
    const wrapper = montarVista();

    expect(wrapper.find(".landing__cta.aparecer").exists()).toBe(true);
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