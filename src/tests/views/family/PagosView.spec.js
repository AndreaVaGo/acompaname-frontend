import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import PagosView from "../../../views/family/PagosView.vue";
import PagoRepository from "../../../repositories/PagoRepository";

const router = createRouter({
  history: createWebHistory(),
  routes: [],
});

function crearPago(id, estado, importe, fecha, solicitudId) {
  return {
    id: id,
    estado: estado,
    importe: importe,
    fecha: fecha,
    solicitudId: solicitudId,
    cuidadorNombre: "Pepe",
    tipoCuidado: "domicilio",
  };
}

async function montarVista() {
  const wrapper = mount(PagosView, {
    global: { plugins: [router] },
  });

  await new Promise((resolve) => setTimeout(resolve, 0));

  return wrapper;
}

describe("PagosView", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("muestra los datos de cada pago", async () => {
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([
      crearPago(1, "COMPLETADO", 90, "2026-09-11", 7),
    ]);

    const wrapper = await montarVista();

    const texto = wrapper.find(".pagos__tarjeta").text();
    expect(texto).toContain("Pepe");
    expect(texto).toContain("Solicitud nº 7");
    expect(texto).toContain("Domicilio");
    expect(texto).toContain("11-09-2026");
    expect(texto).toContain("90,00 €");
    expect(texto).toContain("Pagado");
  });

  test("mientras carga muestra Cargando pagos y no la lista", async () => {
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([
      crearPago(1, "COMPLETADO", 90, "2026-09-11", 7),
    ]);

    // No esperamos: miramos justo después de montar
    const wrapper = mount(PagosView, {
      global: { plugins: [router] },
    });

    expect(wrapper.text()).toContain("Cargando pagos");
    expect(wrapper.find(".pagos__tarjeta").exists()).toBe(false);
  });

  test("los pendientes salen arriba aunque sean más antiguos", async () => {
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([
      crearPago(1, "COMPLETADO", 90, "2026-11-10", 7),
      crearPago(2, "PENDIENTE", 36, "2026-09-01", 8),
    ]);

    const wrapper = await montarVista();

    const tarjetas = wrapper.findAll(".pagos__tarjeta");
    expect(tarjetas.length).toBe(2);
    expect(tarjetas[0].text()).toContain("Pendiente");
    expect(tarjetas[1].text()).toContain("Pagado");
  });

  test("el pago pendiente tiene un botón Pagar que lleva a su pantalla de pago", async () => {
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([
      crearPago(1, "PENDIENTE", 36, "2026-09-01", 8),
    ]);

    const wrapper = await montarVista();

    const enlace = wrapper.find('a[href="/pagar/8"]');
    expect(enlace.exists()).toBe(true);
    expect(enlace.text()).toBe("Pagar");
  });

  test("el pago ya pagado no tiene botón Pagar", async () => {
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([
      crearPago(1, "COMPLETADO", 90, "2026-09-11", 7),
    ]);

    const wrapper = await montarVista();

    expect(wrapper.find('a[href="/pagar/7"]').exists()).toBe(false);
  });

  test("muestra el total pagado y el total pendiente, sin contar los cancelados", async () => {
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([
      crearPago(1, "COMPLETADO", 90, "2026-09-11", 7),
      crearPago(2, "COMPLETADO", 10.5, "2026-09-12", 8),
      crearPago(3, "PENDIENTE", 36, "2026-09-13", 9),
      crearPago(4, "CANCELADO", 50, "2026-09-14", 10),
    ]);

    const wrapper = await montarVista();

    expect(wrapper.find(".pagos__total--pagado").text()).toContain("100,50 €");
    expect(wrapper.find(".pagos__total--pendiente").text()).toContain("36,00 €");
  });

  test("sin pagos muestra un mensaje amable y no los totales", async () => {
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([]);

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("Todavía no tienes pagos");
    expect(wrapper.find(".pagos__totales").exists()).toBe(false);
  });

  test("si falla la carga muestra el error", async () => {
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockRejectedValue(
      new Error("fallo"),
    );

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("No se pudieron cargar tus pagos.");
    expect(wrapper.text()).not.toContain("Todavía no tienes pagos");
  });

  test("si la persona cuidadora no tiene nombre pone un texto por defecto", async () => {
    const pago = crearPago(1, "PENDIENTE", 36, "2026-09-01", 8);
    pago.cuidadorNombre = null;
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([pago]);

    const wrapper = await montarVista();

    expect(wrapper.find(".pagos__tarjeta").text()).toContain("Persona cuidadora");
  });
});
