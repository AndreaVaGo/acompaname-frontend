import { describe, test, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import SolicitudesCuidadorView from "../../../views/cuidador/SolicitudesCuidadorView.vue";
import SolicitudRepository from "../../../repositories/SolicitudRepository";

// Cada test recibe una solicitud nueva, porque la vista cambia su estado
vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockImplementation(
  () =>
    Promise.resolve([
      {
        id: 1,
        familiaNombre: "Ana",
        nombrePaciente: "Antonio",
        edadPaciente: 81,
        tipoCuidado: "Hospitalario",
        fechaCuidado: "2026-09-10",
        notas: "test",
        estado: "PENDIENTE",
      },
    ]),
);

const router = createRouter({
  history: createWebHistory(),
  routes: [],
});

describe("SolicitudesCuidadorView", () => {
  test("muestra las solicitudes recibidas", async () => {
    const wrapper = mount(SolicitudesCuidadorView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("Ana");
  });

  test("muestra un error si no se puede aceptar la solicitud", async () => {
    vi.spyOn(SolicitudRepository.prototype, "cambiarEstado").mockRejectedValue(
      new Error("fallo"),
    );
    const wrapper = mount(SolicitudesCuidadorView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("button.btn--primary").trigger("click");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("No se pudo aceptar la solicitud.");
  });

  test("al aceptar una solicitud pasa a estar aceptada", async () => {
    vi.spyOn(SolicitudRepository.prototype, "cambiarEstado").mockResolvedValue({
      estado: "ACEPTADA",
    });
    const wrapper = mount(SolicitudesCuidadorView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("button.btn--primary").trigger("click");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("Aceptada");
  });

  test("al rechazar una solicitud pasa a estar rechazada", async () => {
    vi.spyOn(SolicitudRepository.prototype, "cambiarEstado").mockResolvedValue({
      estado: "RECHAZADA",
    });
    const wrapper = mount(SolicitudesCuidadorView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("button.btn--secondary").trigger("click");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("Rechazada");
  });

  test("muestra un error si no se puede rechazar la solicitud", async () => {
    vi.spyOn(SolicitudRepository.prototype, "cambiarEstado").mockRejectedValue(
      new Error("fallo"),
    );
    const wrapper = mount(SolicitudesCuidadorView, {
      global: { plugins: [router] },
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("button.btn--secondary").trigger("click");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("No se pudo rechazar la solicitud.");
  });
});