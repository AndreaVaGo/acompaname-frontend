import { describe, test, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import ValorarView from "../../../views/familia/ValorarView.vue";
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

  test("el botón de enviar está deshabilitado si no se ha elegido puntuación", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getById").mockResolvedValue({
      cuidadorNombre: "Pepe",
    });

    const { wrapper } = await montarVista();

    expect(wrapper.find("button[type='submit']").attributes("disabled")).toBeDefined();
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
});