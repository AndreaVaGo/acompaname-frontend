import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import FichajeServicio from "../../components/FichajeServicio.vue";
import FichajeRepository from "../../repositories/FichajeRepository";
import * as ubicacion from "../../utils/ubicacionNavegador";

function solicitud(estado, fechaCuidado) {
  return { id: 5, estado: estado, fechaCuidado: fechaCuidado || "2020-01-01" };
}

async function montar(esCuidador, estado, fechaCuidado) {
  const wrapper = mount(FichajeServicio, {
    props: { solicitud: solicitud(estado || "ACEPTADA", fechaCuidado), esCuidador: esCuidador },
  });
  await flushPromises();
  return wrapper;
}

const INICIO = {
  id: 1,
  tipo: "INICIO",
  momento: "2026-11-24T09:05:12",
  ubicacion: "EN_EL_LUGAR",
};
const FIN = {
  id: 2,
  tipo: "FIN",
  momento: "2026-11-24T13:30:00",
  ubicacion: "SIN_UBICACION",
};

let espiaListar;
let espiaConfiguracion;
let espiaEmpezar;
let espiaTerminar;
let espiaUbicacion;

beforeEach(() => {
  espiaListar = vi.spyOn(FichajeRepository.prototype, "getFichajes").mockResolvedValue([]);
  espiaConfiguracion = vi
    .spyOn(FichajeRepository.prototype, "getConfiguracion")
    .mockResolvedValue({ verificarLugar: false });
  espiaEmpezar = vi.spyOn(FichajeRepository.prototype, "empezar").mockResolvedValue(INICIO);
  espiaTerminar = vi.spyOn(FichajeRepository.prototype, "terminar").mockResolvedValue(FIN);
  espiaUbicacion = vi
    .spyOn(ubicacion, "pedirUbicacion")
    .mockResolvedValue({ latitud: 43.36, longitud: -5.85 });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("FichajeServicio", () => {
  test("la persona cuidadora ve el botón para empezar el servicio", async () => {
    const wrapper = await montar(true);

    expect(wrapper.find('[data-testid="fichar-inicio"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="fichar-fin"]').exists()).toBe(false);
  });

  test("la familia no ve botones, solo las horas", async () => {
    espiaListar.mockResolvedValue([INICIO]);

    const wrapper = await montar(false);

    expect(wrapper.find("button").exists()).toBe(false);
    expect(wrapper.text()).toContain("Servicio iniciado a las 09:05");
    expect(wrapper.text()).toContain("en el lugar");
  });

  test("al empezar guarda el fichaje y pasa a ofrecer terminar", async () => {
    const wrapper = await montar(true);

    await wrapper.find('[data-testid="fichar-inicio"]').trigger("click");
    await flushPromises();

    expect(espiaEmpezar).toHaveBeenCalledWith(5, {});
    expect(wrapper.text()).toContain("Servicio iniciado a las 09:05");
    expect(wrapper.find('[data-testid="fichar-fin"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="fichar-inicio"]').exists()).toBe(false);
  });

  test("al terminar enseña la hora y quita los botones", async () => {
    espiaListar.mockResolvedValue([INICIO]);
    const wrapper = await montar(true);

    await wrapper.find('[data-testid="fichar-fin"]').trigger("click");
    await flushPromises();

    expect(espiaTerminar).toHaveBeenCalledWith(5, {});
    expect(wrapper.text()).toContain("Servicio terminado a las 13:30");
    expect(wrapper.find("button").exists()).toBe(false);
  });

  test("con la comprobación apagada no se pide la ubicación ni se avisa de ella", async () => {
    const wrapper = await montar(true);

    await wrapper.find('[data-testid="fichar-inicio"]').trigger("click");
    await flushPromises();

    expect(espiaUbicacion).not.toHaveBeenCalled();
    expect(wrapper.find('[data-testid="aviso-ubicacion"]').exists()).toBe(false);
  });

  test("con la comprobación activada avisa antes y manda la ubicación al fichar", async () => {
    espiaConfiguracion.mockResolvedValue({ verificarLugar: true });
    const wrapper = await montar(true);

    expect(wrapper.find('[data-testid="aviso-ubicacion"]').text()).toContain("no se guarda");

    await wrapper.find('[data-testid="fichar-inicio"]').trigger("click");
    await flushPromises();

    expect(espiaUbicacion).toHaveBeenCalledTimes(1);
    expect(espiaEmpezar).toHaveBeenCalledWith(5, { latitud: 43.36, longitud: -5.85 });
  });

  test("si no hay permiso de ubicación se ficha igual, solo con la hora, y se avisa", async () => {
    espiaConfiguracion.mockResolvedValue({ verificarLugar: true });
    espiaUbicacion.mockRejectedValue({ code: 1 });
    const wrapper = await montar(true);

    await wrapper.find('[data-testid="fichar-inicio"]').trigger("click");
    await flushPromises();

    expect(espiaEmpezar).toHaveBeenCalledWith(5, {});
    expect(wrapper.find('[data-testid="fichaje-aviso"]').text()).toContain("solo la hora");
    expect(wrapper.text()).toContain("Servicio iniciado");
  });

  test("si el servidor rechaza el fichaje enseña el motivo", async () => {
    const fallo = new Error("fallo");
    fallo.status = 409;
    fallo.detalle = "Ya has fichado el inicio de este servicio";
    espiaEmpezar.mockRejectedValue(fallo);
    const wrapper = await montar(true);

    await wrapper.find('[data-testid="fichar-inicio"]').trigger("click");
    await flushPromises();

    const alerta = wrapper.find('[role="alert"]');
    expect(alerta.text()).toContain("No se pudo fichar el inicio del servicio.");
    expect(alerta.text()).toContain("Ya has fichado el inicio de este servicio.");
  });

  test("antes del día del servicio no se puede empezar y se explica cuándo", async () => {
    const wrapper = await montar(true, "ACEPTADA", "2999-12-31");

    expect(wrapper.find('[data-testid="fichar-inicio"]').attributes("disabled")).toBeDefined();
    expect(wrapper.text()).toContain("Podrás empezar el 31-12-2999");
  });

  test("en un servicio completado la persona cuidadora ya no ficha", async () => {
    espiaListar.mockResolvedValue([INICIO, FIN]);

    const wrapper = await montar(true, "COMPLETADA");

    expect(wrapper.find("button").exists()).toBe(false);
    expect(wrapper.text()).toContain("Servicio terminado a las 13:30");
    expect(espiaConfiguracion).not.toHaveBeenCalled();
  });

  test("si fuera del lugar lo dice sin enseñar coordenadas", async () => {
    espiaListar.mockResolvedValue([{ ...INICIO, ubicacion: "FUERA_DEL_LUGAR" }]);

    const wrapper = await montar(false);

    expect(wrapper.text()).toContain("lejos de la dirección del servicio");
  });

  test("si no se pueden cargar los fichajes la tarjeta no se rompe", async () => {
    espiaListar.mockRejectedValue(new Error("sin conexión"));

    const wrapper = await montar(true);

    expect(wrapper.find('[data-testid="fichar-inicio"]').exists()).toBe(true);
  });
});
