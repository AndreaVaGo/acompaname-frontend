import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import SolicitudesFamiliaView from "../../../views/family/SolicitudesFamiliaView.vue";
import SolicitudRepository from "../../../repositories/SolicitudRepository";
import PagoRepository from "../../../repositories/PagoRepository";

const router = createRouter({
  history: createWebHistory(),
  routes: [],
});

function crearSolicitud(id, estado) {
  return {
    id: id,
    cuidadorNombre: "Pepe",
    nombrePaciente: "Antonio",
    tipoCuidado: "Hospitalario",
    fechaCuidado: "2026-09-10",
    notas: "test",
    estado: estado,
  };
}

async function montarVista() {
  const wrapper = mount(SolicitudesFamiliaView, {
    global: { plugins: [router] },
  });

  await new Promise((resolve) => setTimeout(resolve, 0));

  return wrapper;
}

describe("SolicitudesFamiliaView", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("muestra las solicitudes cargadas", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      crearSolicitud(1, "PENDIENTE"),
    ]);
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("Pepe");
  });

  test("marca como pagada solo la solicitud con el pago completado", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      crearSolicitud(1, "ACEPTADA"),
      crearSolicitud(2, "ACEPTADA"),
    ]);
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([
      { id: 10, solicitudId: 1, estado: "COMPLETADO" },
      { id: 11, solicitudId: 2, estado: "PENDIENTE" },
    ]);

    const wrapper = await montarVista();

    expect(wrapper.findAll(".solicitudes__pagado").length).toBe(1);
    expect(wrapper.text()).toContain("Pagar");
  });

  test("si falla la carga de pagos, muestra las solicitudes sin marcar ninguna como pagada", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      crearSolicitud(1, "ACEPTADA"),
    ]);
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockRejectedValue(
      new Error("fallo")
    );

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.findAll(".solicitudes__pagado").length).toBe(0);
  });

  test("muestra un error si falla la carga de solicitudes", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockRejectedValue(
      new Error("fallo")
    );
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("No se pudieron cargar tus solicitudes.");
  });
});