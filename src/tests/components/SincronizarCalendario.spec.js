import { describe, test, expect, vi, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import SincronizarCalendario from "../../components/SincronizarCalendario.vue";
import BloqueOcupadoRepository from "../../repositories/BloqueOcupadoRepository";

const PROTO = BloqueOcupadoRepository.prototype;

async function montar(estado) {
  vi.spyOn(PROTO, "getSuscripcion").mockResolvedValue(estado);
  const wrapper = mount(SincronizarCalendario);
  await flushPromises();
  return wrapper;
}

const VINCULADO = { vinculado: true, ultimaSincronizacion: "2026-11-26T10:10:05.123456", ultimoError: null };

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SincronizarCalendario · sin vincular", () => {
  test("enseña la ayuda y el campo para pegar la dirección", async () => {
    const wrapper = await montar({ vinculado: false });

    expect(wrapper.text()).toContain("Sincronizar con otro calendario");
    expect(wrapper.text()).toContain("no se leen ni se guardan");
    expect(wrapper.text()).toContain("no la compartas con nadie");
    expect(wrapper.find("#calendario-url").exists()).toBe(true);
    expect(wrapper.find("#sincronizar-ahora").exists()).toBe(false);
  });

  test("si no hay dirección avisa y no llama al servidor", async () => {
    const vincular = vi.spyOn(PROTO, "vincularCalendario");
    const wrapper = await montar({ vinculado: false });

    await wrapper.find("#vincular").trigger("click");

    expect(wrapper.find("[role='alert']").text()).toContain("Pega la dirección");
    expect(vincular).not.toHaveBeenCalled();
  });

  test("vincula con la dirección sin espacios, avisa y emite cambio", async () => {
    const vincular = vi.spyOn(PROTO, "vincularCalendario").mockResolvedValue(VINCULADO);
    const wrapper = await montar({ vinculado: false });

    await wrapper.find("#calendario-url").setValue("  https://calendar.google.com/x.ics ");
    await wrapper.find("#vincular").trigger("click");
    await flushPromises();

    expect(vincular).toHaveBeenCalledWith("https://calendar.google.com/x.ics");
    expect(wrapper.text()).toContain("Listo, tu calendario está vinculado");
    expect(wrapper.find("[data-testid='estado-vinculado']").exists()).toBe(true);
    expect(wrapper.emitted("cambio")).toHaveLength(1);
  });

  test("al vincular borra la dirección del campo", async () => {
    vi.spyOn(PROTO, "vincularCalendario").mockResolvedValue(VINCULADO);
    const wrapper = await montar({ vinculado: false });

    await wrapper.find("#calendario-url").setValue("https://calendar.google.com/x.ics");
    await wrapper.find("#vincular").trigger("click");
    await flushPromises();

    expect(wrapper.text()).not.toContain("calendar.google.com");
  });

  test("si el servidor explica por qué no vale, enseña esa explicación", async () => {
    const error = Object.assign(new Error("x"), {
      status: 400,
      detalle: "Solo se pueden vincular calendarios de Google, Outlook o iCloud",
    });
    vi.spyOn(PROTO, "vincularCalendario").mockRejectedValue(error);
    const wrapper = await montar({ vinculado: false });

    await wrapper.find("#calendario-url").setValue("https://example.com/x.ics");
    await wrapper.find("#vincular").trigger("click");
    await flushPromises();

    expect(wrapper.find("[role='alert']").text()).toContain("Google, Outlook o iCloud");
    expect(wrapper.emitted("cambio")).toBeUndefined();
  });

  test("si falla sin explicación enseña un mensaje general", async () => {
    vi.spyOn(PROTO, "vincularCalendario").mockRejectedValue(Object.assign(new Error("x"), { status: 500 }));
    const wrapper = await montar({ vinculado: false });

    await wrapper.find("#calendario-url").setValue("https://calendar.google.com/x.ics");
    await wrapper.find("#vincular").trigger("click");
    await flushPromises();

    expect(wrapper.find("[role='alert']").text()).toContain("No se pudo vincular el calendario.");
  });
});

