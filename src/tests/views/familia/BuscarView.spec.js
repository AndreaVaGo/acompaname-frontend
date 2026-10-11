import { describe, test, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import BuscarView from "../../../views/familia/BuscarView.vue";
import CuidadorRepository from "../../../repositories/CuidadorRepository";

vi.spyOn(CuidadorRepository.prototype, "getAll").mockResolvedValue([
  {
    id: 1,
    usuarioNombre: "Pepe",
    especialidad: "Geriatría",
    tarifaHora: 15,
    tieneVehiculo: true,
    disponibleAhora: true,
  },
  {
    id: 2,
    usuarioNombre: "Ana",
    especialidad: "Enfermería",
    tarifaHora: 20,
    tieneVehiculo: false,
    disponibleAhora: false,
    foto: "https://ejemplo.com/ana.jpg",
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

  test("muestra la foto si el cuidador la tiene", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    const fotos = wrapper.findAll("img");
    expect(fotos.length).toBe(1);
    expect(fotos[0].attributes("src")).toBe("https://ejemplo.com/ana.jpg");
  });
});