import { describe, test, expect, vi, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import LoginView from "../../../views/auth/LoginView.vue";
import RegisterView from "../../../views/auth/RegisterView.vue";
import RoleRepository from "../../../repositories/RoleRepository";

// ACOM-189: el login y el registro usan la pantalla con panel de foto
const router = createRouter({ history: createWebHistory(), routes: [] });

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});

async function montarLogin() {
  return mount(LoginView, { global: { plugins: [router, createPinia()] } });
}

async function montarRegistro() {
  vi.spyOn(RoleRepository.prototype, "getAll").mockResolvedValue([
    { id: 4, name: "FAMILIA" },
    { id: 5, name: "CUIDADOR" },
  ]);
  const wrapper = mount(RegisterView, { global: { plugins: [router] } });
  await flushPromises();
  return wrapper;
}

describe("Login y registro con panel de foto", () => {
  test("el login tiene el panel de la foto", async () => {
    const wrapper = await montarLogin();

    expect(wrapper.find('[data-testid="panel-foto"]').exists()).toBe(true);
  });

  test("el formulario del login sigue dentro de la columna del contenido", async () => {
    const wrapper = await montarLogin();

    expect(wrapper.find(".pantalla-foto__contenido form").exists()).toBe(true);
    expect(wrapper.find(".pantalla-foto__contenido #email").exists()).toBe(true);
    expect(wrapper.find(".pantalla-foto__contenido #password").exists()).toBe(true);
  });

  test("el login solo tiene un título principal", async () => {
    const wrapper = await montarLogin();

    expect(wrapper.findAll("h1")).toHaveLength(1);
    expect(wrapper.find("h1").text()).toBe("Iniciar sesión");
  });

  test("el panel de la foto del login no tiene campos ni enlaces", async () => {
    const wrapper = await montarLogin();
    const panel = wrapper.find('[data-testid="panel-foto"]');

    expect(panel.find("input").exists()).toBe(false);
    expect(panel.find("a").exists()).toBe(false);
    expect(panel.find("button").exists()).toBe(false);
  });

  test("el registro tiene el panel de la foto", async () => {
    const wrapper = await montarRegistro();

    expect(wrapper.find('[data-testid="panel-foto"]').exists()).toBe(true);
  });

  test("el formulario del registro sigue dentro de la columna del contenido", async () => {
    const wrapper = await montarRegistro();

    expect(wrapper.find(".pantalla-foto__contenido form").exists()).toBe(true);
    expect(wrapper.find(".pantalla-foto__contenido #nombre").exists()).toBe(true);
    expect(wrapper.find(".pantalla-foto__contenido #password-repetida").exists()).toBe(true);
  });

  test("el registro solo tiene un título principal", async () => {
    const wrapper = await montarRegistro();

    expect(wrapper.findAll("h1")).toHaveLength(1);
    expect(wrapper.find("h1").text()).toBe("Crear cuenta");
  });

  test("el panel de la foto del registro no tiene campos ni enlaces", async () => {
    const wrapper = await montarRegistro();
    const panel = wrapper.find('[data-testid="panel-foto"]');

    expect(panel.find("input").exists()).toBe(false);
    expect(panel.find("a").exists()).toBe(false);
    expect(panel.find("button").exists()).toBe(false);
  });
});
