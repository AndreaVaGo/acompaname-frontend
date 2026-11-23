import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import { createPinia } from "pinia";
import { readFileSync } from "node:fs";
import LoginView from "../../../views/auth/LoginView.vue";
import RegisterView from "../../../views/auth/RegisterView.vue";
import OlvidePasswordView from "../../../views/auth/OlvidePasswordView.vue";
import RoleRepository from "../../../repositories/RoleRepository";

// ACOM-238: los campos obligatorios llevan asterisco (lo pinta el CSS con la clase "obligatorio")
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/login", component: { template: "<div />" } },
    { path: "/olvide-password", component: { template: "<div />" } },
  ],
});

const esperar = () => new Promise((resolve) => setTimeout(resolve, 0));

function obligatorias(wrapper) {
  return wrapper.findAll("label.obligatorio").map((l) => l.text());
}

describe("Asteriscos de campos obligatorios", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("el registro marca los cinco campos y explica el asterisco", async () => {
    vi.spyOn(RoleRepository.prototype, "getAll").mockResolvedValue([]);
    const wrapper = mount(RegisterView, { global: { plugins: [router] } });
    await esperar();

    expect(obligatorias(wrapper)).toEqual([
      "Nombre completo",
      "Email",
      "Contraseña",
      "Repite la contraseña",
      "Teléfono",
    ]);
    expect(wrapper.find(".formulario__nota").text()).toContain("obligatorios");
  });

  test("el texto de la etiqueta no incluye el asterisco (lo pinta el CSS)", async () => {
    vi.spyOn(RoleRepository.prototype, "getAll").mockResolvedValue([]);
    const wrapper = mount(RegisterView, { global: { plugins: [router] } });
    await esperar();

    expect(wrapper.find("label[for='email']").text()).toBe("Email");
  });

  test("los campos de texto del registro llevan aria-required", async () => {
    vi.spyOn(RoleRepository.prototype, "getAll").mockResolvedValue([]);
    const wrapper = mount(RegisterView, { global: { plugins: [router] } });
    await esperar();

    for (const id of ["#nombre", "#email", "#telefono"]) {
      expect(wrapper.find(id).attributes("aria-required")).toBe("true");
    }
  });

  test("el inicio de sesión marca email y contraseña", () => {
    const wrapper = mount(LoginView, { global: { plugins: [router, createPinia()] } });

    expect(obligatorias(wrapper)).toEqual(["Email", "Contraseña"]);
    expect(wrapper.find(".formulario__nota").exists()).toBe(true);
  });

  test("recuperar contraseña marca el email", () => {
    const wrapper = mount(OlvidePasswordView, { global: { plugins: [router] } });

    expect(obligatorias(wrapper)).toEqual(["Email"]);
  });

  test("el CSS global pinta el asterisco y la nota", () => {
    const css = readFileSync("src/styles/base.css", "utf-8");

    expect(css).toContain(".obligatorio::after");
    expect(css).toContain('content: " *"');
    expect(css).toContain(".formulario__nota");
  });
});
