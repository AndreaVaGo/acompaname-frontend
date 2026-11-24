import { describe, test, expect, vi, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import SolicitudesCuidadorView from "../../../views/caregiver/SolicitudesCuidadorView.vue";
import SolicitudRepository from "../../../repositories/SolicitudRepository";
import MensajeRepository from "../../../repositories/MensajeRepository";
import { pagina } from "../../ayudas/paginaFalsa";

const router = createRouter({ history: createWebHistory(), routes: [] });

function solicitud(id, familia) {
  return {
    id: id,
    familiaNombre: familia,
    nombrePaciente: "Antonio",
    tipoCuidado: "Hospitalario",
    fechaCuidado: "2026-09-10",
    estado: "PENDIENTE",
  };
}

function prepararRepositorios(respuestaPaginas) {
  const espia = vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudesPaginadas");
  respuestaPaginas.forEach((respuesta) => espia.mockResolvedValueOnce(respuesta));
  vi.spyOn(MensajeRepository.prototype, "getNoLeidos").mockResolvedValue({ porSolicitud: {} });
  return espia;
}

async function montar() {
  const wrapper = mount(SolicitudesCuidadorView, { global: { plugins: [router] } });
  await flushPromises();
  return wrapper;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SolicitudesCuidadorView por páginas", () => {
  test("pide la primera página de veinte", async () => {
    const espia = prepararRepositorios([pagina([solicitud(1, "Ana")])]);

    await montar();

    expect(espia).toHaveBeenCalledWith(0, 20);
  });

  test("con una sola página no ofrece cargar más", async () => {
    prepararRepositorios([pagina([solicitud(1, "Ana")])]);

    const wrapper = await montar();

    expect(wrapper.find('[data-testid="cargar-mas"]').exists()).toBe(false);
  });

  test("al pulsar cargar más añade las siguientes y quita el botón al llegar al final", async () => {
    prepararRepositorios([
      pagina([solicitud(1, "Ana")], { pagina: 0, totalPaginas: 2, totalElementos: 2 }),
      pagina([solicitud(2, "Luis")], { pagina: 1, totalPaginas: 2, totalElementos: 2 }),
    ]);
    const wrapper = await montar();
    expect(wrapper.text()).toContain("Mostrando 1 de 2");

    await wrapper.find('[data-testid="cargar-mas"]').trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("Ana");
    expect(wrapper.text()).toContain("Luis");
    expect(wrapper.find('[data-testid="cargar-mas"]').exists()).toBe(false);
  });

  test("si falla cargar más enseña el aviso", async () => {
    const espia = prepararRepositorios([
      pagina([solicitud(1, "Ana")], { pagina: 0, totalPaginas: 2, totalElementos: 2 }),
    ]);
    const fallo = new Error("fallo");
    fallo.status = 500;
    espia.mockRejectedValueOnce(fallo);
    const wrapper = await montar();

    await wrapper.find('[data-testid="cargar-mas"]').trigger("click");
    await flushPromises();

    expect(wrapper.find('[role="alert"]').text()).toContain("No se pudieron cargar más solicitudes.");
    expect(wrapper.text()).toContain("Ana");
  });
});
