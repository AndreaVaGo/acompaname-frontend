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
    ciudad: "Oviedo",
  },
  {
    id: 2,
    usuarioNombre: "Ana",
    especialidad: "Enfermería",
    tarifaHora: 20,
    tieneVehiculo: false,
    disponibleAhora: false,
    foto: "https://ejemplo.com/ana.jpg",
    ciudad: "Gijón",
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

  test("muestra la ciudad del cuidador en la tarjeta", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("Oviedo");
    expect(wrapper.text()).toContain("Gijón");
  });

  test("filtra los cuidadores por ciudad", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-ciudad").setValue("oviedo");

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).not.toContain("Ana");
  });

  test("combina el filtro de ciudad con la búsqueda por texto", async () => {
    const wrapper = mount(BuscarView, {
      global: { plugins: [router] },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await wrapper.find("#filtro-ciudad").setValue("Oviedo");
    await wrapper.find(".buscar__input").setValue("Enfermería");

    expect(wrapper.text()).not.toContain("Pepe");
    expect(wrapper.text()).not.toContain("Ana");
    expect(wrapper.text()).toContain("0 cuidadores");
  });
});