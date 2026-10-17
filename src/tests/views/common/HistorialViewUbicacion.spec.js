import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import HistorialView from "../../../views/common/HistorialView.vue";
import SolicitudRepository from "../../../repositories/SolicitudRepository";
import ValoracionRepository from "../../../repositories/ValoracionRepository";

function crearSolicitud(tipoCuidado, direccion, estado) {
  return {
    id: 1,
    cuidadorNombre: "Pepe",
    nombrePaciente: "Antonio",
    edadPaciente: 80,
    tipoCuidado: tipoCuidado,
    direccion: direccion,
    fechaCuidado: "2026-09-01",
    notas: "",
    estado: estado,
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

describe("HistorialView dirección en negrita", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("en un hospital toda la dirección va en negrita", async () => {
    const wrapper = await montarVista(
      crearSolicitud(
        "hospitalario",
        "Hospital de Cabueñes, Planta 2, Medicina Interna, habitación 214",
        "COMPLETADA"
      )
    );

    expect(wrapper.find(".historial__direccion").text()).toBe(
      "Hospital de Cabueñes, Planta 2, Medicina Interna, habitación 214"
    );
  });

  test("en un domicilio toda la dirección va en negrita", async () => {
    const wrapper = await montarVista(
      crearSolicitud("domicilio", "Calle Uría 12, 3º B, Oviedo", "COMPLETADA")
    );

    expect(wrapper.find(".historial__direccion").text()).toBe(
      "Calle Uría 12, 3º B, Oviedo"
    );
  });

  test("en una solicitud rechazada no se muestra la dirección", async () => {
    const wrapper = await montarVista(
      crearSolicitud(
        "hospitalario",
        "Hospital de Cabueñes, Planta 2, Medicina Interna, habitación 214",
        "RECHAZADA"
      )
    );

    expect(wrapper.find(".historial__direccion").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("Hospital de Cabueñes");
  });

  test("si la solicitud no tiene dirección no se muestra esa línea", async () => {
    const wrapper = await montarVista(
      crearSolicitud("domicilio", "", "COMPLETADA")
    );

    expect(wrapper.find(".historial__direccion").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("📍");
  });
});