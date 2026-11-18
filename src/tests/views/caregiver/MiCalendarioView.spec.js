import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import MiCalendarioView from "../../../views/caregiver/MiCalendarioView.vue";
import BloqueOcupadoRepository from "../../../repositories/BloqueOcupadoRepository";
import SolicitudRepository from "../../../repositories/SolicitudRepository";

// Hoy es el 10 de diciembre de 2026. Solo se falsea la fecha: así los tests no dependen del día en que se ejecutan
const PASADO = "2026-12-05";
const HOY = "2026-12-10";
const FUTURO = "2026-12-15";
const FUTURO_2 = "2026-12-20";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 11, 10, 12, 0));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

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

// El día N de diciembre de 2026 en el calendario
function dia(wrapper, numero) {
  return wrapper.findAll(".calendario-mensual__dia")[numero - 1];
}

async function rellenar(wrapper, fecha, inicio, fin, motivo = "") {
  await wrapper.find("#bloque-fecha").setValue(fecha);
  await wrapper.find("#bloque-hora-inicio").setValue(inicio);
  await wrapper.find("#bloque-hora-fin").setValue(fin);
  await wrapper.find("#bloque-motivo").setValue(motivo);
}

describe("MiCalendarioView: calendario", () => {
  test("muestra el título, el calendario del mes de hoy y el formulario", async () => {
    const wrapper = await montarVista();

    expect(wrapper.find("h1").text()).toBe("Mi calendario");
    expect(wrapper.find(".calendario-mensual__titulo").text()).toBe("Diciembre 2026");
    expect(wrapper.find("#bloque-fecha").exists()).toBe(true);
    expect(wrapper.find("#bloque-hora-inicio").exists()).toBe(true);
    expect(wrapper.find("#bloque-hora-fin").exists()).toBe(true);
    expect(wrapper.find("#bloque-motivo").attributes("maxlength")).toBe("100");
  });

  test("al empezar tiene abierto el día de hoy", async () => {
    const wrapper = await montarVista();

    expect(wrapper.find(".calendario__titulo-lista").text()).toBe("10-12-2026");
    expect(dia(wrapper, 10).classes()).toContain("calendario-mensual__dia--seleccionado");
  });

  test("un día sin nada dice que no hay nada apuntado", async () => {
    const wrapper = await montarVista();

    expect(wrapper.find(".calendario__vacio").text()).toContain("No tienes nada apuntado este día");
    expect(wrapper.findAll(".calendario__bloque").length).toBe(0);
    expect(wrapper.findAll(".calendario__servicio").length).toBe(0);
  });

  test("los días con un rato ocupado llevan punto naranja", async () => {
    const wrapper = await montarVista([bloque(1, FUTURO, "Turno")]);

    expect(dia(wrapper, 15).find(".calendario-mensual__punto--bloque").exists()).toBe(true);
    expect(dia(wrapper, 16).find(".calendario-mensual__punto--bloque").exists()).toBe(false);
  });

  test("los días con un servicio aceptado llevan punto verde", async () => {
    const wrapper = await montarVista([], [solicitud(1, "ACEPTADA", FUTURO)]);

    expect(dia(wrapper, 15).find(".calendario-mensual__punto--servicio").exists()).toBe(true);
  });

  test("un servicio de varios días marca todos los días que dura", async () => {
    const wrapper = await montarVista([], [solicitud(1, "ACEPTADA", "2026-12-20", { fechaFin: "2026-12-22" })]);

    expect(dia(wrapper, 19).find(".calendario-mensual__punto--servicio").exists()).toBe(false);
    expect(dia(wrapper, 20).find(".calendario-mensual__punto--servicio").exists()).toBe(true);
    expect(dia(wrapper, 21).find(".calendario-mensual__punto--servicio").exists()).toBe(true);
    expect(dia(wrapper, 22).find(".calendario-mensual__punto--servicio").exists()).toBe(true);
    expect(dia(wrapper, 23).find(".calendario-mensual__punto--servicio").exists()).toBe(false);
  });

  test("solo las solicitudes aceptadas marcan el calendario", async () => {
    const wrapper = await montarVista([], [
      solicitud(1, "PENDIENTE", FUTURO),
      solicitud(2, "RECHAZADA", FUTURO),
      solicitud(3, "COMPLETADA", FUTURO),
    ]);

    expect(dia(wrapper, 15).find(".calendario-mensual__punto").exists()).toBe(false);
  });

  test("al pulsar un día enseña sus bloques con las horas y el motivo", async () => {
    const wrapper = await montarVista([bloque(1, FUTURO, "Turno en el hospital")]);

    await dia(wrapper, 15).trigger("click");

    expect(wrapper.find(".calendario__titulo-lista").text()).toBe("15-12-2026");
    const tarjeta = wrapper.find(".calendario__bloque");
    expect(tarjeta.find(".calendario__bloque-horas").text()).toBe("08:00 - 15:00");
    expect(tarjeta.find(".calendario__bloque-motivo").text()).toBe("Turno en el hospital");
  });

  test("un bloque sin motivo no enseña la línea del motivo", async () => {
    const wrapper = await montarVista([bloque(1, FUTURO, null)]);

    await dia(wrapper, 15).trigger("click");

    expect(wrapper.find(".calendario__bloque-motivo").exists()).toBe(false);
  });

  test("al pulsar un día no enseña los bloques de otros días", async () => {
    const wrapper = await montarVista([bloque(1, FUTURO, "Uno"), bloque(2, FUTURO_2, "Dos")]);

    await dia(wrapper, 20).trigger("click");

    const tarjetas = wrapper.findAll(".calendario__bloque");
    expect(tarjetas.length).toBe(1);
    expect(tarjetas[0].text()).toContain("Dos");
  });

  test("un servicio de un solo día enseña la fecha y las horas, el paciente y la familia", async () => {
    const wrapper = await montarVista([], [solicitud(1, "ACEPTADA", FUTURO)]);

    await dia(wrapper, 15).trigger("click");

    const texto = wrapper.find(".calendario__servicio").text();
    expect(texto).toContain("15-12-2026 · 09:00 - 12:00");
    expect(texto).toContain("Cuidado de Carmen");
    expect(texto).toContain("Familia Ana");
  });

  test("un servicio de varios días sale en cada día que dura y enseña el principio y el final", async () => {
    const wrapper = await montarVista([], [
      solicitud(1, "ACEPTADA", "2026-12-20", { fechaFin: "2026-12-22", horaInicio: "22:00:00", horaFin: "08:00:00" }),
    ]);

    await dia(wrapper, 21).trigger("click");

    expect(wrapper.find(".calendario__servicio").text()).toContain("20-12-2026 · 22:00 → 22-12-2026 · 08:00");
  });

  test("un servicio antiguo sin horas enseña solo la fecha", async () => {
    const wrapper = await montarVista([], [solicitud(1, "ACEPTADA", FUTURO, { horaInicio: null, horaFin: null })]);

    await dia(wrapper, 15).trigger("click");

    expect(wrapper.find(".calendario__servicio .calendario__bloque-fecha").text()).toBe("15-12-2026");
  });

  test("un día con servicio y bloque enseña los dos", async () => {
    const wrapper = await montarVista([bloque(1, FUTURO, "Cita")], [solicitud(1, "ACEPTADA", FUTURO)]);

    await dia(wrapper, 15).trigger("click");

    expect(wrapper.findAll(".calendario__servicio").length).toBe(1);
    expect(wrapper.findAll(".calendario__bloque").length).toBe(1);
  });

  test("se puede pasar de mes y ver lo que hay en otro mes", async () => {
    const wrapper = await montarVista([bloque(1, "2027-01-04", "Turno")]);

    await wrapper.find("#mes-siguiente").trigger("click");
    expect(wrapper.find(".calendario-mensual__titulo").text()).toBe("Enero 2027");
    await dia(wrapper, 4).trigger("click");

    expect(wrapper.find(".calendario__bloque-motivo").text()).toBe("Turno");
  });

  test("si no se puede cargar el calendario enseña un aviso", async () => {
    vi.spyOn(BloqueOcupadoRepository.prototype, "getMios").mockRejectedValue(new Error("fallo"));
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([]);
    const wrapper = mount(MiCalendarioView);
    await flushPromises();

    expect(wrapper.find(".calendario__error").text()).toContain("No se pudo cargar tu calendario.");
  });

  test("si no se pueden cargar los servicios enseña un aviso y los bloques siguen funcionando", async () => {
    vi.spyOn(BloqueOcupadoRepository.prototype, "getMios").mockResolvedValue([bloque(1, HOY, "Uno")]);
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockRejectedValue(new Error("fallo"));
    const wrapper = mount(MiCalendarioView);
    await flushPromises();

    expect(wrapper.find(".calendario__aviso-servicios").text()).toContain("No se pudieron cargar tus servicios");
    expect(wrapper.findAll(".calendario__bloque").length).toBe(1);
  });
});

