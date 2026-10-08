import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import CheckoutView from "../views/CheckoutView.vue";
import PagoRepository from "../repositories/PagoRepository";

function crearRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/pagar/:id", name: "pagar", component: CheckoutView },
      { path: "/solicitudes", name: "solicitudes", component: { template: "<div>solicitudes</div>" } },
    ],
  });
}

async function montarVista() {
  const router = crearRouter();
  await router.push("/pagar/7");
  await router.isReady();

  const wrapper = mount(CheckoutView, {
    global: {
      plugins: [router],
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 0));

  return { wrapper, router };
}

async function rellenarTarjeta(wrapper) {
  await wrapper.find("#numero").setValue("4242424242424242");
  await wrapper.find("#nombre").setValue("Ana Pérez");
  await wrapper.find("#caducidad").setValue("12/30");
  await wrapper.find("#cvv").setValue("123");
}

const pagoPendiente = {
  id: 3,
  importe: 15,
  estado: "PENDIENTE",
  solicitudId: 7,
};

describe("CheckoutView", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("muestra el importe del pago de la solicitud tras cargar", async () => {
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([
      { id: 1, importe: 99, estado: "PENDIENTE", solicitudId: 1 },
      pagoPendiente,
    ]);

    const { wrapper } = await montarVista();

    expect(wrapper.text()).toContain("15 €");
    expect(wrapper.find("form").exists()).toBe(true);
  });

  test("muestra error si no existe un pago para esa solicitud", async () => {
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([
      { id: 1, importe: 99, estado: "PENDIENTE", solicitudId: 1 },
    ]);

    const { wrapper } = await montarVista();

    expect(wrapper.text()).toContain(
      "No se ha encontrado el pago de esta solicitud."
    );
    expect(wrapper.find("form").exists()).toBe(false);
  });

  test("muestra error si falla la carga del pago", async () => {
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockRejectedValue(
      new Error("fallo")
    );

    const { wrapper } = await montarVista();

    expect(wrapper.text()).toContain("No se pudo cargar el pago.");
  });

  test("si el pago ya está completado no muestra el formulario", async () => {
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([
      { ...pagoPendiente, estado: "COMPLETADO" },
    ]);

    const { wrapper } = await montarVista();

    expect(wrapper.text()).toContain("Este servicio ya está pagado.");
    expect(wrapper.find("form").exists()).toBe(false);
  });

  test("no paga si faltan datos de la tarjeta", async () => {
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([
      pagoPendiente,
    ]);
    const pagarSpy = vi
      .spyOn(PagoRepository.prototype, "marcarComoPagado")
      .mockResolvedValue({});

    const { wrapper } = await montarVista();

    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.text()).toContain(
      "Por favor, rellena todos los campos de la tarjeta."
    );
    expect(pagarSpy).not.toHaveBeenCalled();
  });

  test("paga correctamente y redirige a las solicitudes", async () => {
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([
      pagoPendiente,
    ]);
    const pagarSpy = vi
      .spyOn(PagoRepository.prototype, "marcarComoPagado")
      .mockResolvedValue({});

    const { wrapper, router } = await montarVista();

    await rellenarTarjeta(wrapper);
    await wrapper.find("form").trigger("submit.prevent");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(pagarSpy).toHaveBeenCalledWith(3);
    expect(router.currentRoute.value.name).toBe("solicitudes");
  });

  test("muestra error si falla el pago", async () => {
    vi.spyOn(PagoRepository.prototype, "getMisPagos").mockResolvedValue([
      pagoPendiente,
    ]);
    vi.spyOn(PagoRepository.prototype, "marcarComoPagado").mockRejectedValue(
      new Error("fallo")
    );

    const { wrapper, router } = await montarVista();

    await rellenarTarjeta(wrapper);
    await wrapper.find("form").trigger("submit.prevent");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("No se pudo realizar el pago.");
    expect(router.currentRoute.value.name).toBe("pagar");
  });
});