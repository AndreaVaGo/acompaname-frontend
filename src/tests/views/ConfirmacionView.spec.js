import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import ConfirmacionView from "../../views/ConfirmacionView.vue";
import SolicitudRepository from "../../repositories/SolicitudRepository";

function crearRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/confirmacion", name: "confirmacion", component: ConfirmacionView },
      { path: "/solicitudes", name: "solicitudes", component: { template: "<div>solicitudes</div>" } },
      { path: "/buscar", name: "buscar", component: { template: "<div>buscar</div>" } },
    ],
  });
}

async function montarVista() {
  const router = crearRouter();
  await router.push("/confirmacion?id=9");
  await router.isReady();

  const wrapper = mount(ConfirmacionView, {
    global: {
      plugins: [router],
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 0));

  return { wrapper, router };
}

describe("ConfirmacionView", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("muestra los datos reales de la solicitud enviada", async () => {
    const getByIdSpy = vi
      .spyOn(SolicitudRepository.prototype, "getById")
      .mockResolvedValue({
        cuidadorNombre: "Pepe",
        tipoCuidado: "hospitalario",
        fechaCuidado: "2026-10-10",
        nombrePaciente: "Antonio Serrano",
        edadPaciente: 81,
      });

    const { wrapper } = await montarVista();

    expect(getByIdSpy).toHaveBeenCalledWith("9");
    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).toContain("Hospital");
    expect(wrapper.text()).toContain("2026-10-10");
    expect(wrapper.text()).toContain("Antonio Serrano, 81 años");
  });

  test("muestra Domicilio cuando el cuidado es a domicilio", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getById").mockResolvedValue({
      cuidadorNombre: "Pepe",
      tipoCuidado: "domicilio",
      fechaCuidado: "2026-10-10",
      nombrePaciente: "Antonio Serrano",
      edadPaciente: 81,
    });

    const { wrapper } = await montarVista();

    expect(wrapper.text()).toContain("Domicilio");
  });

  test("muestra error si falla la carga de la solicitud", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getById").mockRejectedValue(
      new Error("fallo")
    );

    const { wrapper } = await montarVista();

    expect(wrapper.text()).toContain(
      "No se pudieron cargar los datos de la solicitud."
    );
    expect(wrapper.text()).not.toContain("Lucía Ferrer");
  });

  test("tiene enlaces a Mis solicitudes y a seguir buscando", async () => {
    vi.spyOn(SolicitudRepository.prototype, "getById").mockResolvedValue({
      cuidadorNombre: "Pepe",
      tipoCuidado: "domicilio",
      fechaCuidado: "2026-10-10",
      nombrePaciente: "Antonio Serrano",
      edadPaciente: 81,
    });

    const { wrapper } = await montarVista();

    const enlaces = wrapper.findAll("a").map((a) => a.attributes("href"));
    expect(enlaces).toContain("/solicitudes");
    expect(enlaces).toContain("/buscar");
  });
});