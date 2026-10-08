import { describe, test, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import HistorialView from "../../../views/comun/HistorialView.vue";
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

  test("muestra el mensaje de historial vacío si no hay solicitudes finalizadas", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
      { id: 1, cuidadorNombre: "Pepe", nombrePaciente: "Antonio", edadPaciente: 80, tipoCuidado: "domicilio", fechaCuidado: "2026-09-01", notas: "", estado: "PENDIENTE" },
    ]);
    vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("Aún no tienes solicitudes en tu historial.");
  });
});