import { describe, test, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import ValorarView from "../../../views/family/ValorarView.vue";
import SolicitudRepository from "../../../repositories/SolicitudRepository";
import ValoracionRepository from "../../../repositories/ValoracionRepository";

function crearRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/valorar/:id", name: "valorar", component: ValorarView },
      { path: "/historial", name: "historial", component: { template: "<div>historial</div>" } },
    ],
  });
}

async function montarVista() {
  const router = crearRouter();
  await router.push("/valorar/7");
  await router.isReady();

  const wrapper = mount(ValorarView, {
    global: {
      plugins: [router],
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 0));

  return { wrapper, router };
}

describe("ValorarView", () => {
  test("muestra el nombre del cuidador tras cargar la solicitud", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getById").mockResolvedValue({
      cuidadorNombre: "Pepe",
    });

    const { wrapper } = await montarVista();

    expect(wrapper.text()).toContain("Pepe");
  });

  test("muestra error si falla la carga de la solicitud", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getById").mockRejectedValue(
      new Error("fallo")
    );

    const { wrapper } = await montarVista();

    expect(wrapper.text()).toContain("No se pudo cargar la solicitud.");
  });

  test("muestra el motivo si la solicitud no existe", async () => {
    const errorNoEncontrado = new Error("fallo");
    errorNoEncontrado.status = 404;
    vi.spyOn(SolicitudRepository.prototype, "getById").mockRejectedValue(
      errorNoEncontrado
    );

    const { wrapper } = await montarVista();

    expect(wrapper.text()).toContain(
      "No se pudo cargar la solicitud. No se ha encontrado lo que buscas."
    );
  });

  test("sin puntuación no se envía y se explica bajo las estrellas", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getById").mockResolvedValue({
      cuidadorNombre: "Pepe",
    });
    const crear = vi
      .spyOn(ValoracionRepository.prototype, "create")
      .mockResolvedValue({});
    crear.mockClear();

    const { wrapper } = await montarVista();

    expect(wrapper.find("button[type='submit']").attributes("disabled")).toBeUndefined();
    await wrapper.find("form").trigger("submit");

    expect(wrapper.find("#error-puntuacion").text()).toBe(
      "Elige de 1 a 5 estrellas.",
    );
    expect(wrapper.find(".valorar__error").text()).toBe(
      "Revisa los campos marcados en rojo.",
    );
    expect(crear).not.toHaveBeenCalled();

    // Al elegir una estrella, el aviso desaparece
    await wrapper.findAll(".valorar__estrella")[3].trigger("click");
    expect(wrapper.find("#error-puntuacion").exists()).toBe(false);
  });

  test("un comentario de más de 500 caracteres se marca en su campo", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getById").mockResolvedValue({
      cuidadorNombre: "Pepe",
    });
    const crear = vi
      .spyOn(ValoracionRepository.prototype, "create")
      .mockResolvedValue({});
    crear.mockClear();

    const { wrapper } = await montarVista();
    await wrapper.findAll(".valorar__estrella")[3].trigger("click");
    await wrapper.find("#comentario").setValue("a".repeat(501));
    await wrapper.find("form").trigger("submit");

    expect(wrapper.find("#error-comentario").text()).toContain("500");
    expect(wrapper.find("#comentario").attributes("aria-invalid")).toBe("true");
    expect(crear).not.toHaveBeenCalled();
  });

  test("al hacer click en una estrella se habilita el botón de enviar", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getById").mockResolvedValue({
      cuidadorNombre: "Pepe",
    });

    const { wrapper } = await montarVista();

    const estrellas = wrapper.findAll(".valorar__estrella");
    await estrellas[2].trigger("click");

    expect(wrapper.find("button[type='submit']").attributes("disabled")).toBeUndefined();
  });

  test("envía la valoración correctamente y redirige al historial", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getById").mockResolvedValue({
      cuidadorNombre: "Pepe",
    });
    const createSpy = vi
      .spyOn(ValoracionRepository.prototype, "create")
      .mockResolvedValue({});

    const { wrapper, router } = await montarVista();

    const estrellas = wrapper.findAll(".valorar__estrella");
    await estrellas[3].trigger("click");
    await wrapper.find("#comentario").setValue("Muy buena atención");

    await wrapper.find("form").trigger("submit.prevent");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        comentario: "Muy buena atención",
        puntuacion: 4,
        solicitudId: 7,
      })
    );
    expect(router.currentRoute.value.name).toBe("historial");
  });

  test("no envía la fecha: la pone el servidor", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getById").mockResolvedValue({
      cuidadorNombre: "Pepe",
    });
    const createSpy = vi
      .spyOn(ValoracionRepository.prototype, "create")
      .mockResolvedValue({});

    const { wrapper } = await montarVista();

    const estrellas = wrapper.findAll(".valorar__estrella");
    await estrellas[4].trigger("click");
    await wrapper.find("form").trigger("submit.prevent");
    await new Promise((resolve) => setTimeout(resolve, 0));

    const datosEnviados = createSpy.mock.calls[0][0];
    expect(datosEnviados.fecha).toBeUndefined();
  });

  test("muestra error si falla el envío de la valoración", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getById").mockResolvedValue({
      cuidadorNombre: "Pepe",
    });
    vi.spyOn(ValoracionRepository.prototype, "create").mockRejectedValue(
      new Error("fallo")
    );

    const { wrapper } = await montarVista();

    const estrellas = wrapper.findAll(".valorar__estrella");
    await estrellas[0].trigger("click");

    await wrapper.find("form").trigger("submit.prevent");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("No se pudo enviar la valoración.");
  });

  test("muestra el motivo si la solicitud ya tiene una valoración", async () => {
    const errorConflicto = new Error("fallo");
    errorConflicto.status = 409;
    errorConflicto.detalle = "Esta solicitud ya tiene una valoración";
    vi.spyOn(SolicitudRepository.prototype, "getById").mockResolvedValue({
      cuidadorNombre: "Pepe",
    });
    vi.spyOn(ValoracionRepository.prototype, "create").mockRejectedValue(
      errorConflicto
    );

    const { wrapper } = await montarVista();

    const estrellas = wrapper.findAll(".valorar__estrella");
    await estrellas[0].trigger("click");

    await wrapper.find("form").trigger("submit.prevent");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain(
      "No se pudo enviar la valoración. Esta solicitud ya tiene una valoración."
    );
  });
});