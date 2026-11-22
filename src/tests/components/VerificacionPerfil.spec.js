import { describe, test, expect, vi, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import VerificacionPerfil from "../../components/VerificacionPerfil.vue";
import VerificacionRepository from "../../repositories/VerificacionRepository";

const PENDIENTE = {
  id: 1,
  tipo: "TITULACION",
  estado: "PENDIENTE",
  referencia: "COL-1",
  solicitadaEn: "2026-11-22T10:00:00",
  revisadaEn: null,
  motivoRechazo: null,
};

async function montar(lista) {
  vi.spyOn(VerificacionRepository.prototype, "getMias").mockResolvedValue(lista);
  const wrapper = mount(VerificacionPerfil);
  await flushPromises();
  return wrapper;
}

describe("VerificacionPerfil", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("sin nada enviado marca los dos tipos como sin verificar", async () => {
    const wrapper = await montar([]);

    expect(wrapper.find('[data-testid="estado-TITULACION"]').text()).toBe("Sin verificar");
    expect(wrapper.find('[data-testid="estado-ANTECEDENTES"]').text()).toBe("Sin verificar");
    expect(wrapper.find('[data-testid="enviar-TITULACION"]').text()).toBe("Enviar para revisar");
  });

  test("si no se pueden consultar (sin perfil, sin conexión) no enseña el bloque", async () => {
    vi.spyOn(VerificacionRepository.prototype, "getMias").mockRejectedValue(new Error("fallo"));
    const wrapper = mount(VerificacionPerfil);
    await flushPromises();

    expect(wrapper.find('[data-testid="verificacion-perfil"]').exists()).toBe(false);
  });

  test("una pendiente enseña 'En revisión' y deja volver a enviar", async () => {
    const wrapper = await montar([PENDIENTE]);

    expect(wrapper.find('[data-testid="estado-TITULACION"]').text()).toBe("En revisión");
    expect(wrapper.find('[data-testid="enviar-TITULACION"]').text()).toBe("Volver a enviar");
  });

  test("una verificada enseña 'Verificado' y ya no pide nada", async () => {
    const wrapper = await montar([{ ...PENDIENTE, estado: "VERIFICADO" }]);

    expect(wrapper.find('[data-testid="estado-TITULACION"]').text()).toBe("Verificado");
    expect(wrapper.find("#verif-TITULACION").exists()).toBe(false);
    expect(wrapper.find('[data-testid="enviar-TITULACION"]').exists()).toBe(false);
  });

  test("una rechazada enseña el motivo y deja reenviar", async () => {
    const wrapper = await montar([
      { ...PENDIENTE, estado: "RECHAZADO", motivoRechazo: "No coincide" },
    ]);

    expect(wrapper.text()).toContain("No se pudo comprobar");
    expect(wrapper.text()).toContain("No coincide");
    expect(wrapper.find("#verif-TITULACION").exists()).toBe(true);
  });

  test("una rechazada sin motivo enseña el aviso sin motivo", async () => {
    const wrapper = await montar([{ ...PENDIENTE, estado: "RECHAZADO" }]);

    expect(wrapper.text()).toContain("No se pudo comprobar");
    expect(wrapper.text()).not.toContain("No se pudo comprobar:");
  });

  test("no deja enviar una referencia vacía", async () => {
    const wrapper = await montar([]);
    const enviar = vi.spyOn(VerificacionRepository.prototype, "enviar");

    await wrapper.find('[data-testid="enviar-TITULACION"]').trigger("click");

    expect(enviar).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Escribe la referencia antes de enviarla.");
  });

  test("envía la referencia sin espacios y pasa a 'En revisión'", async () => {
    const wrapper = await montar([]);
    const enviar = vi
      .spyOn(VerificacionRepository.prototype, "enviar")
      .mockResolvedValue({ ...PENDIENTE, tipo: "ANTECEDENTES", referencia: "SD:ABC" });

    await wrapper.find("#verif-ANTECEDENTES").setValue("  SD:ABC  ");
    await wrapper.find('[data-testid="enviar-ANTECEDENTES"]').trigger("click");
    await flushPromises();

    expect(enviar).toHaveBeenCalledWith("ANTECEDENTES", "SD:ABC");
    expect(wrapper.find('[data-testid="estado-ANTECEDENTES"]').text()).toBe("En revisión");
    expect(wrapper.text()).toContain("Un administrador la revisará pronto.");
  });

  test("Enter en el campo envía sin enviar el formulario de fuera", async () => {
    const wrapper = await montar([]);
    const enviar = vi.spyOn(VerificacionRepository.prototype, "enviar").mockResolvedValue(PENDIENTE);

    await wrapper.find("#verif-TITULACION").setValue("COL-1");
    await wrapper.find("#verif-TITULACION").trigger("keydown", { key: "Enter" });
    await flushPromises();

    expect(enviar).toHaveBeenCalledWith("TITULACION", "COL-1");
  });

  test("si el servidor falla enseña el motivo y deja el estado como estaba", async () => {
    const wrapper = await montar([]);
    const error = new Error("fallo");
    error.status = 500;
    vi.spyOn(VerificacionRepository.prototype, "enviar").mockRejectedValue(error);

    await wrapper.find("#verif-TITULACION").setValue("COL-1");
    await wrapper.find('[data-testid="enviar-TITULACION"]').trigger("click");
    await flushPromises();

    expect(wrapper.find('[role="alert"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="estado-TITULACION"]').text()).toBe("Sin verificar");
  });
});
