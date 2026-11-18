import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import SolicitudesFamiliaView from "../../../views/family/SolicitudesFamiliaView.vue";
import SolicitudRepository from "../../../repositories/SolicitudRepository";
import PagoRepository from "../../../repositories/PagoRepository";
import ValoracionRepository from "../../../repositories/ValoracionRepository";
import MensajeRepository from "../../../repositories/MensajeRepository";

const router = createRouter({ history: createWebHistory(), routes: [] });

function crearSolicitud(id) {
  return {
    id: id,
    cuidadorNombre: "Pepe",
    nombrePaciente: "Antonio",
    tipoCuidado: "Hospitalario",
    fechaCuidado: "2026-09-10",
    notas: "test",
    estado: "ACEPTADA",
  };
}

async function montarVista() {
  vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
    crearSolicitud(1),
    crearSolicitud(2),
  ]);
  vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([]);
  vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

  const wrapper = mount(SolicitudesFamiliaView, { global: { plugins: [router] } });
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
  return wrapper;
}

describe("SolicitudesFamiliaView · mensajes sin leer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("enseña el número de mensajes sin leer solo en la solicitud que los tiene", async () => {
    vi.spyOn(MensajeRepository.prototype, "getNoLeidos").mockResolvedValue({
      total: 2,
      porSolicitud: { 1: 2 },
    });

    const wrapper = await montarVista();

    const numeros = wrapper.findAll(".solicitudes__chat-nuevos");
    expect(numeros).toHaveLength(1);
    expect(numeros[0].text()).toBe("2");
  });

  test("si falla la consulta de mensajes las solicitudes se ven igual, sin números", async () => {
    vi.spyOn(MensajeRepository.prototype, "getNoLeidos").mockRejectedValue(new Error("fallo"));

    const wrapper = await montarVista();

    expect(wrapper.findAll(".solicitudes__chat-nuevos")).toHaveLength(0);
    expect(wrapper.text()).toContain("Pepe");
  });

  test("sin mensajes sin leer no sale ningún número", async () => {
    vi.spyOn(MensajeRepository.prototype, "getNoLeidos").mockResolvedValue({
      total: 0,
      porSolicitud: {},
    });

    const wrapper = await montarVista();

    expect(wrapper.findAll(".solicitudes__chat-nuevos")).toHaveLength(0);
  });
});
