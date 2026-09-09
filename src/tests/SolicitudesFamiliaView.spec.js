import { describe, test, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import SolicitudesFamiliaView from "../views/SolicitudesFamiliaView.vue";
import SolicitudRepository from "../repositories/SolicitudRepository";

vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
  {
    id: 1,
    cuidadorNombre: "Pepe",
    nombrePaciente: "Antonio",
    tipoCuidado: "Hospitalario",
    fechaCuidado: "2026-09-10",
    notas: "test",
    estado: "PENDIENTE",
  },
]);

const router = createRouter({
  history: createWebHistory(),
  routes: [],
});

describe("SolicitudesFamiliaView", () => {
  test("muestra las solicitudes cargadas", async () => {
    const wrapper = mount(SolicitudesFamiliaView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("Pepe");
  });
});
