import { describe, test, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import SolicitudesCuidadorView from "../views/SolicitudesCuidadorView.vue";
import SolicitudRepository from "../repositories/SolicitudRepository";

vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
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
]);

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
});
