import { describe, test, expect, vi, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import RestablecerPasswordView from "../../../views/auth/RestablecerPasswordView.vue";
import AuthRepository from "../../../repositories/AuthRepository";

async function montarVista(direccion) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/restablecer-password", component: RestablecerPasswordView },
      { path: "/olvide-password", component: { template: "<div />" } },
      { path: "/login", component: { template: "<div />" } },
    ],
  });
  await router.push(direccion);
  await router.isReady();
  return mount(RestablecerPasswordView, { global: { plugins: [router] } });
}

async function rellenarYEnviar(wrapper, nueva, repetida) {
  await wrapper.find("#password-nueva").setValue(nueva);
  await wrapper.find("#password-repetida").setValue(repetida);
  await wrapper.find("form").trigger("submit");
  await flushPromises();
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("RestablecerPasswordView: con el token en el enlace", () => {
  test("enseña el formulario con los dos campos", async () => {
    const wrapper = await montarVista("/restablecer-password?token=abc");

    expect(wrapper.find("#password-nueva").exists()).toBe(true);
    expect(wrapper.find("#password-repetida").exists()).toBe(true);
    expect(wrapper.find("button[type='submit']").text()).toBe("Cambiar contraseña");
  });

  test("con los campos vacíos avisa y no llama al servidor", async () => {
    const cambiar = vi.spyOn(AuthRepository.prototype, "restablecerPassword").mockResolvedValue();
    const wrapper = await montarVista("/restablecer-password?token=abc");

    await wrapper.find("form").trigger("submit");

    expect(wrapper.find("[role='alert']").text()).toContain("rellena los dos campos");
    expect(cambiar).not.toHaveBeenCalled();
  });

  test("con una contraseña floja dice lo que falta y no llama al servidor", async () => {
    const cambiar = vi.spyOn(AuthRepository.prototype, "restablecerPassword").mockResolvedValue();
    const wrapper = await montarVista("/restablecer-password?token=abc");

    await rellenarYEnviar(wrapper, "abc", "abc");

    expect(wrapper.find("[role='alert']").text()).toContain("La contraseña debe tener");
    expect(cambiar).not.toHaveBeenCalled();
  });

  test("si las dos contraseñas no coinciden avisa y no llama al servidor", async () => {
    const cambiar = vi.spyOn(AuthRepository.prototype, "restablecerPassword").mockResolvedValue();
    const wrapper = await montarVista("/restablecer-password?token=abc");

    await rellenarYEnviar(wrapper, "Nueva1234!", "Nueva1234?");

    expect(wrapper.find("[role='alert']").text()).toContain("no coinciden");
    expect(cambiar).not.toHaveBeenCalled();
  });

  test("con todo bien envía el token del enlace y la contraseña nueva", async () => {
    const cambiar = vi.spyOn(AuthRepository.prototype, "restablecerPassword").mockResolvedValue();
    const wrapper = await montarVista("/restablecer-password?token=mi-token-123");

    await rellenarYEnviar(wrapper, "Nueva1234!", "Nueva1234!");

    expect(cambiar).toHaveBeenCalledWith("mi-token-123", "Nueva1234!");
  });

  test("al terminar enseña el aviso de éxito y un botón al login, sin formulario", async () => {
    vi.spyOn(AuthRepository.prototype, "restablecerPassword").mockResolvedValue();
    const wrapper = await montarVista("/restablecer-password?token=abc");

    await rellenarYEnviar(wrapper, "Nueva1234!", "Nueva1234!");

    expect(wrapper.find("[role='status']").text()).toContain("Contraseña cambiada correctamente");
    expect(wrapper.find("form").exists()).toBe(false);
    expect(wrapper.find("a[href='/login']").exists()).toBe(true);
  });

  test("un 400 enseña el motivo que explica el servidor y mantiene el formulario", async () => {
    const error = new Error("fallo");
    error.status = 400;
    error.detalle = "El enlace no es válido o ha caducado. Pide uno nuevo.";
    vi.spyOn(AuthRepository.prototype, "restablecerPassword").mockRejectedValue(error);
    const wrapper = await montarVista("/restablecer-password?token=abc");

    await rellenarYEnviar(wrapper, "Nueva1234!", "Nueva1234!");

    expect(wrapper.find("[role='alert']").text()).toContain("ha caducado");
    expect(wrapper.find("form").exists()).toBe(true);
  });

  test("un 400 por contraseña igual a la actual enseña ese motivo", async () => {
    const error = new Error("fallo");
    error.status = 400;
    error.detalle = "La nueva contraseña debe ser distinta de la actual";
    vi.spyOn(AuthRepository.prototype, "restablecerPassword").mockRejectedValue(error);
    const wrapper = await montarVista("/restablecer-password?token=abc");

    await rellenarYEnviar(wrapper, "Nueva1234!", "Nueva1234!");

    expect(wrapper.find("[role='alert']").text()).toContain("distinta de la actual");
  });

  test("un 429 explica que hay demasiados intentos", async () => {
    const error = new Error("fallo");
    error.status = 429;
    vi.spyOn(AuthRepository.prototype, "restablecerPassword").mockRejectedValue(error);
    const wrapper = await montarVista("/restablecer-password?token=abc");

    await rellenarYEnviar(wrapper, "Nueva1234!", "Nueva1234!");

    expect(wrapper.find("[role='alert']").text()).toContain("Demasiados intentos");
  });

  test("ofrece pedir un enlace nuevo por si ha caducado", async () => {
    const wrapper = await montarVista("/restablecer-password?token=abc");

    expect(wrapper.find("a[href='/olvide-password']").exists()).toBe(true);
  });
});

describe("RestablecerPasswordView: sin token válido en el enlace", () => {
  test("sin token enseña que el enlace está incompleto y no hay formulario", async () => {
    const wrapper = await montarVista("/restablecer-password");

    expect(wrapper.find("[role='alert']").text()).toContain("no está completo");
    expect(wrapper.find("form").exists()).toBe(false);
    expect(wrapper.find("a[href='/olvide-password']").exists()).toBe(true);
  });

  test("con el token vacío pasa lo mismo", async () => {
    const wrapper = await montarVista("/restablecer-password?token=");

    expect(wrapper.find("form").exists()).toBe(false);
  });

  test("con el token repetido dos veces en la dirección no se usa (no es un texto)", async () => {
    const wrapper = await montarVista("/restablecer-password?token=a&token=b");

    expect(wrapper.find("form").exists()).toBe(false);
  });
});
