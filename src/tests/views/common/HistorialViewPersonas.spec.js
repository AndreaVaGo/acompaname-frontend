import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import HistorialView from "../../../views/common/HistorialView.vue";
import SolicitudRepository from "../../../repositories/SolicitudRepository";
import ValoracionRepository from "../../../repositories/ValoracionRepository";

async function montarVista(solicitud) {
  vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([
    solicitud,
  ]);
  vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);
  const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: "/valorar/:id", name: "valorar", component: { template: "<div></div>" } }],
  });
  const wrapper = mount(HistorialView, { global: { plugins: [router] } });
  await new Promise((resolve) => setTimeout(resolve, 0));
  return wrapper;
}

function crearSolicitud(extra) {
  return {
    id: 1,
    cuidadorNombre: "Pepe",
    tipoCuidado: "domicilio",
    fechaCuidado: "2026-09-01",
    notas: "",
    estado: "COMPLETADA",
    ...extra,
  };
}

describe("HistorialView: varias personas", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("enseña todas las personas de la solicitud", async () => {
    const wrapper = await montarVista(
      crearSolicitud({
        nombrePaciente: "Zoe",
        edadPaciente: 5,
        personas: [
          { nombre: "Zoe", edad: 5 },
          { nombre: "Ada", edad: 9 },
          { nombre: "Leo", edad: 2 },
        ],
      }),
    );

    expect(wrapper.find(".historial__paciente").text()).toContain(
      "Zoe (5 años), Ada (9 años), Leo (2 años)",
    );
  });

  test("con una persona sigue enseñando 'Nombre · N años'", async () => {
    const wrapper = await montarVista(
      crearSolicitud({
        nombrePaciente: "Manuel",
        edadPaciente: 80,
        personas: [{ nombre: "Manuel", edad: 80 }],
      }),
    );

    expect(wrapper.find(".historial__paciente").text()).toBe("Manuel · 80 años");
  });

  test("una solicitud antigua sin lista funciona igual", async () => {
    const wrapper = await montarVista(
      crearSolicitud({ nombrePaciente: "Manuel", edadPaciente: 80 }),
    );

    expect(wrapper.find(".historial__paciente").text()).toBe("Manuel · 80 años");
  });

  test("con grupos distintos enseña todos los grupos", async () => {
    const wrapper = await montarVista(
      crearSolicitud({
        nombrePaciente: "Zoe",
        edadPaciente: 5,
        grupoEdad: "NINOS",
        personas: [
          { nombre: "Zoe", edad: 5, grupoEdad: "NINOS" },
          { nombre: "Abuelo", edad: 80, grupoEdad: "MAYORES" },
        ],
      }),
    );

    expect(wrapper.find(".historial__grupo").text()).toContain("Grupos de edad:");
    expect(wrapper.find(".historial__grupo").text()).toContain(
      "Niñas y niños, Personas mayores",
    );
  });

  test("con un solo grupo dice Grupo de edad en singular", async () => {
    const wrapper = await montarVista(
      crearSolicitud({ nombrePaciente: "Manuel", edadPaciente: 80, grupoEdad: "MAYORES" }),
    );

    expect(wrapper.find(".historial__grupo").text()).toContain("Grupo de edad:");
    expect(wrapper.find(".historial__grupo").text()).toContain("Personas mayores");
  });
});
