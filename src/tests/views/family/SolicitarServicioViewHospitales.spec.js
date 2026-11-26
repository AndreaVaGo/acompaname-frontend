import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import SolicitarServicioView from "../../../views/family/SolicitarServicioView.vue";
import CuidadorRepository from "../../../repositories/CuidadorRepository";
import { useAuthStore } from "../../../stores/auth";
import { HOSPITALES } from "../../../utils/catalogoHospitales";

async function montarVista() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: "/solicitar/:id",
        name: "solicitar",
        component: SolicitarServicioView,
      },
    ],
  });
  await router.push("/solicitar/3");
  await router.isReady();

  const pinia = createPinia();
  const wrapper = mount(SolicitarServicioView, {
    global: { plugins: [router, pinia] },
  });
  useAuthStore(pinia).login(1, "ana@test.com", "12345678", "FAMILIA");
  await new Promise((resolve) => setTimeout(resolve, 0));
  return wrapper;
}

describe("SolicitarServicioView · sugerencias de hospital", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("el campo Hospital ofrece la lista de hospitales de España", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });
    const wrapper = await montarVista();
    await wrapper.findAll(".solicitar__opcion")[0].trigger("click");

    expect(wrapper.find("#hospital").attributes("list")).toBe(
      "lista-hospitales",
    );
    const opciones = wrapper.findAll("#lista-hospitales option");
    expect(opciones).toHaveLength(HOSPITALES.length);
    const cabuenes = opciones.find(
      (o) => o.attributes("value") === "Hospital Universitario de Cabueñes",
    );
    expect(cabuenes.attributes("label")).toBe("Gijón (Asturias)");
  });

  test("se puede escribir un hospital que no está en la lista", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });
    const wrapper = await montarVista();
    await wrapper.findAll(".solicitar__opcion")[0].trigger("click");

    await wrapper.find("#hospital").setValue("Clínica Inventada");
    expect(wrapper.find("#hospital").element.value).toBe("Clínica Inventada");
  });

  test("a domicilio no hay lista de hospitales", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });
    const wrapper = await montarVista();
    await wrapper.findAll(".solicitar__opcion")[1].trigger("click");

    expect(wrapper.find("#lista-hospitales").exists()).toBe(false);
  });
});