describe("SincronizarCalendario · vinculado", () => {
  test("enseña que está vinculado y la última lectura", async () => {
    const wrapper = await montar(VINCULADO);

    expect(wrapper.find("[data-testid='estado-vinculado']").text()).toContain("Calendario vinculado");
    expect(wrapper.find("[data-testid='ultima-sincronizacion']").text()).toContain("26-11-2026 · 10:10");
    expect(wrapper.find("#calendario-url").exists()).toBe(false);
  });

  test("si hubo un error en la última lectura lo enseña", async () => {
    const wrapper = await montar({ ...VINCULADO, ultimoError: "No se pudo descargar el calendario" });

    expect(wrapper.find("[data-testid='ultimo-error']").text()).toContain("No se pudo descargar el calendario");
  });

  test("si todavía no se ha leído lo dice", async () => {
    const wrapper = await montar({ vinculado: true, ultimaSincronizacion: null, ultimoError: null });

    expect(wrapper.text()).toContain("Todavía no se ha leído correctamente");
  });

  test("sincronizar ahora avisa y emite cambio", async () => {
    const sincronizar = vi.spyOn(PROTO, "sincronizarCalendario").mockResolvedValue(VINCULADO);
    const wrapper = await montar(VINCULADO);

    await wrapper.find("#sincronizar-ahora").trigger("click");
    await flushPromises();

    expect(sincronizar).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain("Calendario actualizado");
    expect(wrapper.emitted("cambio")).toHaveLength(1);
  });

  test("si al sincronizar el servidor devuelve un error de lectura, lo enseña como error", async () => {
    vi.spyOn(PROTO, "sincronizarCalendario").mockResolvedValue({ ...VINCULADO, ultimoError: "El calendario es demasiado grande" });
    const wrapper = await montar(VINCULADO);

    await wrapper.find("#sincronizar-ahora").trigger("click");
    await flushPromises();

    expect(wrapper.find("[role='alert']").text()).toContain("El calendario es demasiado grande");
    expect(wrapper.text()).not.toContain("Calendario actualizado");
  });

  test("desvincular pide confirmación antes de hacer nada", async () => {
    const desvincular = vi.spyOn(PROTO, "desvincularCalendario").mockResolvedValue();
    const wrapper = await montar(VINCULADO);

    await wrapper.find("#desvincular").trigger("click");

    expect(wrapper.text()).toContain("Se quitarán los ratos ocupados que vinieron de ese calendario");
    expect(desvincular).not.toHaveBeenCalled();
  });

  test("cancelar la confirmación no desvincula", async () => {
    const desvincular = vi.spyOn(PROTO, "desvincularCalendario").mockResolvedValue();
    const wrapper = await montar(VINCULADO);

    await wrapper.find("#desvincular").trigger("click");
    await wrapper.find("#cancelar-desvincular").trigger("click");

    expect(desvincular).not.toHaveBeenCalled();
    expect(wrapper.find("#confirmar-desvincular").exists()).toBe(false);
    expect(wrapper.find("[data-testid='estado-vinculado']").exists()).toBe(true);
  });

  test("confirmar desvincula, vuelve a la pantalla de vincular y emite cambio", async () => {
    const desvincular = vi.spyOn(PROTO, "desvincularCalendario").mockResolvedValue();
    const wrapper = await montar(VINCULADO);

    await wrapper.find("#desvincular").trigger("click");
    await wrapper.find("#confirmar-desvincular").trigger("click");
    await flushPromises();

    expect(desvincular).toHaveBeenCalledTimes(1);
    expect(wrapper.find("#calendario-url").exists()).toBe(true);
    expect(wrapper.text()).toContain("Calendario desvinculado");
    expect(wrapper.emitted("cambio")).toHaveLength(1);
  });

  test("si falla al desvincular sigue vinculado y avisa", async () => {
    vi.spyOn(PROTO, "desvincularCalendario").mockRejectedValue(Object.assign(new Error("x"), { status: 500 }));
    const wrapper = await montar(VINCULADO);

    await wrapper.find("#desvincular").trigger("click");
    await wrapper.find("#confirmar-desvincular").trigger("click");
    await flushPromises();

    expect(wrapper.find("[role='alert']").text()).toContain("No se pudo desvincular el calendario.");
    expect(wrapper.find("[data-testid='estado-vinculado']").exists()).toBe(true);
  });
});

describe("SincronizarCalendario · carga", () => {
  test("si no se puede comprobar el estado lo dice sin romper nada", async () => {
    vi.spyOn(PROTO, "getSuscripcion").mockRejectedValue(Object.assign(new Error("x"), { status: 500 }));
    const wrapper = mount(SincronizarCalendario);
    await flushPromises();

    expect(wrapper.find("[data-testid='error-carga']").exists()).toBe(true);
    expect(wrapper.find("#calendario-url").exists()).toBe(false);
  });
});