describe("MiCalendarioView: formulario", () => {
  test("al pulsar un día de hoy en adelante se deja puesto en el formulario", async () => {
    const wrapper = await montarVista();

    await dia(wrapper, 15).trigger("click");

    expect(wrapper.find("#bloque-fecha").element.value).toBe(FUTURO);
  });

  test("al pulsar un día pasado no se pone en el formulario", async () => {
    const wrapper = await montarVista();

    await dia(wrapper, 5).trigger("click");

    expect(wrapper.find("#bloque-fecha").element.value).toBe("");
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

  test("al guardar manda el bloque sin espacios en el motivo, avisa, vacía el formulario y abre ese día", async () => {
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
    expect(wrapper.find(".calendario__titulo-lista").text()).toBe("20-12-2026");
    expect(wrapper.findAll(".calendario__bloque").length).toBe(1);
    expect(dia(wrapper, 20).find(".calendario-mensual__punto--bloque").exists()).toBe(true);
  });

  test("si el servidor falla al guardar enseña el error y no vacía el formulario", async () => {
    const fallo = new Error("fallo");
    fallo.status = 500;
    vi.spyOn(BloqueOcupadoRepository.prototype, "create").mockRejectedValue(fallo);
    const wrapper = await montarVista();
    await rellenar(wrapper, FUTURO, "08:00", "15:00");

    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(wrapper.find(".calendario__error").text()).toContain("No se pudo guardar el bloque.");
    expect(wrapper.find("#bloque-fecha").element.value).toBe(FUTURO);
  });
});

describe("MiCalendarioView: quitar bloques", () => {
  test("al quitar un bloque lo borra en el servidor y desaparece del día y del calendario", async () => {
    const quitar = vi.spyOn(BloqueOcupadoRepository.prototype, "remove").mockResolvedValue();
    const wrapper = await montarVista([bloque(1, FUTURO, "Uno"), bloque(2, FUTURO, "Dos")]);
    await dia(wrapper, 15).trigger("click");

    await wrapper.findAll(".calendario__quitar")[0].trigger("click");
    await flushPromises();

    expect(quitar).toHaveBeenCalledWith(1);
    const tarjetas = wrapper.findAll(".calendario__bloque");
    expect(tarjetas.length).toBe(1);
    expect(tarjetas[0].text()).toContain("Dos");
    expect(dia(wrapper, 15).find(".calendario-mensual__punto--bloque").exists()).toBe(true);
  });

  test("al quitar el último bloque del día se quita también el punto del calendario", async () => {
    vi.spyOn(BloqueOcupadoRepository.prototype, "remove").mockResolvedValue();
    const wrapper = await montarVista([bloque(1, FUTURO, "Uno")]);
    await dia(wrapper, 15).trigger("click");

    await wrapper.find(".calendario__quitar").trigger("click");
    await flushPromises();

    expect(dia(wrapper, 15).find(".calendario-mensual__punto--bloque").exists()).toBe(false);
    expect(wrapper.find(".calendario__vacio").text()).toContain("No tienes nada apuntado este día");
  });

  test("si falla al quitar un bloque enseña el error y el bloque sigue en la lista", async () => {
    vi.spyOn(BloqueOcupadoRepository.prototype, "remove").mockRejectedValue(new Error("fallo"));
    const wrapper = await montarVista([bloque(1, FUTURO, "Uno")]);
    await dia(wrapper, 15).trigger("click");

    await wrapper.find(".calendario__quitar").trigger("click");
    await flushPromises();

    expect(wrapper.find(".calendario__error").text()).toContain("No se pudo quitar el bloque.");
    expect(wrapper.findAll(".calendario__bloque").length).toBe(1);
  });
});
