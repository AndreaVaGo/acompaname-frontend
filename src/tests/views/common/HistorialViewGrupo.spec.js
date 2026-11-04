import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import HistorialView from "../../../views/common/HistorialView.vue";
import SolicitudRepository from "../../../repositories/SolicitudRepository";
import ValoracionRepository from "../../../repositories/ValoracionRepository";

function crearSolicitud(extra) {
  return {
    id: 1,
    cuidadorNombre: "Pepe",
    nombrePaciente: "Lucía",
    edadPaciente: 2,
    tipoCuidado: "domicilio",
    fechaCuidado: "2026-09-01",
    notas: "",
    estado: "COMPLETADA",
    ...extra,
  };
}

async function montarVista(solicitud) {
  vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
    solicitud,
  ]);
  vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

  const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: "/valorar/:id", name: "valorar", component: { template: "<div></div>" } }],
  });
  const wrapper = mount(HistorialView, {
    global: { plugins: [router] },
  });

  await new Promise((resolve) => setTimeout(resolve, 0));

  return wrapper;
}

describe("HistorialView grupo de edad", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("muestra el grupo de edad de la persona cuidada", async () => {
    const wrapper = await montarVista(crearSolicitud({ grupoEdad: "BEBES" }));

    expect(wrapper.find(".historial__grupo").text()).toContain("Grupo de edad");
    expect(wrapper.find(".historial__grupo").text()).toContain("Bebés");
  });

  test("también lo muestra en una solicitud rechazada", async () => {
    const wrapper = await montarVista(
      crearSolicitud({ grupoEdad: "MAYORES", estado: "RECHAZADA" })
    );

    expect(wrapper.find(".historial__grupo").text()).toContain("Personas mayores");
  });

  test("no muestra la línea si la solicitud no tiene grupo de edad", async () => {
    const wrapper = await montarVista(crearSolicitud({}));

    expect(wrapper.find(".historial__grupo").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("Grupo de edad");
  });
});