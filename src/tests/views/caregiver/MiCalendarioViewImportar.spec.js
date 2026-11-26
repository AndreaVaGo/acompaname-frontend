import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import MiCalendarioView from "../../../views/caregiver/MiCalendarioView.vue";
import BloqueOcupadoRepository from "../../../repositories/BloqueOcupadoRepository";
import SolicitudRepository from "../../../repositories/SolicitudRepository";

// ACOM-224: importar un calendario externo (.ics) desde Mi calendario
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
  vi.spyOn(BloqueOcupadoRepository.prototype, "getSuscripcion").mockResolvedValue({ vinculado: false });
  vi.spyOn(SolicitudRepository.prototype, "getMisSolicitudes").mockResolvedValue([]);
  const wrapper = mount(MiCalendarioView);
  await flushPromises();
  return wrapper;
}

// Un archivo falso: solo hacen falta su nombre, su tamaño y su texto
function archivoFalso(nombre = "calendario.ics", texto = "BEGIN:VCALENDAR\nEND:VCALENDAR", tamano = null) {
  return { name: nombre, size: tamano === null ? texto.length : tamano, text: async () => texto };
}

async function elegirArchivo(wrapper, archivo) {
  const entrada = wrapper.find("#calendario-archivo");
  Object.defineProperty(entrada.element, "files", { value: [archivo], configurable: true });
  await entrada.trigger("change");
  await flushPromises();
}

