import { describe, test, expect, vi, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import OlvidePasswordView from "../../../views/auth/OlvidePasswordView.vue";
import AuthRepository from "../../../repositories/AuthRepository";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/login", component: { template: "<div />" } },
    { path: "/olvide-password", component: { template: "<div />" } },
  ],
});

function montarVista() {
  return mount(OlvidePasswordView, { global: { plugins: [router] } });
}

async function escribirYEnviar(wrapper, email) {
  await wrapper.find("#email").setValue(email);
  await wrapper.find("form").trigger("submit");
  await flushPromises();
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("OlvidePasswordView", () => {
  test("enseña el título, el campo de email y el botón", () => {
    const wrapper = montarVista();

    expect(wrapper.find("h1").text()).toContain("¿Has olvidado tu contraseña?");
    expect(wrapper.find("#email").exists()).toBe(true);
    expect(wrapper.find("button[type='submit']").text()).toBe("Enviar enlace");
  });

  test("con el email vacío avisa y no llama al servidor", async () => {
    const pedir = vi.spyOn(AuthRepository.prototype, "olvidePassword").mockResolvedValue("ok");
    const wrapper = montarVista();

    await wrapper.find("form").trigger("submit");

    expect(wrapper.find("[role='alert']").text()).toContain("Escribe el email");
    expect(pedir).not.toHaveBeenCalled();
  });

  test("con solo espacios tampoco llama al servidor", async () => {
    const pedir = vi.spyOn(AuthRepository.prototype, "olvidePassword").mockResolvedValue("ok");
    const wrapper = montarVista();

    await escribirYEnviar(wrapper, "   ");

    expect(pedir).not.toHaveBeenCalled();
  });

  test("envía el email sin espacios y enseña el mensaje del servidor en lugar del formulario", async () => {
    const pedir = vi
      .spyOn(AuthRepository.prototype, "olvidePassword")
      .mockResolvedValue("Si el correo está registrado, te hemos enviado un enlace");
    const wrapper = montarVista();

    await escribirYEnviar(wrapper, "  ana@test.com ");

    expect(pedir).toHaveBeenCalledWith("ana@test.com");
    expect(wrapper.find("[role='status']").text()).toContain("te hemos enviado un enlace");
    expect(wrapper.find("form").exists()).toBe(false);
  });

  test("tras pedirlo, avisa de que el enlace dura 60 minutos y deja volver al login", async () => {
    vi.spyOn(AuthRepository.prototype, "olvidePassword").mockResolvedValue("ok");
    const wrapper = montarVista();

    await escribirYEnviar(wrapper, "ana@test.com");

    expect(wrapper.text()).toContain("60 minutos");
    expect(wrapper.find("a[href='/login']").exists()).toBe(true);
  });

  test("un 400 dice que el email no parece válido y deja el formulario", async () => {
    const error = new Error("fallo");
    error.status = 400;
    vi.spyOn(AuthRepository.prototype, "olvidePassword").mockRejectedValue(error);
    const wrapper = montarVista();

    await escribirYEnviar(wrapper, "esto-no-es-un-correo");

    expect(wrapper.find("[role='alert']").text()).toContain("no parece un correo válido");
    expect(wrapper.find("form").exists()).toBe(true);
  });

  test("un 429 explica que hay demasiados intentos", async () => {
    const error = new Error("fallo");
    error.status = 429;
    vi.spyOn(AuthRepository.prototype, "olvidePassword").mockRejectedValue(error);
    const wrapper = montarVista();

    await escribirYEnviar(wrapper, "ana@test.com");

    expect(wrapper.find("[role='alert']").text()).toContain("Demasiados intentos");
  });

  test("si no llega al servidor lo dice", async () => {
    vi.spyOn(AuthRepository.prototype, "olvidePassword").mockRejectedValue(new TypeError("Failed to fetch"));
    const wrapper = montarVista();

    await escribirYEnviar(wrapper, "ana@test.com");

    expect(wrapper.find("[role='alert']").text()).toContain("No se pudo conectar con el servidor");
  });

  test("tiene un enlace para volver al login", () => {
    const wrapper = montarVista();

    expect(wrapper.find("a[href='/login']").exists()).toBe(true);
  });
});
