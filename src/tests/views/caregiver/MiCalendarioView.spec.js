import { describe, test, expect, vi, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import MiCalendarioView from "../../../views/caregiver/MiCalendarioView.vue";
import BloqueOcupadoRepository from "../../../repositories/BloqueOcupadoRepository";
import SolicitudRepository from "../../../repositories/SolicitudRepository";

// Fechas lejanas para que el test no dependa del día en que se ejecuta
const FUTURO = "2099-12-01";
const FUTURO_2 = "2099-12-03";
const PASADO = "2020-01-01";

function bloque(id, fecha, motivo) {
  return { id: id, fecha: fecha, horaInicio: "08:00:00", horaFin: "15:00:00", motivo: motivo };
}

// Solicitud de la persona cuidadora (por defecto, aceptada y de un solo día)
function solicitud(id, estado, fechaCuidado, extra = {}) {
  return {
    id: id,
    estado: estado,
    fechaCuidado: fechaCuidado,
    fechaFin: null,
    horaInicio: "09:00:00",
    horaFin: "12:00:00",
    nombrePaciente: "Carmen",
    familiaNombre: "Ana",
    ...extra,
  };
}

async function montarVista(bloques = [], solicitudes = []) {
  vi.spyOn(BloqueOcupadoRepository.prototype, "getMios").mockResolvedValue(bloques);
  vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue(solicitudes);
  const wrapper = mount(MiCalendarioView);
  await flushPromises();
  return wrapper;
}

async function rellenar(wrapper, fecha, inicio, fin, motivo = "") {
  await wrapper.find("#bloque-fecha").setValue(fecha);
  await wrapper.find("#bloque-hora-inicio").setValue(inicio);
  await wrapper.find("#bloque-hora-fin").setValue(fin);
  await wrapper.find("#bloque-motivo").setValue(motivo);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MiCalendarioView", () => {
  test("muestra el título y el formulario", async () => {
    const wrapper = await montarVista();

    expect(wrapper.find("h1").text()).toBe("Mi calendario");
    expect(wrapper.find("#bloque-fecha").exists()).toBe(true);
    expect(wrapper.find("#bloque-hora-inicio").exists()).toBe(true);
    expect(wrapper.find("#bloque-hora-fin").exists()).toBe(true);
    expect(wrapper.find("#bloque-motivo").attributes("maxlength")).toBe("100");
  });

  test("sin bloques dice que no hay ningún rato ocupado", async () => {
    const wrapper = await montarVista([]);

    expect(wrapper.find(".calendario__vacio").text()).toContain("No tienes ningún rato ocupado");
    expect(wrapper.findAll(".calendario__bloque").length).toBe(0);
  });

  test("lista los bloques con la fecha, las horas y el motivo", async () => {
    const wrapper = await montarVista([bloque(1, FUTURO, "Turno en el hospital")]);

    const tarjeta = wrapper.find(".calendario__bloque");
    expect(tarjeta.find(".calendario__bloque-fecha").text()).toBe("01-12-2099");
    expect(tarjeta.find(".calendario__bloque-horas").text()).toBe("08:00 - 15:00");
    expect(tarjeta.find(".calendario__bloque-motivo").text()).toBe("Turno en el hospital");
  });

  test("un bloque sin motivo no enseña la línea del motivo", async () => {
    const wrapper = await montarVista([bloque(1, FUTURO, null)]);

    expect(wrapper.find(".calendario__bloque-motivo").exists()).toBe(false);
  });

  test("no enseña los bloques de días que ya pasaron", async () => {
    const wrapper = await montarVista([bloque(1, PASADO, "Antiguo"), bloque(2, FUTURO, "Próximo")]);

    const tarjetas = wrapper.findAll(".calendario__bloque");
    expect(tarjetas.length).toBe(1);
    expect(tarjetas[0].text()).toContain("Próximo");
  });

  test("si no se puede cargar el calendario enseña un aviso", async () => {
    vi.spyOn(BloqueOcupadoRepository.prototype, "getMios").mockRejectedValue(new Error("fallo"));
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([]);
    const wrapper = mount(MiCalendarioView);
    await flushPromises();

    expect(wrapper.find(".calendario__error").text()).toContain("No se pudo cargar tu calendario.");
  });

  test("sin rellenar los campos avisa y no guarda", async () => {
    const crear = vi.spyOn(BloqueOcupadoRepository.prototype, "create").mockResolvedValue({ id: 1 });
    const wrapper = await montarVista();

    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.find(".calendario__error").text()).toContain("Rellena la fecha y las horas");
    expect(crear).not.toHaveBeenCalled();
  });

  test("con una fecha pasada avisa y no guarda", async () => {
    const crear = vi.spyOn(BloqueOcupadoRepository.prototype, "create").mockResolvedValue({ id: 1 });
    const wrapper = await montarVista();
    await rellenar(wrapper, PASADO, "08:00", "15:00");

    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.find(".calendario__error").text()).toContain("no puede estar en el pasado");
    expect(crear).not.toHaveBeenCalled();
  });

  test("con la hora de fin igual o anterior a la de inicio avisa y no guarda", async () => {
    const crear = vi.spyOn(BloqueOcupadoRepository.prototype, "create").mockResolvedValue({ id: 1 });
    const wrapper = await montarVista();

    await rellenar(wrapper, FUTURO, "15:00", "08:00");
    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.find(".calendario__error").text()).toContain("posterior a la de inicio");

    await rellenar(wrapper, FUTURO, "08:00", "08:00");
    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.find(".calendario__error").text()).toContain("posterior a la de inicio");
    expect(crear).not.toHaveBeenCalled();
  });

  test("al guardar manda el bloque sin espacios en el motivo, avisa, vacía el formulario y recarga la lista", async () => {
    const crear = vi.spyOn(BloqueOcupadoRepository.prototype, "create").mockResolvedValue({ id: 9 });
    const wrapper = await montarVista();
    const cargar = vi
      .spyOn(BloqueOcupadoRepository.prototype, "getMios")
      .mockResolvedValue([bloque(9, FUTURO_2, "Cita")]);
    await rellenar(wrapper, FUTURO_2, "09:00", "10:30", "  Cita  ");

    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(crear).toHaveBeenCalledWith({
      fecha: FUTURO_2,
      horaInicio: "09:00",
      horaFin: "10:30",
      motivo: "Cita",
    });
    expect(wrapper.find(".calendario__ok").text()).toContain("hemos añadido");
    expect(wrapper.find("#bloque-fecha").element.value).toBe("");
    expect(wrapper.find("#bloque-motivo").element.value).toBe("");
    expect(cargar).toHaveBeenCalled();
    expect(wrapper.findAll(".calendario__bloque").length).toBe(1);
  });

  test("si el servidor falla al guardar enseña el error y no vacía el formulario", async () => {
    const error = new Error("fallo");
    error.status = 500;
    vi.spyOn(BloqueOcupadoRepository.prototype, "create").mockRejectedValue(error);
    const wrapper = await montarVista();
    await rellenar(wrapper, FUTURO, "08:00", "15:00");

    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(wrapper.find(".calendario__error").text()).toContain("No se pudo guardar el bloque.");
    expect(wrapper.find("#bloque-fecha").element.value).toBe(FUTURO);
  });

  test("al quitar un bloque lo borra en el servidor y desaparece de la lista", async () => {
    const quitar = vi.spyOn(BloqueOcupadoRepository.prototype, "remove").mockResolvedValue();
    const wrapper = await montarVista([bloque(1, FUTURO, "Uno"), bloque(2, FUTURO_2, "Dos")]);

    await wrapper.findAll(".calendario__quitar")[0].trigger("click");
    await flushPromises();

    expect(quitar).toHaveBeenCalledWith(1);
    const tarjetas = wrapper.findAll(".calendario__bloque");
    expect(tarjetas.length).toBe(1);
    expect(tarjetas[0].text()).toContain("Dos");
  });

  test("si falla al quitar un bloque enseña el error y el bloque sigue en la lista", async () => {
    vi.spyOn(BloqueOcupadoRepository.prototype, "remove").mockRejectedValue(new Error("fallo"));
    const wrapper = await montarVista([bloque(1, FUTURO, "Uno")]);

    await wrapper.find(".calendario__quitar").trigger("click");
    await flushPromises();

    expect(wrapper.find(".calendario__error").text()).toContain("No se pudo quitar el bloque.");
    expect(wrapper.findAll(".calendario__bloque").length).toBe(1);
  });

  test("sin servicios aceptados dice que no hay ninguno", async () => {
    const wrapper = await montarVista();

    expect(wrapper.find(".calendario__sin-servicios").text()).toContain("ningún servicio aceptado");
  });

  test("enseña solo los servicios aceptados que no han acabado", async () => {
    const wrapper = await montarVista([], [
      solicitud(1, "ACEPTADA", FUTURO),
      solicitud(2, "PENDIENTE", FUTURO),
      solicitud(3, "RECHAZADA", FUTURO),
      solicitud(4, "COMPLETADA", FUTURO),
      solicitud(5, "ACEPTADA", PASADO),
    ]);

    expect(wrapper.findAll(".calendario__servicio").length).toBe(1);
  });

  test("un servicio de un solo día enseña la fecha y las horas, el paciente y la familia", async () => {
    const wrapper = await montarVista([], [solicitud(1, "ACEPTADA", FUTURO)]);

    const texto = wrapper.find(".calendario__servicio").text();
    expect(texto).toContain("01-12-2099 · 09:00 - 12:00");
    expect(texto).toContain("Cuidado de Carmen");
    expect(texto).toContain("Familia Ana");
  });

  test("un servicio de varios días enseña el principio y el final", async () => {
    const wrapper = await montarVista([], [
      solicitud(1, "ACEPTADA", FUTURO, { fechaFin: FUTURO_2, horaInicio: "22:00:00", horaFin: "08:00:00" }),
    ]);

    expect(wrapper.find(".calendario__servicio").text()).toContain("01-12-2099 · 22:00 → 03-12-2099 · 08:00");
  });

  test("un servicio antiguo sin horas enseña solo la fecha", async () => {
    const wrapper = await montarVista([], [
      solicitud(1, "ACEPTADA", FUTURO, { horaInicio: null, horaFin: null }),
    ]);

    expect(wrapper.find(".calendario__servicio .calendario__bloque-fecha").text()).toBe("01-12-2099");
  });

  test("los servicios salen por orden de fecha y, el mismo día, de hora", async () => {
    const wrapper = await montarVista([], [
      solicitud(1, "ACEPTADA", FUTURO_2),
      solicitud(2, "ACEPTADA", FUTURO, { horaInicio: "16:00:00", horaFin: "18:00:00" }),
      solicitud(3, "ACEPTADA", FUTURO, { horaInicio: "08:00:00", horaFin: "10:00:00" }),
    ]);

    const fechas = wrapper.findAll(".calendario__servicio .calendario__bloque-fecha").map((f) => f.text());
    expect(fechas).toEqual([
      "01-12-2099 · 08:00 - 10:00",
      "01-12-2099 · 16:00 - 18:00",
      "03-12-2099 · 09:00 - 12:00",
    ]);
  });

  test("si no se pueden cargar los servicios enseña un aviso y el resto sigue funcionando", async () => {
    vi.spyOn(BloqueOcupadoRepository.prototype, "getMios").mockResolvedValue([bloque(1, FUTURO, "Uno")]);
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockRejectedValue(new Error("fallo"));
    const wrapper = mount(MiCalendarioView);
    await flushPromises();

    expect(wrapper.find(".calendario__aviso-servicios").text()).toContain("No se pudieron cargar tus servicios");
    expect(wrapper.findAll(".calendario__bloque").length).toBe(1);
  });
});