describe("MiCalendarioView · importar calendario", () => {
  test("enseña la sección para importar con su ayuda", async () => {
    const wrapper = await montarVista();

    expect(wrapper.find("#calendario-archivo").exists()).toBe(true);
    expect(wrapper.find("#calendario-archivo").attributes("accept")).toContain(".ics");
    expect(wrapper.text()).toContain("Importar desde otro calendario");
  });

  test("explica que no se guarda el título de las citas", async () => {
    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("El título y los detalles de tus citas no se leen ni se guardan");
  });

  test("avisa de que los eventos repetidos todavía no se importan", async () => {
    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("Los eventos que se repiten");
  });

  test("manda el texto del archivo al servidor y enseña el resumen", async () => {
    const wrapper = await montarVista();
    const importar = vi
      .spyOn(BloqueOcupadoRepository.prototype, "importar")
      .mockResolvedValue({ importados: 2, duplicados: 1, omitidos: 0 });

    await elegirArchivo(wrapper, archivoFalso("turnos.ics", "BEGIN:VCALENDAR\nTEXTO\nEND:VCALENDAR"));

    expect(importar).toHaveBeenCalledWith("BEGIN:VCALENDAR\nTEXTO\nEND:VCALENDAR");
    const aviso = wrapper.find('.calendario__importar [role="status"]');
    expect(aviso.text()).toContain("Hemos añadido 2 ratos ocupados");
    expect(aviso.text()).toContain("1 ya estaba");
  });

  test("después de importar vuelve a cargar los bloques", async () => {
    const wrapper = await montarVista();
    vi.spyOn(BloqueOcupadoRepository.prototype, "importar").mockResolvedValue({
      importados: 1,
      duplicados: 0,
      omitidos: 0,
    });
    const cargar = BloqueOcupadoRepository.prototype.getMios;
    cargar.mockClear();

    await elegirArchivo(wrapper, archivoFalso());

    expect(cargar).toHaveBeenCalledTimes(1);
  });

  test("un archivo que no es .ics da error y no llama al servidor", async () => {
    const wrapper = await montarVista();
    const importar = vi.spyOn(BloqueOcupadoRepository.prototype, "importar");

    await elegirArchivo(wrapper, archivoFalso("foto.png"));

    expect(importar).not.toHaveBeenCalled();
    expect(wrapper.find('.calendario__importar [role="alert"]').text()).toContain(".ics");
  });

  test("la extensión se acepta aunque esté en mayúsculas", async () => {
    const wrapper = await montarVista();
    const importar = vi
      .spyOn(BloqueOcupadoRepository.prototype, "importar")
      .mockResolvedValue({ importados: 0, duplicados: 0, omitidos: 0 });

    await elegirArchivo(wrapper, archivoFalso("TURNOS.ICS"));

    expect(importar).toHaveBeenCalled();
  });

  test("un archivo demasiado grande da error y no llama al servidor", async () => {
    const wrapper = await montarVista();
    const importar = vi.spyOn(BloqueOcupadoRepository.prototype, "importar");

    await elegirArchivo(wrapper, archivoFalso("grande.ics", "BEGIN:VCALENDAR", 600000));

    expect(importar).not.toHaveBeenCalled();
    expect(wrapper.find('.calendario__importar [role="alert"]').text()).toContain("demasiado grande");
  });

  test("si el servidor explica por qué el archivo no vale, enseña esa explicación", async () => {
    const wrapper = await montarVista();
    const error = new Error("Error en la petición POST");
    error.status = 400;
    error.detalle = "El archivo no parece un calendario .ics válido";
    vi.spyOn(BloqueOcupadoRepository.prototype, "importar").mockRejectedValue(error);

    await elegirArchivo(wrapper, archivoFalso());

    expect(wrapper.find('.calendario__importar [role="alert"]').text()).toBe(
      "El archivo no parece un calendario .ics válido",
    );
    expect(wrapper.find('.calendario__importar [role="status"]').exists()).toBe(false);
  });

  test("un 400 con un cuerpo que no es texto sencillo enseña el mensaje de siempre", async () => {
    const wrapper = await montarVista();
    const error = new Error("Error en la petición POST");
    error.status = 400;
    error.detalle = '{"contenido":"no puede estar vacío"}';
    vi.spyOn(BloqueOcupadoRepository.prototype, "importar").mockRejectedValue(error);

    await elegirArchivo(wrapper, archivoFalso());

    expect(wrapper.find('.calendario__importar [role="alert"]').text()).toBe(
      "No se pudo importar el calendario. Los datos enviados no son correctos.",
    );
  });

  test("un error del servidor enseña el mensaje de siempre", async () => {
    const wrapper = await montarVista();
    const error = new Error("Error en la petición POST");
    error.status = 500;
    vi.spyOn(BloqueOcupadoRepository.prototype, "importar").mockRejectedValue(error);

    await elegirArchivo(wrapper, archivoFalso());

    expect(wrapper.find('.calendario__importar [role="alert"]').text()).toContain(
      "No se pudo importar el calendario.",
    );
  });

  test("un archivo vacío da error y no llama al servidor", async () => {
    const wrapper = await montarVista();
    const importar = vi.spyOn(BloqueOcupadoRepository.prototype, "importar");

    await elegirArchivo(wrapper, archivoFalso("vacio.ics", "   "));

    expect(importar).not.toHaveBeenCalled();
    expect(wrapper.find('.calendario__importar [role="alert"]').text()).toBe("El archivo está vacío.");
  });

  test("mientras importa, el campo del archivo queda desactivado", async () => {
    const wrapper = await montarVista();
    let terminar;
    vi.spyOn(BloqueOcupadoRepository.prototype, "importar").mockReturnValue(
      new Promise((resolve) => {
        terminar = resolve;
      }),
    );

    await elegirArchivo(wrapper, archivoFalso());
    expect(wrapper.find("#calendario-archivo").attributes("disabled")).toBeDefined();
    expect(wrapper.text()).toContain("Importando tu calendario");

    terminar({ importados: 0, duplicados: 0, omitidos: 0 });
    await flushPromises();
    expect(wrapper.find("#calendario-archivo").attributes("disabled")).toBeUndefined();
  });

  test("si no se elige ningún archivo no pasa nada", async () => {
    const wrapper = await montarVista();
    const importar = vi.spyOn(BloqueOcupadoRepository.prototype, "importar");
    const entrada = wrapper.find("#calendario-archivo");
    Object.defineProperty(entrada.element, "files", { value: [], configurable: true });

    await entrada.trigger("change");
    await flushPromises();

    expect(importar).not.toHaveBeenCalled();
  });

  test("el aviso anterior desaparece al elegir otro archivo", async () => {
    const wrapper = await montarVista();
    vi.spyOn(BloqueOcupadoRepository.prototype, "importar").mockResolvedValue({
      importados: 1,
      duplicados: 0,
      omitidos: 0,
    });
    await elegirArchivo(wrapper, archivoFalso());
    expect(wrapper.find('.calendario__importar [role="status"]').exists()).toBe(true);

    await elegirArchivo(wrapper, archivoFalso("otro.png"));

    expect(wrapper.find('.calendario__importar [role="status"]').exists()).toBe(false);
    expect(wrapper.find('.calendario__importar [role="alert"]').exists()).toBe(true);
  });
});

// ACOM-236: la sección de sincronizar con un calendario externo está en Mi calendario
describe("MiCalendarioView · sincronizar calendario", () => {
  test("enseña la sección para vincular un calendario", async () => {
    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("Sincronizar con otro calendario");
    expect(wrapper.find("#calendario-url").exists()).toBe(true);
  });

  test("al vincular, vuelve a cargar los ratos ocupados", async () => {
    const wrapper = await montarVista();
    vi.spyOn(BloqueOcupadoRepository.prototype, "vincularCalendario").mockResolvedValue({
      vinculado: true,
      ultimaSincronizacion: null,
      ultimoError: null,
    });
    const getMios = BloqueOcupadoRepository.prototype.getMios;
    getMios.mockClear();

    await wrapper.find("#calendario-url").setValue("https://calendar.google.com/x.ics");
    await wrapper.find("#vincular").trigger("click");
    await flushPromises();

    expect(getMios).toHaveBeenCalledTimes(1);
  });
});
