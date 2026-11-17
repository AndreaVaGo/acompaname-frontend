import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import EnviarSugerenciaView from "../../../views/common/EnviarSugerenciaView.vue";
import SugerenciaRepository from "../../../repositories/SugerenciaRepository";

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: "/", name: "landing", component: { template: "<div>inicio</div>" } }],
});

function montarVista() {
  return mount(EnviarSugerenciaView, { global: { plugins: [router] } });
}

async function esperar() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("EnviarSugerenciaView", () => {
  test("muestra el título, el campo de texto y el contador", () => {
    const wrapper = montarVista();

    expect(wrapper.find("h1").text()).toBe("Enviar una sugerencia");
    expect(wrapper.find("#sugerencia").exists()).toBe(true);
    expect(wrapper.find(".sugerencia__contador").text()).toBe("0/1000");
  });

  test("el campo no deja escribir más de 1000 caracteres", () => {
    const wrapper = montarVista();

    expect(wrapper.find("#sugerencia").attributes("maxlength")).toBe("1000");
  });

  test("el botón está desactivado si no hay texto o solo hay espacios", async () => {
    const wrapper = montarVista();
    const boton = wrapper.find("button[type='submit']");

    expect(boton.attributes("disabled")).toBeDefined();

    await wrapper.find("#sugerencia").setValue("     ");

    expect(boton.attributes("disabled")).toBeDefined();
  });

  test("al escribir se activa el botón y el contador cuenta los caracteres", async () => {
    const wrapper = montarVista();

    await wrapper.find("#sugerencia").setValue("Más colores");

    expect(wrapper.find("button[type='submit']").attributes("disabled")).toBeUndefined();
    expect(wrapper.find(".sugerencia__contador").text()).toBe("11/1000");
  });

  test("al enviar manda el texto sin espacios de los lados, avisa y vacía el campo", async () => {
    const crear = vi.spyOn(SugerenciaRepository.prototype, "create").mockResolvedValue({ id: 1 });
    const wrapper = montarVista();
    await wrapper.find("#sugerencia").setValue("  Más colores  ");

    await wrapper.find("form").trigger("submit.prevent");
    await esperar();

    expect(crear).toHaveBeenCalledWith("Más colores");
    expect(wrapper.find(".sugerencia__ok").text()).toContain("Hemos recibido tu sugerencia");
    expect(wrapper.find("#sugerencia").element.value).toBe("");
    expect(wrapper.find(".sugerencia__error").exists()).toBe(false);
  });

  test("sin texto no se envía nada", async () => {
    const crear = vi.spyOn(SugerenciaRepository.prototype, "create").mockResolvedValue({ id: 1 });
    const wrapper = montarVista();

    await wrapper.find("form").trigger("submit.prevent");

    expect(crear).not.toHaveBeenCalled();
  });

  test("si falla, enseña el motivo y conserva lo escrito", async () => {
    const falloTexto = new Error("fallo");
    falloTexto.status = 400;
    vi.spyOn(SugerenciaRepository.prototype, "create").mockRejectedValue(falloTexto);
    const wrapper = montarVista();
    await wrapper.find("#sugerencia").setValue("Más colores");

    await wrapper.find("form").trigger("submit.prevent");
    await esperar();

    expect(wrapper.find(".sugerencia__error").text()).toBe(
      "No se pudo enviar la sugerencia. Los datos enviados no son correctos."
    );
    expect(wrapper.find("#sugerencia").element.value).toBe("Más colores");
    expect(wrapper.find(".sugerencia__ok").exists()).toBe(false);
  });

  test("si hay demasiados intentos lo explica", async () => {
    const demasiados = new Error("fallo");
    demasiados.status = 429;
    vi.spyOn(SugerenciaRepository.prototype, "create").mockRejectedValue(demasiados);
    const wrapper = montarVista();
    await wrapper.find("#sugerencia").setValue("Hola");

    await wrapper.find("form").trigger("submit.prevent");
    await esperar();

    expect(wrapper.find(".sugerencia__error").text()).toContain("Demasiados intentos");
  });

  test("después de un fallo se puede volver a intentar y el aviso de error desaparece", async () => {
    const crear = vi
      .spyOn(SugerenciaRepository.prototype, "create")
      .mockRejectedValueOnce(new Error("fallo"))
      .mockResolvedValueOnce({ id: 1 });
    const wrapper = montarVista();
    await wrapper.find("#sugerencia").setValue("Hola");
    await wrapper.find("form").trigger("submit.prevent");
    await esperar();
    expect(wrapper.find(".sugerencia__error").exists()).toBe(true);

    await wrapper.find("form").trigger("submit.prevent");
    await esperar();

    expect(crear).toHaveBeenCalledTimes(2);
    expect(wrapper.find(".sugerencia__error").exists()).toBe(false);
    expect(wrapper.find(".sugerencia__ok").exists()).toBe(true);
  });

  test("tiene un enlace para volver al inicio", () => {
    const wrapper = montarVista();

    expect(wrapper.find(".sugerencia__volver").attributes("href")).toBe("/");
  });
});
