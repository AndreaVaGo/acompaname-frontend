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
  vi.spyOn(BloqueOcupadoRepository.prototype, "getSuscripcion").mockResolvedValue({ vinculado: false });
  vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue(solicitudes);
  const wrapper = mount(MiCalendarioView);
  await flushPromises();
  return wrapper;
}

// Las horas libres que enseña el panel, una por etiqueta
function huecosLibres(wrapper) {
  return wrapper.findAll(".linea-dia__hueco-rango").map((r) => r.text());
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

    expect(wrapper.find(".calendario__titulo-lista").text()).toBe("Jueves 10 de diciembre de 2026");
    expect(dia(wrapper, 10).classes()).toContain("calendario-mensual__dia--seleccionado");
  });

  test("un día sin nada dice que no hay nada apuntado", async () => {
    const wrapper = await montarVista();

    expect(wrapper.find(".calendario__vacio").text()).toContain("No tienes nada apuntado este día");
    expect(wrapper.findAll(".calendario__bloque").length).toBe(0);
    expect(wrapper.findAll(".calendario__servicio").length).toBe(0);
  });

  test("los días con un rato ocupado salen marcados como ocupados", async () => {
    const wrapper = await montarVista([bloque(1, FUTURO, "Turno")]);

    expect(dia(wrapper, 15).classes()).toContain("calendario-mensual__dia--ocupado");
    expect(dia(wrapper, 16).classes()).not.toContain("calendario-mensual__dia--ocupado");
  });

  test("los días con un servicio aceptado salen marcados como ocupados", async () => {
    const wrapper = await montarVista([], [solicitud(1, "ACEPTADA", FUTURO)]);

    expect(dia(wrapper, 15).classes()).toContain("calendario-mensual__dia--ocupado");
  });

  test("un servicio de varios días marca todos los días que dura", async () => {
    const wrapper = await montarVista([], [solicitud(1, "ACEPTADA", "2026-12-20", { fechaFin: "2026-12-22" })]);

    expect(dia(wrapper, 19).classes()).not.toContain("calendario-mensual__dia--ocupado");
    expect(dia(wrapper, 20).classes()).toContain("calendario-mensual__dia--ocupado");
    expect(dia(wrapper, 21).classes()).toContain("calendario-mensual__dia--ocupado");
    expect(dia(wrapper, 22).classes()).toContain("calendario-mensual__dia--ocupado");
    expect(dia(wrapper, 23).classes()).not.toContain("calendario-mensual__dia--ocupado");
  });

  test("solo las solicitudes aceptadas marcan el calendario", async () => {
    const wrapper = await montarVista([], [
      solicitud(1, "PENDIENTE", FUTURO),
      solicitud(2, "RECHAZADA", FUTURO),
      solicitud(3, "COMPLETADA", FUTURO),
    ]);

    expect(dia(wrapper, 15).classes()).not.toContain("calendario-mensual__dia--ocupado");
  });

  test("al pulsar un día enseña sus bloques con las horas y el motivo", async () => {
    const wrapper = await montarVista([bloque(1, FUTURO, "Turno en el hospital")]);

    await dia(wrapper, 15).trigger("click");

    expect(wrapper.find(".calendario__titulo-lista").text()).toBe("Martes 15 de diciembre de 2026");
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

    // El inicio y el fin van en dos líneas: "Desde ..." y "hasta ..."
    const texto = wrapper.find(".calendario__servicio").text();

    expect(texto).toContain("Desde 20-12-2026 · 22:00");
    expect(texto).toContain("hasta 22-12-2026 · 08:00");
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

  test("con la hora de fin igual a la de inicio avisa y no guarda", async () => {
    const crear = vi.spyOn(BloqueOcupadoRepository.prototype, "create").mockResolvedValue({ id: 1 });
    const repetir = vi.spyOn(BloqueOcupadoRepository.prototype, "repetir").mockResolvedValue({ creados: 1, duplicados: 0 });
    const wrapper = await montarVista();

    await rellenar(wrapper, FUTURO, "08:00", "08:00");
    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.find(".calendario__error").text()).toContain("no puede ser igual a la de inicio");
    expect(crear).not.toHaveBeenCalled();
    expect(repetir).not.toHaveBeenCalled();
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
    expect(wrapper.find(".calendario__titulo-lista").text()).toBe("Domingo 20 de diciembre de 2026");
    expect(wrapper.findAll(".calendario__bloque").length).toBe(1);
    expect(dia(wrapper, 20).classes()).toContain("calendario-mensual__dia--ocupado");
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
    expect(dia(wrapper, 15).classes()).toContain("calendario-mensual__dia--ocupado");
  });

  test("al quitar el último bloque del día se quita también la marca del calendario", async () => {
    vi.spyOn(BloqueOcupadoRepository.prototype, "remove").mockResolvedValue();
    const wrapper = await montarVista([bloque(1, FUTURO, "Uno")]);
    await dia(wrapper, 15).trigger("click");

    await wrapper.find(".calendario__quitar").trigger("click");
    await flushPromises();

    expect(dia(wrapper, 15).classes()).not.toContain("calendario-mensual__dia--ocupado");
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

describe("MiCalendarioView: colores según las horas ocupadas", () => {
  test("un bloque corto deja el día en parcial", async () => {
    const wrapper = await montarVista([bloque(1, FUTURO, "Turno")]);

    expect(dia(wrapper, 15).classes()).toContain("calendario-mensual__dia--ocupado");
    expect(dia(wrapper, 15).classes()).not.toContain("calendario-mensual__dia--completo");
  });

  test("un bloque de 8 horas o más deja el día completo", async () => {
    const largo = { id: 1, fecha: FUTURO, horaInicio: "08:00:00", horaFin: "16:00:00", motivo: "Turno" };
    const wrapper = await montarVista([largo]);

    expect(dia(wrapper, 15).classes()).toContain("calendario-mensual__dia--completo");
  });

  test("dos bloques cortos del mismo día suman sus horas", async () => {
    const manana = { id: 1, fecha: FUTURO, horaInicio: "08:00:00", horaFin: "12:00:00", motivo: "A" };
    const tarde = { id: 2, fecha: FUTURO, horaInicio: "14:00:00", horaFin: "18:00:00", motivo: "B" };
    const wrapper = await montarVista([manana, tarde]);

    expect(dia(wrapper, 15).classes()).toContain("calendario-mensual__dia--completo");
  });

  test("un servicio de pocas horas deja el día en parcial", async () => {
    const wrapper = await montarVista([], [solicitud(1, "ACEPTADA", FUTURO)]);

    expect(dia(wrapper, 15).classes()).toContain("calendario-mensual__dia--ocupado");
    expect(dia(wrapper, 15).classes()).not.toContain("calendario-mensual__dia--completo");
  });

  test("un servicio sin horas (antiguo) cuenta como día completo", async () => {
    const wrapper = await montarVista([], [solicitud(1, "ACEPTADA", FUTURO, { horaInicio: null, horaFin: null })]);

    expect(dia(wrapper, 15).classes()).toContain("calendario-mensual__dia--completo");
  });

  test("en un servicio de varios días, los del medio salen completos y los extremos según sus horas", async () => {
    const wrapper = await montarVista([], [
      solicitud(1, "ACEPTADA", "2026-12-20", { fechaFin: "2026-12-22", horaInicio: "22:00:00", horaFin: "08:00:00" }),
    ]);

    // Primer día: de 22:00 a medianoche (2 h). Medio: 24 h. Último día: de medianoche a 08:00 (8 h)
    expect(dia(wrapper, 20).classes()).not.toContain("calendario-mensual__dia--completo");
    expect(dia(wrapper, 21).classes()).toContain("calendario-mensual__dia--completo");
    expect(dia(wrapper, 22).classes()).toContain("calendario-mensual__dia--completo");
  });

  test("un día con servicio y bloque sale marcado como ocupado", async () => {
    const wrapper = await montarVista([bloque(1, FUTURO, "Cita")], [solicitud(1, "ACEPTADA", FUTURO)]);

    expect(dia(wrapper, 15).classes()).toContain("calendario-mensual__dia--ocupado");
  });
});

describe("MiCalendarioView: panel del día", () => {
  test("enseña el día en grande, el día de la semana en letras y la etiqueta Hoy", async () => {
    const wrapper = await montarVista();

    expect(wrapper.find(".calendario__numero-dia").text()).toBe("10");
    expect(wrapper.find(".calendario__titulo-lista").text()).toBe("Jueves 10 de diciembre de 2026");
    expect(wrapper.find(".calendario__etiqueta--hoy").exists()).toBe(true);
  });

  test("otro día que no es hoy no lleva la etiqueta Hoy", async () => {
    const wrapper = await montarVista();

    await dia(wrapper, 15).trigger("click");

    expect(wrapper.find(".calendario__numero-dia").text()).toBe("15");
    expect(wrapper.find(".calendario__etiqueta--hoy").exists()).toBe(false);
  });

  test("un día sin nada dice Día libre y enseña el mensaje amable", async () => {
    const wrapper = await montarVista();

    expect(wrapper.find(".calendario__etiqueta--libre").text()).toBe("Día libre");
    expect(wrapper.find(".calendario__vacio-caja").text()).toContain("No tienes nada apuntado este día");
  });

  test("un día con pocas horas dice cuánto está ocupado y que quedan horas libres", async () => {
    const wrapper = await montarVista([bloque(1, FUTURO, "Turno")]);

    await dia(wrapper, 15).trigger("click");

    // El bloque de prueba va de 08:00 a 15:00 = 7 horas
    expect(wrapper.find(".calendario__etiqueta--parcial").text()).toBe("Ocupado 7 h · te quedan horas libres");
    expect(wrapper.find(".calendario__vacio-caja").exists()).toBe(false);
  });

  test("un día con 8 horas o más dice Día completo", async () => {
    const largo = { id: 1, fecha: FUTURO, horaInicio: "08:00:00", horaFin: "16:00:00", motivo: "Turno" };
    const wrapper = await montarVista([largo]);

    await dia(wrapper, 15).trigger("click");

    expect(wrapper.find(".calendario__etiqueta--completo").text()).toBe("Día completo · 8 h ocupadas");
  });

  test("mientras carga no enseña el estado del día", () => {
    vi.spyOn(BloqueOcupadoRepository.prototype, "getMios").mockReturnValue(new Promise(() => {}));
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockReturnValue(new Promise(() => {}));
    const wrapper = mount(MiCalendarioView);

    expect(wrapper.find(".calendario__etiqueta--libre").exists()).toBe(false);
    expect(wrapper.find(".calendario__vacio-caja").exists()).toBe(false);
  });

  test("el botón Añadir un rato ocupado este día deja ese día en el formulario", async () => {
    const wrapper = await montarVista();
    await dia(wrapper, 20).trigger("click");
    await wrapper.find("#bloque-fecha").setValue("");

    await wrapper.find(".calendario__apuntar").trigger("click");

    expect(wrapper.find("#bloque-fecha").element.value).toBe(FUTURO_2);
  });

  test("en un día pasado no sale el botón de añadir", async () => {
    const wrapper = await montarVista();

    await dia(wrapper, 5).trigger("click");

    expect(wrapper.find(".calendario__apuntar").exists()).toBe(false);
  });
});

describe("MiCalendarioView: etiquetas de las tarjetas", () => {
  test("cada tarjeta dice si es un servicio aceptado o un rato ocupado", async () => {
    const wrapper = await montarVista([bloque(1, FUTURO, "Cita")], [solicitud(1, "ACEPTADA", FUTURO)]);

    await dia(wrapper, 15).trigger("click");

    expect(wrapper.find(".calendario__servicio .calendario__tipo").text()).toBe("Servicio aceptado");
    expect(wrapper.find(".calendario__bloque .calendario__tipo").text()).toBe("Rato ocupado");
  });
});

describe("MiCalendarioView: línea de horas del día", () => {
  test("un día sin nada enseña la línea con todo el día libre", async () => {
    const wrapper = await montarVista();

    expect(wrapper.find(".linea-dia").exists()).toBe(true);
    expect(wrapper.findAll(".linea-dia__tramo").length).toBe(0);
    expect(wrapper.find(".linea-dia__libres").text()).toBe("Libre todo el día.");
  });

  test("un bloque sale en la línea y deja las horas libres a los lados", async () => {
    const wrapper = await montarVista([bloque(1, FUTURO, "Turno")]);

    await dia(wrapper, 15).trigger("click");

    // El bloque de prueba va de 08:00 a 15:00
    expect(wrapper.findAll(".linea-dia__tramo").length).toBe(1);
    expect(wrapper.find(".linea-dia__tramo").attributes("title")).toBe("08:00 – 15:00 · Rato ocupado · Turno");
    expect(huecosLibres(wrapper)).toEqual(["00:00 – 08:00", "15:00 – 24:00"]);
  });

  test("un servicio de un día sale en la línea con sus horas", async () => {
    const wrapper = await montarVista([], [solicitud(1, "ACEPTADA", FUTURO)]);

    await dia(wrapper, 15).trigger("click");

    expect(wrapper.find(".linea-dia__tramo").attributes("title")).toBe(
      "09:00 – 12:00 · Servicio aceptado · Cuidado de Carmen",
    );
  });

  test("en un servicio de varios días la línea del primer y del último día cubre solo esa parte", async () => {
    const wrapper = await montarVista([], [
      solicitud(1, "ACEPTADA", "2026-12-20", { fechaFin: "2026-12-22", horaInicio: "22:00:00", horaFin: "08:00:00" }),
    ]);

    await dia(wrapper, 20).trigger("click");
    expect(huecosLibres(wrapper)).toEqual(["00:00 – 22:00"]);

    await dia(wrapper, 21).trigger("click");
    expect(wrapper.find(".linea-dia__libres").text()).toBe("No te queda ninguna hora libre este día.");

    await dia(wrapper, 22).trigger("click");
    expect(huecosLibres(wrapper)).toEqual(["08:00 – 24:00"]);
  });

  test("un servicio y un bloque en el mismo día salen los dos en la línea", async () => {
    const wrapper = await montarVista([bloque(1, FUTURO, "Cita")], [solicitud(1, "ACEPTADA", FUTURO)]);

    await dia(wrapper, 15).trigger("click");

    expect(wrapper.findAll(".linea-dia__tramo").length).toBe(2);
  });

  test("mientras carga no enseña la línea", () => {
    vi.spyOn(BloqueOcupadoRepository.prototype, "getMios").mockReturnValue(new Promise(() => {}));
    vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockReturnValue(new Promise(() => {}));
    const wrapper = mount(MiCalendarioView);

    expect(wrapper.find(".linea-dia").exists()).toBe(false);
  });

  test("al quitar un bloque la línea se actualiza", async () => {
    vi.spyOn(BloqueOcupadoRepository.prototype, "remove").mockResolvedValue();
    const wrapper = await montarVista([bloque(1, FUTURO, "Turno")]);
    await dia(wrapper, 15).trigger("click");

    await wrapper.find(".calendario__quitar").trigger("click");
    await flushPromises();

    expect(wrapper.findAll(".linea-dia__tramo").length).toBe(0);
    expect(wrapper.find(".linea-dia__libres").text()).toBe("Libre todo el día.");
  });
});

describe("MiCalendarioView: flechas para pasar de día", () => {
  test("la flecha siguiente pasa al día de después", async () => {
    const wrapper = await montarVista();

    await wrapper.find("#dia-siguiente").trigger("click");

    expect(wrapper.find(".calendario__titulo-lista").text()).toBe("Viernes 11 de diciembre de 2026");
    expect(wrapper.find(".calendario__numero-dia").text()).toBe("11");
    expect(dia(wrapper, 11).classes()).toContain("calendario-mensual__dia--seleccionado");
  });

  test("la flecha anterior pasa al día de antes", async () => {
    const wrapper = await montarVista();

    await wrapper.find("#dia-anterior").trigger("click");

    expect(wrapper.find(".calendario__titulo-lista").text()).toBe("Miércoles 9 de diciembre de 2026");
  });

  test("al pasar de día enseña lo que hay ese día", async () => {
    const wrapper = await montarVista([bloque(1, "2026-12-11", "Turno")]);
    expect(wrapper.findAll(".calendario__bloque").length).toBe(0);

    await wrapper.find("#dia-siguiente").trigger("click");

    expect(wrapper.findAll(".calendario__bloque").length).toBe(1);
    expect(wrapper.find(".linea-dia__tramo").exists()).toBe(true);
  });

  test("al pasar al primer día del mes siguiente, el calendario cambia de mes", async () => {
    const wrapper = await montarVista();
    await dia(wrapper, 31).trigger("click");

    await wrapper.find("#dia-siguiente").trigger("click");

    expect(wrapper.find(".calendario__titulo-lista").text()).toBe("Viernes 1 de enero de 2027");
    expect(wrapper.find(".calendario-mensual__titulo").text()).toBe("Enero 2027");
  });

  test("al pasar al último día del mes anterior, el calendario cambia de mes", async () => {
    const wrapper = await montarVista();
    await dia(wrapper, 1).trigger("click");

    await wrapper.find("#dia-anterior").trigger("click");

    expect(wrapper.find(".calendario__titulo-lista").text()).toBe("Lunes 30 de noviembre de 2026");
    expect(wrapper.find(".calendario-mensual__titulo").text()).toBe("Noviembre 2026");
  });

  test("al pasar a un día de hoy en adelante se deja puesto en el formulario", async () => {
    const wrapper = await montarVista();

    await wrapper.find("#dia-siguiente").trigger("click");

    expect(wrapper.find("#bloque-fecha").element.value).toBe("2026-12-11");
  });

  test("se puede volver a un día pasado y no sale el botón de añadir", async () => {
    const wrapper = await montarVista();

    // Hoy es el 10: allí sí sale el botón, y en el 9 (ya pasado) no
    expect(wrapper.find(".calendario__apuntar").exists()).toBe(true);
    await wrapper.find("#dia-anterior").trigger("click");
    expect(wrapper.find(".calendario__apuntar").exists()).toBe(false);
  });
});
