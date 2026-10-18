import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import SolicitudesFamiliaView from "../../../views/family/SolicitudesFamiliaView.vue";
import SolicitudRepository from "../../../repositories/SolicitudRepository";
import PagoRepository from "../../../repositories/PagoRepository";
import ValoracionRepository from "../../../repositories/ValoracionRepository";

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
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("Pepe");
  });

  test("mientras carga muestra Cargando solicitudes y no las tarjetas", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      crearSolicitud(1, "ACEPTADA"),
    ]);
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([]);
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

    // No esperamos: miramos justo después de montar
    const wrapper = mount(SolicitudesFamiliaView, {
      global: { plugins: [router] },
    });

    expect(wrapper.text()).toContain("Cargando solicitudes");
    expect(wrapper.text()).not.toContain("Pepe");
    expect(wrapper.text()).not.toContain("Pagar");

    // Dejamos que termine la carga para no dejar tareas pendientes
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  test("al terminar de cargar quita el mensaje de carga y muestra las tarjetas", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      crearSolicitud(1, "ACEPTADA"),
    ]);
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([]);
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.text()).not.toContain("Cargando solicitudes");
    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).toContain("Pagar");
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
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

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
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.findAll(".solicitudes__pagado").length).toBe(0);
  });

  test("muestra un error si falla la carga de solicitudes", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockRejectedValue(
      new Error("fallo")
    );
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([]);
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("No se pudieron cargar tus solicitudes.");
  });

  test("muestra Dejar valoración en una solicitud completada sin valorar", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      crearSolicitud(1, "COMPLETADA"),
    ]);
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([]);
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("Dejar valoración");
    expect(wrapper.text()).not.toContain("Valoración enviada");
  });

  test("muestra Valoración enviada y no el botón si la solicitud ya está valorada", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      crearSolicitud(1, "COMPLETADA"),
    ]);
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([]);
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([
      { id: 5, solicitudId: 1, puntuacion: 4 },
    ]);

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("Valoración enviada ✓");
    expect(wrapper.text()).not.toContain("Dejar valoración");
  });

  test("si falla la carga de valoraciones, muestra las solicitudes y el botón de valorar", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      crearSolicitud(1, "COMPLETADA"),
    ]);
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([]);
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockRejectedValue(
      new Error("fallo")
    );

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).toContain("Dejar valoración");
  });
});