import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import MiCalendarioView from "../../../views/caregiver/MiCalendarioView.vue";
import BloqueOcupadoRepository from "../../../repositories/BloqueOcupadoRepository";
import SolicitudRepository from "../../../repositories/SolicitudRepository";

// ACOM-233: turnos rápidos y repetir un rato varios días desde Mi calendario.
// Hoy es el 10 de diciembre de 2026 (jueves). El 15 es martes y el 31 es jueves
const FUTURO = "2026-12-15";
const FIN_DE_MES = "2026-12-31";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 11, 10, 12, 0));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function montarVista() {
  vi.spyOn(BloqueOcupadoRepository.prototype, "getMios").mockResolvedValue([]);
  vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([]);
  const wrapper = mount(MiCalendarioView);
  await flushPromises();
  return wrapper;
}

function espiarRepetir(respuesta = { creados: 12, duplicados: 0 }) {
  return vi.spyOn(BloqueOcupadoRepository.prototype, "repetir").mockResolvedValue(respuesta);
}

function espiarCrear() {
  return vi.spyOn(BloqueOcupadoRepository.prototype, "create").mockResolvedValue({ id: 1 });
}

async function rellenar(wrapper, fecha, inicio, fin, motivo = "") {
  await wrapper.find("#bloque-fecha").setValue(fecha);
  await wrapper.find("#bloque-hora-inicio").setValue(inicio);
  await wrapper.find("#bloque-hora-fin").setValue(fin);
  await wrapper.find("#bloque-motivo").setValue(motivo);
}

async function activarRepetir(wrapper, hasta = FIN_DE_MES) {
  await wrapper.find("#bloque-repetir").setValue(true);
  await wrapper.find("#bloque-repetir-hasta").setValue(hasta);
}

async function enviar(wrapper) {
  await wrapper.find("form").trigger("submit.prevent");
  await flushPromises();
}

function casillaDelDia(wrapper, valor) {
  return wrapper.find(`[data-testid="dia-${valor}"]`);
}

function errorServidor(status, detalle) {
  return Object.assign(new Error("fallo"), { status: status, detalle: detalle });
}

describe("MiCalendarioView · turnos rápidos", () => {
  test("enseña tres botones: mañana, tarde y noche", async () => {
    const wrapper = await montarVista();

    expect(wrapper.find('[data-testid="turno-manana"]').text()).toContain("Mañana");
    expect(wrapper.find('[data-testid="turno-tarde"]').text()).toContain("Tarde");
    expect(wrapper.find('[data-testid="turno-noche"]').text()).toContain("Noche");
  });

  test("el botón de mañana rellena las horas y el motivo", async () => {
    const wrapper = await montarVista();

    await wrapper.find('[data-testid="turno-manana"]').trigger("click");

    expect(wrapper.find("#bloque-hora-inicio").element.value).toBe("07:00");
    expect(wrapper.find("#bloque-hora-fin").element.value).toBe("15:00");
    expect(wrapper.find("#bloque-motivo").element.value).toBe("Turno de mañana");
  });

  test("el botón de tarde rellena las horas y el motivo", async () => {
    const wrapper = await montarVista();

    await wrapper.find('[data-testid="turno-tarde"]').trigger("click");

    expect(wrapper.find("#bloque-hora-inicio").element.value).toBe("15:00");
    expect(wrapper.find("#bloque-hora-fin").element.value).toBe("23:00");
    expect(wrapper.find("#bloque-motivo").element.value).toBe("Turno de tarde");
  });

  test("el botón de noche rellena las horas y avisa de que acaba al día siguiente", async () => {
    const wrapper = await montarVista();

    await wrapper.find('[data-testid="turno-noche"]').trigger("click");

    expect(wrapper.find("#bloque-hora-inicio").element.value).toBe("23:00");
    expect(wrapper.find("#bloque-hora-fin").element.value).toBe("07:00");
    expect(wrapper.find('[data-testid="aviso-noche"]').exists()).toBe(true);
  });

  test("con un turno de día no sale el aviso de la noche", async () => {
    const wrapper = await montarVista();

    await wrapper.find('[data-testid="turno-manana"]').trigger("click");

    expect(wrapper.find('[data-testid="aviso-noche"]').exists()).toBe(false);
  });

  test("después de elegir un turno se pueden cambiar las horas", async () => {
    const wrapper = await montarVista();
    await wrapper.find('[data-testid="turno-manana"]').trigger("click");

    await wrapper.find("#bloque-hora-fin").setValue("14:00");

    expect(wrapper.find("#bloque-hora-fin").element.value).toBe("14:00");
    expect(wrapper.find("#bloque-hora-inicio").element.value).toBe("07:00");
  });

  test("un turno de día de un solo día se guarda como siempre, sin repetir", async () => {
    const crear = espiarCrear();
    const repetir = espiarRepetir();
    const wrapper = await montarVista();
    await wrapper.find("#bloque-fecha").setValue(FUTURO);
    await wrapper.find('[data-testid="turno-manana"]').trigger("click");

    await enviar(wrapper);

    expect(crear).toHaveBeenCalledWith({
      fecha: FUTURO,
      horaInicio: "07:00",
      horaFin: "15:00",
      motivo: "Turno de mañana",
    });
    expect(repetir).not.toHaveBeenCalled();
  });
});

