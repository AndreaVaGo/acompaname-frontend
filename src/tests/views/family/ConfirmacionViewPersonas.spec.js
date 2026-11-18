import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import ConfirmacionView from "../../../views/family/ConfirmacionView.vue";
import SolicitudRepository from "../../../repositories/SolicitudRepository";

async function montarVista(solicitud) {
  vi.spyOn(SolicitudRepository.prototype, "getById").mockResolvedValue(solicitud);
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/confirmacion", name: "confirmacion", component: ConfirmacionView },
      { path: "/solicitudes", name: "solicitudes", component: { template: "<div></div>" } },
      { path: "/buscar", name: "buscar", component: { template: "<div></div>" } },
    ],
  });
  await router.push("/confirmacion?id=9");
  await router.isReady();

  const wrapper = mount(ConfirmacionView, { global: { plugins: [router] } });
  await new Promise((resolve) => setTimeout(resolve, 0));
  return wrapper;
}

function crearSolicitud(extra) {
  return {
    cuidadorNombre: "Pepe",
    tipoCuidado: "domicilio",
    fechaCuidado: "2026-10-10",
    ...extra,
  };
}

describe("ConfirmacionView: varias personas", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("enseña todas las personas con su edad", async () => {
    const wrapper = await montarVista(
      crearSolicitud({
        personas: [
          { nombre: "Carmen", edad: 82 },
          { nombre: "Antonio", edad: 85 },
        ],
      }),
    );

    expect(wrapper.text()).toContain("Personas cuidadas");
    expect(wrapper.text()).toContain("Carmen (82 años), Antonio (85 años)");
  });

  test("con una sola persona dice 'Persona cuidada' en singular", async () => {
    const wrapper = await montarVista(
      crearSolicitud({ personas: [{ nombre: "Manuel", edad: 80 }] }),
    );

    expect(wrapper.text()).toContain("Persona cuidada");
    expect(wrapper.text()).not.toContain("Personas cuidadas");
    expect(wrapper.text()).toContain("Manuel, 80 años");
  });
});
