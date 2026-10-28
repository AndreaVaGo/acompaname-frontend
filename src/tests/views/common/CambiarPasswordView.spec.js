import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import CambiarPasswordView from "../../../views/common/CambiarPasswordView.vue";
import UsuarioRepository from "../../../repositories/UsuarioRepository";
import { useAuthStore } from "../../../stores/auth";

// Contraseña nueva que cumple todas las reglas (mayúscula, minúscula, número y carácter especial)
const PASSWORD_NUEVA = "Nueva12345!";

function montarVista() {
  const pinia = createPinia();
  const wrapper = mount(CambiarPasswordView, {
    global: {
      plugins: [pinia],
    },
  });
  const authStore = useAuthStore(pinia);
  authStore.login(1, "ana@test.com", "actual1234", "FAMILIA");
  return { wrapper, authStore };
}

async function rellenarFormulario(wrapper, actual, nueva, repetida) {
  await wrapper.find("#password-actual").setValue(actual);
  await wrapper.find("#password-nueva").setValue(nueva);
  await wrapper.find("#password-repetida").setValue(repetida);
  await wrapper.find("form").trigger("submit");
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("CambiarPasswordView", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  test("muestra error si hay campos vacíos", async () => {
    const espia = vi.spyOn(UsuarioRepository.prototype, "cambiarPassword");
    const { wrapper } = montarVista();

    await wrapper.find("form").trigger("submit");

    expect(wrapper.text()).toContain("Por favor, rellena todos los campos.");
    expect(espia).not.toHaveBeenCalled();
  });

  test("muestra error si la contraseña nueva tiene menos de 8 caracteres", async () => {
    const espia = vi.spyOn(UsuarioRepository.prototype, "cambiarPassword");
    const { wrapper } = montarVista();

    await rellenarFormulario(wrapper, "actual1234", "corta", "corta");

    expect(wrapper.text()).toContain("al menos 8 caracteres");
    expect(espia).not.toHaveBeenCalled();
  });

  test("muestra qué le falta a una contraseña nueva débil", async () => {
    const espia = vi.spyOn(UsuarioRepository.prototype, "cambiarPassword");
    const { wrapper } = montarVista();

    await rellenarFormulario(wrapper, "actual1234", "nueva12345", "nueva12345");

    const error = wrapper.find(".cambiar-password__error").text();
    expect(error).toContain("una letra mayúscula");
    expect(error).toContain("un carácter especial");
    expect(espia).not.toHaveBeenCalled();
  });

  test("muestra error si las contraseñas nuevas no coinciden", async () => {
    const espia = vi.spyOn(UsuarioRepository.prototype, "cambiarPassword");
    const { wrapper } = montarVista();

    await rellenarFormulario(wrapper, "actual1234", PASSWORD_NUEVA, "Otra123456!");

    expect(wrapper.text()).toContain("no coinciden");
    expect(espia).not.toHaveBeenCalled();
  });

  test("no exige que la contraseña actual cumpla las reglas (puede ser antigua y débil)", async () => {
    const espia = vi
      .spyOn(UsuarioRepository.prototype, "cambiarPassword")
      .mockResolvedValue();
    const { wrapper } = montarVista();

    await rellenarFormulario(wrapper, "1234", PASSWORD_NUEVA, PASSWORD_NUEVA);

    expect(espia).toHaveBeenCalledWith(1, "1234", PASSWORD_NUEVA);
  });

  test("cambia la contraseña y actualiza las credenciales guardadas", async () => {
    const espia = vi
      .spyOn(UsuarioRepository.prototype, "cambiarPassword")
      .mockResolvedValue();
    const { wrapper, authStore } = montarVista();

    await rellenarFormulario(wrapper, "actual1234", PASSWORD_NUEVA, PASSWORD_NUEVA);

    expect(espia).toHaveBeenCalledWith(1, "actual1234", PASSWORD_NUEVA);
    expect(wrapper.text()).toContain("Contraseña cambiada correctamente.");
    expect(authStore.credenciales).toBe(btoa("ana@test.com:" + PASSWORD_NUEVA));
  });

  test("vacía los campos después de cambiar la contraseña", async () => {
    vi.spyOn(UsuarioRepository.prototype, "cambiarPassword").mockResolvedValue();
    const { wrapper } = montarVista();

    await rellenarFormulario(wrapper, "actual1234", PASSWORD_NUEVA, PASSWORD_NUEVA);

    expect(wrapper.find("#password-actual").element.value).toBe("");
    expect(wrapper.find("#password-nueva").element.value).toBe("");
    expect(wrapper.find("#password-repetida").element.value).toBe("");
  });

  test("muestra error y no cambia las credenciales si el backend rechaza el cambio", async () => {
    vi.spyOn(UsuarioRepository.prototype, "cambiarPassword").mockRejectedValue(
      new Error("Error al cambiar la contraseña")
    );
    const { wrapper, authStore } = montarVista();

    await rellenarFormulario(wrapper, "mala12345", PASSWORD_NUEVA, PASSWORD_NUEVA);

    expect(wrapper.text()).toContain("No se pudo cambiar la contraseña");
    expect(authStore.credenciales).toBe(btoa("ana@test.com:actual1234"));
  });

  test("si el servidor responde 400 pide revisar la contraseña actual y la nueva", async () => {
    const errorPassword = new Error("fallo");
    errorPassword.status = 400;
    vi.spyOn(UsuarioRepository.prototype, "cambiarPassword").mockRejectedValue(
      errorPassword
    );
    const { wrapper, authStore } = montarVista();

    await rellenarFormulario(wrapper, "mala12345", PASSWORD_NUEVA, PASSWORD_NUEVA);

    expect(wrapper.text()).toContain(
      "No se pudo cambiar la contraseña. Revisa que la actual sea correcta y que la nueva sea distinta."
    );
    expect(authStore.credenciales).toBe(btoa("ana@test.com:actual1234"));
  });

  test("si el servidor falla no habla de la contraseña actual", async () => {
    const errorServidor = new Error("fallo");
    errorServidor.status = 500;
    vi.spyOn(UsuarioRepository.prototype, "cambiarPassword").mockRejectedValue(
      errorServidor
    );
    const { wrapper, authStore } = montarVista();

    await rellenarFormulario(wrapper, "actual1234", PASSWORD_NUEVA, PASSWORD_NUEVA);

    expect(wrapper.text()).toContain(
      "No se pudo cambiar la contraseña. Ha ocurrido un error en el servidor. Inténtalo más tarde."
    );
    expect(wrapper.text()).not.toContain("Revisa que la actual sea correcta");
    expect(authStore.credenciales).toBe(btoa("ana@test.com:actual1234"));
  });
});