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

describe("HistorialView ubicación del hospital", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("en un hospital pone en negrita lo que va detrás del nombre", async () => {
    const wrapper = await montarVista(
      crearSolicitud(
        "hospitalario",
        "Hospital de Cabueñes, Planta 2, Medicina Interna, habitación 214",
        "COMPLETADA"
      )
    );

    expect(wrapper.find(".historial__ubicacion").text()).toBe(
      "Planta 2, Medicina Interna, habitación 214"
    );
    expect(wrapper.text()).toContain("Hospital de Cabueñes");
  });

  test("en un domicilio no pone nada en negrita", async () => {
    const wrapper = await montarVista(
      crearSolicitud("domicilio", "Calle Uría 12, 3º B, Oviedo", "COMPLETADA")
    );

    expect(wrapper.find(".historial__ubicacion").exists()).toBe(false);
    expect(wrapper.text()).toContain("Calle Uría 12, 3º B, Oviedo");
  });

  test("si el hospital no tiene coma no pone nada en negrita", async () => {
    const wrapper = await montarVista(
      crearSolicitud("hospitalario", "Hospital de Cabueñes", "COMPLETADA")
    );

    expect(wrapper.find(".historial__ubicacion").exists()).toBe(false);
    expect(wrapper.text()).toContain("Hospital de Cabueñes");
  });

  test("en una solicitud rechazada no se muestra la dirección", async () => {
    const wrapper = await montarVista(
      crearSolicitud(
        "hospitalario",
        "Hospital de Cabueñes, Planta 2, Medicina Interna, habitación 214",
        "RECHAZADA"
      )
    );

    expect(wrapper.find(".historial__ubicacion").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("Hospital de Cabueñes");
  });
});