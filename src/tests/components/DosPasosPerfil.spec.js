import { describe, test, expect, vi, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import DosPasosPerfil from "../../components/DosPasosPerfil.vue";
import DosPasosRepository from "../../repositories/DosPasosRepository";

async function montar(activo = false) {
  vi.spyOn(DosPasosRepository.prototype, "getEstado").mockResolvedValue({ activo });
  const wrapper = mount(DosPasosPerfil);
  await flushPromises();
  return wrapper;
}

async function abrirYEscribir(wrapper, password) {
  await wrapper.find(".dos-pasos__boton").trigger("click");
  await wrapper.find("#dos-pasos-password").setValue(password);
}

describe("DosPasosPerfil", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("si está desactivado lo dice y ofrece activarlo", async () => {
    const wrapper = await montar(false);

    expect(wrapper.find("[data-testid='estado-dos-pasos']").text()).toBe("Desactivado");
    expect(wrapper.find(".dos-pasos__boton").text()).toBe("Activar");
    expect(wrapper.find(".dos-pasos__escudo--activo").exists()).toBe(false);
  });

  test("si está activado lo dice, el escudo late y ofrece desactivarlo", async () => {
    const wrapper = await montar(true);

    expect(wrapper.find("[data-testid='estado-dos-pasos']").text()).toBe("Activado");
    expect(wrapper.find(".dos-pasos__boton").text()).toBe("Desactivar");
    expect(wrapper.find(".dos-pasos__escudo--activo").exists()).toBe(true);
  });

  test("si no se puede consultar el estado, no enseña el bloque", async () => {
    vi.spyOn(DosPasosRepository.prototype, "getEstado").mockRejectedValue(new Error("fallo"));
    const wrapper = mount(DosPasosPerfil);
    await flushPromises();

    expect(wrapper.find(".dos-pasos").exists()).toBe(false);
  });

  test("el formulario de la contraseña está cerrado hasta pulsar el botón", async () => {
    const wrapper = await montar(false);
    expect(wrapper.find("#dos-pasos-password").exists()).toBe(false);

    await wrapper.find(".dos-pasos__boton").trigger("click");

    expect(wrapper.find("#dos-pasos-password").exists()).toBe(true);
    expect(wrapper.find(".dos-pasos__boton").exists()).toBe(false);
  });

  test("activar envía true con la contraseña y actualiza el estado", async () => {
    const cambiar = vi
      .spyOn(DosPasosRepository.prototype, "cambiar")
      .mockResolvedValue({ activo: true });
    const wrapper = await montar(false);
    await abrirYEscribir(wrapper, "Clave123!");

    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(cambiar).toHaveBeenCalledWith(true, "Clave123!");
    expect(wrapper.find("[data-testid='estado-dos-pasos']").text()).toBe("Activado");
    expect(wrapper.find(".dos-pasos__aviso").text()).toContain("te pediremos un código");
    expect(wrapper.find("#dos-pasos-password").exists()).toBe(false);
  });

  test("desactivar envía false con la contraseña", async () => {
    const cambiar = vi
      .spyOn(DosPasosRepository.prototype, "cambiar")
      .mockResolvedValue({ activo: false });
    const wrapper = await montar(true);
    await abrirYEscribir(wrapper, "Clave123!");

    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(cambiar).toHaveBeenCalledWith(false, "Clave123!");
    expect(wrapper.find("[data-testid='estado-dos-pasos']").text()).toBe("Desactivado");
    expect(wrapper.find(".dos-pasos__aviso").text()).toContain("has desactivado");
  });

  test("sin contraseña no llama al servidor", async () => {
    const cambiar = vi.spyOn(DosPasosRepository.prototype, "cambiar");
    const wrapper = await montar(false);
    await wrapper.find(".dos-pasos__boton").trigger("click");

    await wrapper.find("form").trigger("submit");

    expect(cambiar).not.toHaveBeenCalled();
    expect(wrapper.find(".dos-pasos__error").text()).toBe("Escribe tu contraseña para confirmar.");
  });

  test("con la contraseña incorrecta (400) lo dice y no cambia el estado", async () => {
    const error400 = new Error("fallo");
    error400.status = 400;
    vi.spyOn(DosPasosRepository.prototype, "cambiar").mockRejectedValue(error400);
    const wrapper = await montar(false);
    await abrirYEscribir(wrapper, "mala");

    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.find(".dos-pasos__error").text()).toBe("La contraseña no es correcta.");
    expect(wrapper.find(".dos-pasos__error").attributes("role")).toBe("alert");
    expect(wrapper.find("[data-testid='estado-dos-pasos']").text()).toBe("Desactivado");
  });

  test("con otro error explica el motivo", async () => {
    const error429 = new Error("fallo");
    error429.status = 429;
    vi.spyOn(DosPasosRepository.prototype, "cambiar").mockRejectedValue(error429);
    const wrapper = await montar(false);
    await abrirYEscribir(wrapper, "Clave123!");

    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(wrapper.find(".dos-pasos__error").text()).toContain(
      "No se pudo hacer el cambio. Demasiados intentos."
    );
  });

  test("Cancelar cierra el formulario y borra lo escrito", async () => {
    const wrapper = await montar(false);
    await abrirYEscribir(wrapper, "Clave123!");

    await wrapper.find(".dos-pasos__botones .btn--secondary").trigger("click");
    await wrapper.find(".dos-pasos__boton").trigger("click");

    expect(wrapper.find("#dos-pasos-password").element.value).toBe("");
  });
});
