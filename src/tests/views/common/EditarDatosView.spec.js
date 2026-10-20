import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import EditarDatosView from "../../../views/common/EditarDatosView.vue";
import UsuarioRepository from "../../../repositories/UsuarioRepository";
import { useAuthStore } from "../../../stores/auth";

const usuarioInicial = {
  id: 1,
  nombre: "Ana",
  email: "ana@test.com",
  telefono: "600111222",
  roles: ["FAMILIA"],
};

function esperar() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function montarVista() {
  const pinia = createPinia();
  setActivePinia(pinia);
  const authStore = useAuthStore(pinia);
  authStore.login(1, "ana@test.com", "12345678", "FAMILIA");

  const wrapper = mount(EditarDatosView, {
    global: {
      plugins: [pinia],
      stubs: { RouterLink: true },
    },
  });
  await esperar();
  return { wrapper, authStore };
}

async function enviarFormulario(wrapper, nombre, email, telefono) {
  await wrapper.find("#nombre").setValue(nombre);
  await wrapper.find("#email").setValue(email);
  await wrapper.find("#telefono").setValue(telefono);
  await wrapper.find("form").trigger("submit");
  await esperar();
}

describe("EditarDatosView", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  test("carga los datos del usuario en el formulario", async () => {
    vi.spyOn(UsuarioRepository.prototype, "getById").mockResolvedValue(
      usuarioInicial
    );

    const { wrapper } = await montarVista();

    expect(wrapper.find("#nombre").element.value).toBe("Ana");
    expect(wrapper.find("#email").element.value).toBe("ana@test.com");
    expect(wrapper.find("#telefono").element.value).toBe("600111222");
  });

  test("muestra error si no se pueden cargar los datos", async () => {
    vi.spyOn(UsuarioRepository.prototype, "getById").mockRejectedValue(
      new Error("fallo")
    );

    const { wrapper } = await montarVista();

    expect(wrapper.text()).toContain("No se pudieron cargar tus datos.");
  });

  test("muestra el motivo si el servidor responde con un error al cargar los datos", async () => {
    const errorNoEncontrado = new Error("fallo");
    errorNoEncontrado.status = 404;
    vi.spyOn(UsuarioRepository.prototype, "getById").mockRejectedValue(
      errorNoEncontrado
    );

    const { wrapper } = await montarVista();

    expect(wrapper.text()).toContain(
      "No se pudieron cargar tus datos. No se ha encontrado lo que buscas."
    );
  });

  test("muestra error si hay algún campo vacío", async () => {
    vi.spyOn(UsuarioRepository.prototype, "getById").mockResolvedValue(
      usuarioInicial
    );
    const espia = vi.spyOn(UsuarioRepository.prototype, "actualizarContacto");
    const { wrapper } = await montarVista();

    await enviarFormulario(wrapper, "", "ana@test.com", "600111222");

    expect(wrapper.text()).toContain("Por favor, rellena todos los campos.");
    expect(espia).not.toHaveBeenCalled();
  });

  test("muestra error si el email no tiene formato válido", async () => {
    vi.spyOn(UsuarioRepository.prototype, "getById").mockResolvedValue(
      usuarioInicial
    );
    const espia = vi.spyOn(UsuarioRepository.prototype, "actualizarContacto");
    const { wrapper } = await montarVista();

    await enviarFormulario(wrapper, "Ana", "esto-no-es-un-email", "600111222");

    expect(wrapper.text()).toContain("El email no tiene un formato válido.");
    expect(espia).not.toHaveBeenCalled();
  });

  test("guarda los datos nuevos y muestra el mensaje de éxito", async () => {
    vi.spyOn(UsuarioRepository.prototype, "getById").mockResolvedValue(
      usuarioInicial
    );
    const espia = vi
      .spyOn(UsuarioRepository.prototype, "actualizarContacto")
      .mockResolvedValue({
        ...usuarioInicial,
        nombre: "Ana Nueva",
        telefono: "699000111",
      });
    const { wrapper } = await montarVista();

    await enviarFormulario(wrapper, "Ana Nueva", "ana@test.com", "699000111");

    expect(espia).toHaveBeenCalledWith(
      1,
      "Ana Nueva",
      "ana@test.com",
      "699000111"
    );
    expect(wrapper.text()).toContain("Datos actualizados correctamente.");
  });

  test("si cambia el email actualiza la sesión", async () => {
    vi.spyOn(UsuarioRepository.prototype, "getById").mockResolvedValue(
      usuarioInicial
    );
    vi.spyOn(UsuarioRepository.prototype, "actualizarContacto").mockResolvedValue(
      { ...usuarioInicial, email: "nueva@test.com" }
    );
    const { wrapper, authStore } = await montarVista();

    await enviarFormulario(wrapper, "Ana", "nueva@test.com", "600111222");

    expect(authStore.email).toBe("nueva@test.com");
    expect(authStore.credenciales).toBe(btoa("nueva@test.com:12345678"));
  });

  test("si no cambia el email no toca las credenciales", async () => {
    vi.spyOn(UsuarioRepository.prototype, "getById").mockResolvedValue(
      usuarioInicial
    );
    vi.spyOn(UsuarioRepository.prototype, "actualizarContacto").mockResolvedValue(
      { ...usuarioInicial, nombre: "Ana Nueva" }
    );
    const { wrapper, authStore } = await montarVista();

    await enviarFormulario(wrapper, "Ana Nueva", "ana@test.com", "600111222");

    expect(authStore.credenciales).toBe(btoa("ana@test.com:12345678"));
  });

  test("muestra error si el backend rechaza los datos", async () => {
    vi.spyOn(UsuarioRepository.prototype, "getById").mockResolvedValue(
      usuarioInicial
    );
    vi.spyOn(UsuarioRepository.prototype, "actualizarContacto").mockRejectedValue(
      new Error("Error al actualizar los datos")
    );
    const { wrapper, authStore } = await montarVista();

    await enviarFormulario(wrapper, "Ana", "repetido@test.com", "600111222");

    expect(wrapper.text()).toContain("No se pudieron guardar los datos.");
    expect(authStore.email).toBe("ana@test.com");
  });

  test("si el email ya está en uso muestra el motivo que da el servidor", async () => {
    const errorEmail = new Error("fallo");
    errorEmail.status = 409;
    errorEmail.detalle = "Ya existe un usuario con ese email";
    vi.spyOn(UsuarioRepository.prototype, "getById").mockResolvedValue(
      usuarioInicial
    );
    vi.spyOn(UsuarioRepository.prototype, "actualizarContacto").mockRejectedValue(
      errorEmail
    );
    const { wrapper, authStore } = await montarVista();

    await enviarFormulario(wrapper, "Ana", "repetido@test.com", "600111222");

    expect(wrapper.text()).toContain(
      "No se pudieron guardar los datos. Ya existe un usuario con ese email."
    );
    expect(authStore.email).toBe("ana@test.com");
  });
});