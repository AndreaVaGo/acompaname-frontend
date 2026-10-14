import { describe, test, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import HistorialView from "../../../views/common/HistorialView.vue";
import SolicitudRepository from "../../../repositories/SolicitudRepository";
import ValoracionRepository from "../../../repositories/ValoracionRepository";

function crearRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [{ path: "/valorar/:id", name: "valorar", component: { template: "<div></div>" } }],
  });
}

async function montarVista() {
  const router = crearRouter();
  const wrapper = mount(HistorialView, {
    global: {
      plugins: [router],
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 0));

  return wrapper;
}

describe("HistorialView", () => {
  test("muestra solo las solicitudes completadas o rechazadas", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      { id: 1, cuidadorNombre: "Pepe", nombrePaciente: "Antonio", edadPaciente: 80, tipoCuidado: "domicilio", fechaCuidado: "2026-09-01", notas: "", estado: "COMPLETADA" },
      { id: 2, cuidadorNombre: "Ana", nombrePaciente: "Luis", edadPaciente: 70, tipoCuidado: "hospitalario", fechaCuidado: "2026-09-05", notas: "", estado: "PENDIENTE" },
      { id: 3, cuidadorNombre: "Luis", nombrePaciente: "Marta", edadPaciente: 75, tipoCuidado: "domicilio", fechaCuidado: "2026-09-10", notas: "", estado: "RECHAZADA" },
    ]);
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).toContain("Luis");
    expect(wrapper.text()).not.toContain("Ana");
  });

  test("muestra 'Valoración enviada' si la solicitud ya fue valorada", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      { id: 1, cuidadorNombre: "Pepe", nombrePaciente: "Antonio", edadPaciente: 80, tipoCuidado: "domicilio", fechaCuidado: "2026-09-01", notas: "", estado: "COMPLETADA" },
    ]);
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([
      { solicitudId: 1 },
    ]);

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("Valoración enviada ✓");
  });

  test("muestra el enlace para valorar si todavía no se ha valorado", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      { id: 1, cuidadorNombre: "Pepe", nombrePaciente: "Antonio", edadPaciente: 80, tipoCuidado: "domicilio", fechaCuidado: "2026-09-01", notas: "", estado: "COMPLETADA" },
    ]);
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("Dejar valoración");
  });

  test("muestra las fechas de inicio y de fin en formato día-mes-año", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      { id: 1, cuidadorNombre: "Pepe", nombrePaciente: "Antonio", edadPaciente: 80, tipoCuidado: "domicilio", fechaCuidado: "2026-09-01", fechaFin: "2026-09-08", notas: "", estado: "COMPLETADA" },
    ]);
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("01-09-2026");
    expect(wrapper.text()).toContain("08-09-2026");
    expect(wrapper.text()).not.toContain("2026-09-01");
  });

  test("no muestra la línea de fin si la solicitud no tiene fecha de fin", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      { id: 1, cuidadorNombre: "Pepe", nombrePaciente: "Antonio", edadPaciente: 80, tipoCuidado: "domicilio", fechaCuidado: "2026-09-01", notas: "", estado: "COMPLETADA" },
    ]);
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.text()).not.toContain("Fin:");
  });

  test("muestra el mensaje de historial vacío si no hay solicitudes finalizadas", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      { id: 1, cuidadorNombre: "Pepe", nombrePaciente: "Antonio", edadPaciente: 80, tipoCuidado: "domicilio", fechaCuidado: "2026-09-01", notas: "", estado: "PENDIENTE" },
    ]);
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("Aún no tienes solicitudes en tu historial.");
  });

  test("muestra un error si falla la carga del historial", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockRejectedValue(new Error("fallo"));
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("No se pudo cargar tu historial.");
    expect(wrapper.text()).not.toContain("Aún no tienes solicitudes en tu historial.");
  });

  test("muestra las necesidades del paciente con su nombre", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      { id: 1, cuidadorNombre: "Pepe", nombrePaciente: "Antonio", edadPaciente: 80, tipoCuidado: "domicilio", fechaCuidado: "2026-09-01", notas: "", necesidades: ["higiene", "paliativos"], estado: "COMPLETADA" },
    ]);
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

    const wrapper = await montarVista();

    const etiquetas = wrapper.findAll(".historial__necesidad");
    expect(etiquetas.length).toBe(2);
    expect(etiquetas[0].text()).toBe("Higiene personal");
    expect(etiquetas[1].text()).toBe("Cuidados paliativos");
  });

  test("no muestra el bloque de necesidades si la lista está vacía", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      { id: 1, cuidadorNombre: "Pepe", nombrePaciente: "Antonio", edadPaciente: 80, tipoCuidado: "domicilio", fechaCuidado: "2026-09-01", notas: "", necesidades: [], estado: "COMPLETADA" },
    ]);
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.find(".historial__necesidades").exists()).toBe(false);
  });

  test("una solicitud sin el campo necesidades se muestra sin errores", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      { id: 1, cuidadorNombre: "Pepe", nombrePaciente: "Antonio", edadPaciente: 80, tipoCuidado: "domicilio", fechaCuidado: "2026-09-01", notas: "", estado: "COMPLETADA" },
    ]);
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.find(".historial__necesidades").exists()).toBe(false);
    expect(wrapper.text()).toContain("Pepe");
  });

  test("no muestra la línea de notas si la solicitud no tiene notas", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      { id: 1, cuidadorNombre: "Pepe", nombrePaciente: "Antonio", edadPaciente: 80, tipoCuidado: "domicilio", fechaCuidado: "2026-09-01", notas: "", estado: "COMPLETADA" },
    ]);
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.text()).not.toContain("📝");
  });

  test("muestra las notas si la solicitud las tiene", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      { id: 1, cuidadorNombre: "Pepe", nombrePaciente: "Antonio", edadPaciente: 80, tipoCuidado: "domicilio", fechaCuidado: "2026-09-01", notas: "Alergia a la penicilina", estado: "COMPLETADA" },
    ]);
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("📝 Alergia a la penicilina");
  });

  test("muestra la dirección de una solicitud completada", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      { id: 1, cuidadorNombre: "Pepe", nombrePaciente: "Antonio", edadPaciente: 80, tipoCuidado: "domicilio", fechaCuidado: "2026-09-01", notas: "", direccion: "Calle Uría 10, Oviedo", estado: "COMPLETADA" },
    ]);
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("Calle Uría 10, Oviedo");
  });

  test("no muestra la dirección de una solicitud rechazada", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      { id: 1, cuidadorNombre: "Pepe", nombrePaciente: "Antonio", edadPaciente: 80, tipoCuidado: "domicilio", fechaCuidado: "2026-09-01", notas: "", direccion: "Calle Uría 10, Oviedo", estado: "RECHAZADA" },
    ]);
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.text()).not.toContain("Calle Uría 10, Oviedo");
  });
});