import { describe, test, expect, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import pinia from "../../../pinia/pinia";
import { useAuthStore } from "../../../stores/auth";
import LandingView from "../../../views/common/LandingView.vue";

function montarVista() {
  const router = createRouter({ history: createMemoryHistory(), routes: [] });
  return mount(LandingView, { global: { plugins: [router] } });
}

// Los enlaces de los botones del principio de la página
function enlacesDelPrincipio(wrapper) {
  return wrapper
    .findAll(".landing__hero-actions a")
    .map((a) => a.attributes("href"));
}

afterEach(() => {
  useAuthStore(pinia).logout();
});

describe("LandingView según la sesión", () => {
  test("una visita ve Registrarme e Iniciar sesión", () => {
    const wrapper = montarVista();

    expect(enlacesDelPrincipio(wrapper)).toEqual(["/registro", "/login"]);
  });

  test("una visita ve también 'solo mirar' y la invitación a profesionales", () => {
    const wrapper = montarVista();

    expect(wrapper.find(".landing__hint").exists()).toBe(true);
    expect(wrapper.find(".landing__cta").exists()).toBe(true);
  });

  test("una familia con sesión ve Buscar y Mis solicitudes, no el registro ni el login", () => {
    useAuthStore(pinia).login(1, "ana@test.com", "token", "FAMILIA");
    const wrapper = montarVista();

    expect(enlacesDelPrincipio(wrapper)).toEqual(["/buscar", "/solicitudes"]);
    expect(wrapper.text()).not.toContain("Registrarme");
    expect(wrapper.text()).not.toContain("Iniciar sesión");
  });

  test("una persona cuidadora con sesión ve sus solicitudes y su calendario", () => {
    useAuthStore(pinia).login(2, "pepe@test.com", "token", "CUIDADOR");
    const wrapper = montarVista();

    expect(enlacesDelPrincipio(wrapper)).toEqual([
      "/solicitudes-cuidador",
      "/mi-calendario",
    ]);
  });

  test("el administrador ve un único botón al panel", () => {
    useAuthStore(pinia).login(3, "admin@test.com", "token", "ADMIN");
    const wrapper = montarVista();

    expect(enlacesDelPrincipio(wrapper)).toEqual(["/admin"]);
    expect(wrapper.text()).toContain("Ir al panel de administración");
  });

  test("el primer botón es el principal y el segundo el secundario", () => {
    useAuthStore(pinia).login(1, "ana@test.com", "token", "FAMILIA");
    const wrapper = montarVista();

    const botones = wrapper.findAll(".landing__hero-actions a");
    expect(botones[0].classes()).toContain("btn--primary");
    expect(botones[1].classes()).toContain("btn--secondary");
  });

  test("con sesión no se enseña 'solo mirar' ni la invitación a crear un perfil profesional", () => {
    useAuthStore(pinia).login(1, "ana@test.com", "token", "FAMILIA");
    const wrapper = montarVista();

    expect(wrapper.find(".landing__hint").exists()).toBe(false);
    expect(wrapper.find(".landing__cta").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("Crear mi perfil profesional");
  });

  test("al cerrar la sesión vuelven los botones de registro y login", () => {
    const store = useAuthStore(pinia);
    store.login(1, "ana@test.com", "token", "FAMILIA");
    store.logout();
    const wrapper = montarVista();

    expect(enlacesDelPrincipio(wrapper)).toEqual(["/registro", "/login"]);
  });
});