describe("MiCalendarioView · turno de noche de un solo día", () => {
  test("se guarda con repetir ese mismo día y su día de la semana", async () => {
    const crear = espiarCrear();
    const repetir = espiarRepetir({ creados: 2, duplicados: 0 });
    const wrapper = await montarVista();
    await wrapper.find("#bloque-fecha").setValue(FUTURO);
    await wrapper.find('[data-testid="turno-noche"]').trigger("click");

    await enviar(wrapper);

    expect(repetir).toHaveBeenCalledWith({
      desde: FUTURO,
      hasta: FUTURO,
      diasSemana: ["TUESDAY"],
      horaInicio: "23:00",
      horaFin: "07:00",
      motivo: "Turno de noche",
    });
    expect(crear).not.toHaveBeenCalled();
  });

  test("cuenta lo que se ha añadido y vacía el formulario", async () => {
    espiarRepetir({ creados: 2, duplicados: 0 });
    const wrapper = await montarVista();
    await wrapper.find("#bloque-fecha").setValue(FUTURO);
    await wrapper.find('[data-testid="turno-noche"]').trigger("click");

    await enviar(wrapper);

    expect(wrapper.find('.calendario__form [role="status"]').text()).toContain("Hemos añadido 2 ratos ocupados");
    expect(wrapper.find("#bloque-fecha").element.value).toBe("");
    expect(wrapper.find("#bloque-hora-inicio").element.value).toBe("");
    expect(wrapper.find("#bloque-motivo").element.value).toBe("");
  });

  test("con una hora de fin anterior a mano también es un turno de noche", async () => {
    const repetir = espiarRepetir({ creados: 2, duplicados: 0 });
    const wrapper = await montarVista();
    await rellenar(wrapper, FUTURO, "20:00", "02:00", "  Guardia  ");

    await enviar(wrapper);

    expect(repetir).toHaveBeenCalledWith({
      desde: FUTURO,
      hasta: FUTURO,
      diasSemana: ["TUESDAY"],
      horaInicio: "20:00",
      horaFin: "02:00",
      motivo: "Guardia",
    });
  });

  test("con una fecha pasada avisa y no guarda", async () => {
    const repetir = espiarRepetir();
    const wrapper = await montarVista();
    await rellenar(wrapper, "2026-12-05", "23:00", "07:00");

    await enviar(wrapper);

    expect(wrapper.find(".calendario__error").text()).toContain("no puede estar en el pasado");
    expect(repetir).not.toHaveBeenCalled();
  });
});

