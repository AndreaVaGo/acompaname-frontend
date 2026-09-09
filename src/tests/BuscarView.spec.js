import { describe, test, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import BuscarView from "../views/BuscarView.vue";
import CuidadorRepository from "../repositories/CuidadorRepository";

vi.spyOn(CuidadorRepository.prototype, "getAll").mockResolvedValue([
  {
    id: 1,
    usuarioNombre: "Pepe",
    especialidad: "Geriatría",
    tarifaHora: 15,
    tieneVehiculo: true,
    disponibleAhora: true,
  },
]);

const router = createRouter({
  history: createWebHistory(),
  routes: [],
});

describe("BuscarView", () => {
  test("muestra los cuidadores cargados", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("Pepe");
  });
});
