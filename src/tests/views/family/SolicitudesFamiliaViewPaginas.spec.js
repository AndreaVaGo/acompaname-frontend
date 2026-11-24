import { describe, test, expect, vi, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import SolicitudesFamiliaView from "../../../views/family/SolicitudesFamiliaView.vue";
import SolicitudRepository from "../../../repositories/SolicitudRepository";
import PagoRepository from "../../../repositories/PagoRepository";
import ValoracionRepository from "../../../repositories/ValoracionRepository";
import MensajeRepository from "../../../repositories/MensajeRepository";
import { pagina } from "../../ayudas/paginaFalsa";

const router = createRouter({ history: createWebHistory(), routes: [] });

function solicitud(id, cuidador) {
  return {
    id: id,
    cuidadorNombre: cuidador,
    nombrePaciente: "Antonio",
    tipoCuidado: "Hospitalario",
    fechaCuidado: "2026-09-10",
    estado: "PENDIENTE",
  };
}

function prepararRepositorios(respuestaPaginas) {
  const espia = vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudesPaginadas");
  respuestaPaginas.forEach((respuesta) => espia.mockResolvedValueOnce(respuesta));
  vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([]);
  vi.spyOn(ValoracionRepository.prototype, "getAll").mockResolvedValue([]);
  vi.spyOn(MensajeRepository.prototype, "getNoLeidos").mockResolvedValue({ porSolicitud: {} });
  return espia;
}

async function montar() {
  const wrapper = mount(SolicitudesFamiliaView, { global: { plugins: [router] } });
  await flushPromises();
  return wrapper;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SolicitudesFamiliaView por páginas", () => {
  test("pide la primera página de veinte", async () => {
    const espia = prepararRepositorios([pagina([solicitud(1, "Pepe")])]);

    await montar();

    expect(espia).toHaveBeenCalledWith(0, 20);
  });

  test("con una sola página no ofrece cargar más", async () => {
    prepararRepositorios([pagina([solicitud(1, "Pepe")])]);

    const wrapper = await montar();

    expect(wrapper.find('[data-testid="cargar-mas"]').exists()).toBe(false);
  });

  test("con más páginas ofrece cargar más y dice cuántas se ven", async () => {
    prepararRepositorios([
      pagina([solicitud(1, "Pepe")], { totalPaginas: 2, totalElementos: 2 }),
    ]);

    const wrapper = await montar();

    expect(wrapper.find('[data-testid="cargar-mas"]').text()).toBe("Cargar más");
    expect(wrapper.text()).toContain("Mostrando 1 de 2");
  });

  test("al pulsar cargar más añade las siguientes y quita el botón al llegar al final", async () => {
    prepararRepositorios([
      pagina([solicitud(1, "Pepe")], { pagina: 0, totalPaginas: 2, totalElementos: 2 }),
      pagina([solicitud(2, "Marta")], { pagina: 1, totalPaginas: 2, totalElementos: 2 }),
    ]);
    const wrapper = await montar();

    await wrapper.find('[data-testid="cargar-mas"]').trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).toContain("Marta");
    expect(wrapper.find('[data-testid="cargar-mas"]').exists()).toBe(false);
  });

  test("si falla cargar más enseña el aviso y mantiene lo que ya había", async () => {
    const espia = prepararRepositorios([
      pagina([solicitud(1, "Pepe")], { pagina: 0, totalPaginas: 2, totalElementos: 2 }),
    ]);
    const fallo = new Error("fallo");
    fallo.status = 500;
    espia.mockRejectedValueOnce(fallo);
    const wrapper = await montar();

    await wrapper.find('[data-testid="cargar-mas"]').trigger("click");
    await flushPromises();

    expect(wrapper.find('[role="alert"]').text()).toContain("No se pudieron cargar más solicitudes.");
    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.find('[data-testid="cargar-mas"]').exists()).toBe(true);
  });
});