describe("MiCalendarioView · repetir", () => {
  test("las opciones de repetir están ocultas hasta marcar la casilla", async () => {
    const wrapper = await montarVista();

    expect(wrapper.find("#bloque-repetir").exists()).toBe(true);
    expect(wrapper.find('[data-testid="opciones-repetir"]').exists()).toBe(false);

    await wrapper.find("#bloque-repetir").setValue(true);

    expect(wrapper.find('[data-testid="opciones-repetir"]').exists()).toBe(true);
    expect(wrapper.find("#bloque-repetir-hasta").exists()).toBe(true);
  });

  test("al marcarla quedan elegidos de lunes a viernes", async () => {
    const wrapper = await montarVista();

    await wrapper.find("#bloque-repetir").setValue(true);

    for (const dia of ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]) {
      expect(casillaDelDia(wrapper, dia).element.checked).toBe(true);
    }
    expect(casillaDelDia(wrapper, "SATURDAY").element.checked).toBe(false);
    expect(casillaDelDia(wrapper, "SUNDAY").element.checked).toBe(false);
  });

  test("enseña las siete casillas de los días", async () => {
    const wrapper = await montarVista();

    await wrapper.find("#bloque-repetir").setValue(true);

    expect(wrapper.findAll(".calendario__dia")).toHaveLength(7);
  });

  test("el atajo de todos los días marca los siete", async () => {
    const wrapper = await montarVista();
    await wrapper.find("#bloque-repetir").setValue(true);

    await wrapper.find("#dias-todos").trigger("click");

    expect(casillaDelDia(wrapper, "SATURDAY").element.checked).toBe(true);
    expect(casillaDelDia(wrapper, "SUNDAY").element.checked).toBe(true);
  });

  test("el atajo de lunes a viernes quita el fin de semana", async () => {
    const wrapper = await montarVista();
    await wrapper.find("#bloque-repetir").setValue(true);
    await wrapper.find("#dias-todos").trigger("click");

    await wrapper.find("#dias-laborables").trigger("click");

    expect(casillaDelDia(wrapper, "MONDAY").element.checked).toBe(true);
    expect(casillaDelDia(wrapper, "SATURDAY").element.checked).toBe(false);
    expect(casillaDelDia(wrapper, "SUNDAY").element.checked).toBe(false);
  });

  test("desmarcar la casilla de repetir esconde las opciones", async () => {
    const wrapper = await montarVista();
    await wrapper.find("#bloque-repetir").setValue(true);

    await wrapper.find("#bloque-repetir").setValue(false);

    expect(wrapper.find('[data-testid="opciones-repetir"]').exists()).toBe(false);
  });

  test("la fecha de fin no deja elegir un día anterior al primero", async () => {
    const wrapper = await montarVista();
    await wrapper.find("#bloque-fecha").setValue(FUTURO);

    await wrapper.find("#bloque-repetir").setValue(true);

    expect(wrapper.find("#bloque-repetir-hasta").attributes("min")).toBe(FUTURO);
  });

  test("manda las fechas, los días, las horas y el motivo al servidor", async () => {
    const crear = espiarCrear();
    const repetir = espiarRepetir({ creados: 12, duplicados: 0 });
    const wrapper = await montarVista();
    await wrapper.find("#bloque-fecha").setValue(FUTURO);
    await wrapper.find('[data-testid="turno-manana"]').trigger("click");
    await activarRepetir(wrapper);

    await enviar(wrapper);

    expect(repetir).toHaveBeenCalledWith({
      desde: FUTURO,
      hasta: FIN_DE_MES,
      diasSemana: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      horaInicio: "07:00",
      horaFin: "15:00",
      motivo: "Turno de mañana",
    });
    expect(crear).not.toHaveBeenCalled();
  });

  test("manda solo los días de la semana que se han elegido", async () => {
    const repetir = espiarRepetir();
    const wrapper = await montarVista();
    await rellenar(wrapper, FUTURO, "07:00", "15:00");
    await activarRepetir(wrapper);
    await casillaDelDia(wrapper, "TUESDAY").setValue(false);
    await casillaDelDia(wrapper, "THURSDAY").setValue(false);
    await casillaDelDia(wrapper, "SATURDAY").setValue(true);

    await enviar(wrapper);

    const enviados = repetir.mock.calls[0][0].diasSemana;
    expect(enviados.slice().sort()).toEqual(["FRIDAY", "MONDAY", "SATURDAY", "WEDNESDAY"]);
  });

  test("un turno de noche repetido manda también la hora de fin anterior", async () => {
    const repetir = espiarRepetir({ creados: 36, duplicados: 0 });
    const wrapper = await montarVista();
    await wrapper.find("#bloque-fecha").setValue(FUTURO);
    await wrapper.find('[data-testid="turno-noche"]').trigger("click");
    await activarRepetir(wrapper);

    await enviar(wrapper);

    expect(repetir.mock.calls[0][0].horaInicio).toBe("23:00");
    expect(repetir.mock.calls[0][0].horaFin).toBe("07:00");
    expect(repetir.mock.calls[0][0].hasta).toBe(FIN_DE_MES);
  });

  test("cuenta lo que se ha añadido y lo que ya estaba", async () => {
    espiarRepetir({ creados: 8, duplicados: 2 });
    const wrapper = await montarVista();
    await rellenar(wrapper, FUTURO, "07:00", "15:00");
    await activarRepetir(wrapper);

    await enviar(wrapper);

    const aviso = wrapper.find('.calendario__form [role="status"]');
    expect(aviso.text()).toContain("Hemos añadido 8 ratos ocupados");
    expect(aviso.text()).toContain("2 ya estaban");
  });

  test("después de repetir vacía el formulario, esconde las opciones y vuelve a cargar los bloques", async () => {
    espiarRepetir();
    const wrapper = await montarVista();
    const cargar = BloqueOcupadoRepository.prototype.getMios;
    cargar.mockClear();
    await rellenar(wrapper, FUTURO, "07:00", "15:00", "Turno");
    await activarRepetir(wrapper);

    await enviar(wrapper);

    expect(wrapper.find("#bloque-fecha").element.value).toBe("");
    expect(wrapper.find("#bloque-motivo").element.value).toBe("");
    expect(wrapper.find('[data-testid="opciones-repetir"]').exists()).toBe(false);
    expect(wrapper.find("#bloque-repetir").element.checked).toBe(false);
    expect(cargar).toHaveBeenCalledTimes(1);
  });

  test("se abre el primer día que se ha apuntado", async () => {
    espiarRepetir();
    const wrapper = await montarVista();
    await rellenar(wrapper, FUTURO, "07:00", "15:00");
    await activarRepetir(wrapper);

    await enviar(wrapper);

    expect(wrapper.find(".calendario__titulo-lista").text()).toContain("15");
  });

  test("sin decir hasta qué día se repite avisa y no guarda", async () => {
    const repetir = espiarRepetir();
    const wrapper = await montarVista();
    await rellenar(wrapper, FUTURO, "07:00", "15:00");
    await wrapper.find("#bloque-repetir").setValue(true);

    await enviar(wrapper);

    expect(wrapper.find(".calendario__error").text()).toContain("hasta qué día se repite");
    expect(repetir).not.toHaveBeenCalled();
  });

  test("con el último día anterior al primero avisa y no guarda", async () => {
    const repetir = espiarRepetir();
    const wrapper = await montarVista();
    await rellenar(wrapper, FUTURO, "07:00", "15:00");
    await activarRepetir(wrapper, "2026-12-11");

    await enviar(wrapper);

    expect(wrapper.find(".calendario__error").text()).toContain("el mismo que el primero o uno posterior");
    expect(repetir).not.toHaveBeenCalled();
  });

  test("sin ningún día de la semana avisa y no guarda", async () => {
    const repetir = espiarRepetir();
    const wrapper = await montarVista();
    await rellenar(wrapper, FUTURO, "07:00", "15:00");
    await activarRepetir(wrapper);
    for (const dia of ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]) {
      await casillaDelDia(wrapper, dia).setValue(false);
    }

    await enviar(wrapper);

    expect(wrapper.find(".calendario__error").text()).toContain("al menos un día de la semana");
    expect(repetir).not.toHaveBeenCalled();
  });

  test("repetir durante más de seis meses avisa y no guarda", async () => {
    const repetir = espiarRepetir();
    const wrapper = await montarVista();
    await rellenar(wrapper, FUTURO, "07:00", "15:00");
    await activarRepetir(wrapper, "2027-07-01");

    await enviar(wrapper);

    expect(wrapper.find(".calendario__error").text()).toContain("unos 6 meses");
    expect(repetir).not.toHaveBeenCalled();
  });

  test("seis meses justos sí se pueden repetir", async () => {
    const repetir = espiarRepetir();
    const wrapper = await montarVista();
    // El 15 de diciembre más 183 días es el 16 de junio de 2027
    await rellenar(wrapper, FUTURO, "07:00", "15:00");
    await activarRepetir(wrapper, "2027-06-16");

    await enviar(wrapper);

    expect(repetir).toHaveBeenCalledTimes(1);
  });

  test("si ninguno de los días elegidos cae entre las fechas avisa y no guarda", async () => {
    const repetir = espiarRepetir();
    const wrapper = await montarVista();
    // Del martes 15 al miércoles 16, pero solo se elige el sábado
    await rellenar(wrapper, FUTURO, "07:00", "15:00");
    await activarRepetir(wrapper, "2026-12-16");
    await wrapper.find("#dias-laborables").trigger("click");
    for (const dia of ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]) {
      await casillaDelDia(wrapper, dia).setValue(false);
    }
    await casillaDelDia(wrapper, "SATURDAY").setValue(true);

    await enviar(wrapper);

    expect(wrapper.find(".calendario__error").text()).toContain("Ninguno de los días");
    expect(repetir).not.toHaveBeenCalled();
  });

  test("con la hora de fin igual a la de inicio avisa y no guarda", async () => {
    const repetir = espiarRepetir();
    const wrapper = await montarVista();
    await rellenar(wrapper, FUTURO, "07:00", "07:00");
    await activarRepetir(wrapper);

    await enviar(wrapper);

    expect(wrapper.find(".calendario__error").text()).toContain("no puede ser igual");
    expect(repetir).not.toHaveBeenCalled();
  });

  test("sin rellenar las horas avisa y no guarda", async () => {
    const repetir = espiarRepetir();
    const wrapper = await montarVista();
    await wrapper.find("#bloque-fecha").setValue(FUTURO);
    await activarRepetir(wrapper);

    await enviar(wrapper);

    expect(wrapper.find(".calendario__error").text()).toContain("Rellena la fecha y las horas");
    expect(repetir).not.toHaveBeenCalled();
  });

  test("si el servidor explica el error, se enseña esa explicación y no se vacía el formulario", async () => {
    vi.spyOn(BloqueOcupadoRepository.prototype, "repetir").mockRejectedValue(
      errorServidor(400, "Solo se puede repetir un rato durante unos seis meses"),
    );
    const wrapper = await montarVista();
    await rellenar(wrapper, FUTURO, "07:00", "15:00");
    await activarRepetir(wrapper);

    await enviar(wrapper);

    expect(wrapper.find(".calendario__error").text()).toContain("durante unos seis meses");
    expect(wrapper.find("#bloque-fecha").element.value).toBe(FUTURO);
    expect(wrapper.find("#bloque-repetir").element.checked).toBe(true);
  });

  test("con un fallo del servidor sin explicación sale un mensaje general", async () => {
    vi.spyOn(BloqueOcupadoRepository.prototype, "repetir").mockRejectedValue(errorServidor(500, "boom interno"));
    const wrapper = await montarVista();
    await rellenar(wrapper, FUTURO, "07:00", "15:00");
    await activarRepetir(wrapper);

    await enviar(wrapper);

    const texto = wrapper.find(".calendario__error").text();
    expect(texto.length).toBeGreaterThan(0);
    expect(texto).not.toContain("boom interno");
  });
});
