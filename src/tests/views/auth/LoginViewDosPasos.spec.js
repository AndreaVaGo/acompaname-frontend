import { describe, test, expect, vi, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import LoginView from "../../../views/auth/LoginView.vue";
import AuthRepository from "../../../repositories/AuthRepository";
import { useAuthStore } from "../../../stores/auth";

const router = createRouter({ history: createWebHistory(), routes: [] });

function montarVista() {
  const pinia = createPinia();
  const wrapper = mount(LoginView, { global: { plugins: [router, pinia] } });
  return { wrapper, pinia };
}

// Hace el primer paso: el servidor pide el código
async function pasarAlCodigo(wrapper) {
  vi.spyOn(AuthRepository.prototype, "login").mockResolvedValue({
    requiereCodigo: true,
    desafio: "desafio-1",
  });
  await wrapper.find("#email").setValue("ana@test.com");
  await wrapper.find("#password").setValue("12345678");
  await wrapper.find("form").trigger("submit");
  await flushPromises();
}

async function escribirCodigoYEnviar(wrapper, codigo) {
  await wrapper.find("#codigo").setValue(codigo);
  await wrapper.find("form").trigger("submit");
  await flushPromises();
}

describe("LoginView · segundo paso", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  test("si el servidor pide código, enseña la pantalla del código y no inicia sesión", async () => {
    const push = vi.spyOn(router, "push").mockResolvedValue();
    const { wrapper, pinia } = montarVista();

    await pasarAlCodigo(wrapper);

    expect(wrapper.find("#codigo").exists()).toBe(true);
    expect(wrapper.find("#password").exists()).toBe(false);
    expect(wrapper.text()).toContain("ana@test.com");
    expect(useAuthStore(pinia).estaAutenticado).toBe(false);
    expect(push).not.toHaveBeenCalled();
  });

  test("con el código correcto inicia sesión y va al inicio", async () => {
    const verificar = vi
      .spyOn(AuthRepository.prototype, "verificarCodigo")
      .mockResolvedValue({ id: 1, username: "ana@test.com", roles: "FAMILIA", token: "t" });
    const push = vi.spyOn(router, "push").mockResolvedValue();
    const { wrapper, pinia } = montarVista();
    await pasarAlCodigo(wrapper);

    await escribirCodigoYEnviar(wrapper, "123456");

    expect(verificar).toHaveBeenCalledWith("desafio-1", "123456");
    expect(useAuthStore(pinia).token).toBe("t");
    expect(push).toHaveBeenCalledWith("/");
  });

  test("el administrador, tras el código, va a su panel", async () => {
    vi.spyOn(AuthRepository.prototype, "verificarCodigo").mockResolvedValue({
      id: 9,
      username: "admin@test.com",
      roles: "ADMIN",
      token: "t",
    });
    const push = vi.spyOn(router, "push").mockResolvedValue();
    const { wrapper } = montarVista();
    await pasarAlCodigo(wrapper);

    await escribirCodigoYEnviar(wrapper, "123456");

    expect(push).toHaveBeenCalledWith("/admin");
  });

  test("con un código incorrecto (400) lo explica y no inicia sesión", async () => {
    const error400 = new Error("fallo");
    error400.status = 400;
    vi.spyOn(AuthRepository.prototype, "verificarCodigo").mockRejectedValue(error400);
    const push = vi.spyOn(router, "push").mockResolvedValue();
    const { wrapper, pinia } = montarVista();
    await pasarAlCodigo(wrapper);

    await escribirCodigoYEnviar(wrapper, "000000");

    expect(wrapper.find(".codigo__error").text()).toContain("El código no es correcto o ha caducado");
    expect(useAuthStore(pinia).estaAutenticado).toBe(false);
    expect(push).not.toHaveBeenCalled();
  });

  test("con demasiados intentos (429) avisa de que se espere", async () => {
    const error429 = new Error("fallo");
    error429.status = 429;
    vi.spyOn(AuthRepository.prototype, "verificarCodigo").mockRejectedValue(error429);
    const { wrapper } = montarVista();
    await pasarAlCodigo(wrapper);

    await escribirCodigoYEnviar(wrapper, "123456");

    expect(wrapper.find(".codigo__error").text()).toContain("Demasiados intentos");
  });

  test("si no hay conexión al comprobar el código, lo dice", async () => {
    vi.spyOn(AuthRepository.prototype, "verificarCodigo").mockRejectedValue(
      new TypeError("Failed to fetch")
    );
    const { wrapper } = montarVista();
    await pasarAlCodigo(wrapper);

    await escribirCodigoYEnviar(wrapper, "123456");

    expect(wrapper.find(".codigo__error").text()).toContain(
      "No se pudo comprobar el código. No se pudo conectar con el servidor."
    );
  });

  test("con menos de seis cifras no llama al servidor", async () => {
    const verificar = vi.spyOn(AuthRepository.prototype, "verificarCodigo");
    const { wrapper } = montarVista();
    await pasarAlCodigo(wrapper);

    await escribirCodigoYEnviar(wrapper, "12");

    expect(verificar).not.toHaveBeenCalled();
  });

  test("Volver devuelve al formulario con el email y sin la contraseña", async () => {
    const { wrapper } = montarVista();
    await pasarAlCodigo(wrapper);

    await wrapper.find(".codigo__volver").trigger("click");
    await flushPromises();

    expect(wrapper.find("#codigo").exists()).toBe(false);
    expect(wrapper.find("#email").element.value).toBe("ana@test.com");
    expect(wrapper.find("#password").element.value).toBe("");
  });

  test("un login normal (sin código) sigue sin enseñar la pantalla del código", async () => {
    vi.spyOn(AuthRepository.prototype, "login").mockResolvedValue({
      id: 1,
      username: "ana@test.com",
      roles: "FAMILIA",
      token: "t",
    });
    vi.spyOn(router, "push").mockResolvedValue();
    const { wrapper } = montarVista();
    await wrapper.find("#email").setValue("ana@test.com");
    await wrapper.find("#password").setValue("12345678");

    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.find("#codigo").exists()).toBe(false);
  });
});
