import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import EditarPerfilView from "../../../views/cuidador/EditarPerfilView.vue";
import CuidadorRepository from "../../../repositories/CuidadorRepository";

const perfil = {
  id: 3,
  especialidad: "Geriatría",
  anosExperiencia: 4,
  tarifaHora: 18,
  bio: "Cuido personas mayores desde hace años",
  tieneVehiculo: true,
  disponibleAhora: false,
  usuarioId: 8,
  usuarioNombre: "Pepe",
};

async function montarVista() {
  const wrapper = mount(EditarPerfilView);
  await new Promise((resolve) => setTimeout(resolve, 0));
  return wrapper;
}

async function enviar(wrapper) {
  await wrapper.find("form").trigger("submit.prevent");
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("EditarPerfilView", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("carga el perfil del cuidador en el formulario", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue(
      perfil
    );

    const wrapper = await montarVista();

    expect(wrapper.find("#especialidad").element.value).toBe("Geriatría");
    expect(wrapper.find("#anos").element.value).toBe("4");
    expect(wrapper.find("#tarifa").element.value).toBe("18");
    expect(wrapper.find("#bio").element.value).toContain("Cuido personas");
    expect(wrapper.find("#vehiculo").element.checked).toBe(true);
    expect(wrapper.find("#disponible").element.checked).toBe(false);
  });

  test("muestra error si falla la carga del perfil", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockRejectedValue(
      new Error("fallo")
    );

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("No se pudo cargar tu perfil.");
    expect(wrapper.find("form").exists()).toBe(false);
  });

  test("no guarda si falta la especialidad", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue(
      perfil
    );
    const updateSpy = vi
      .spyOn(CuidadorRepository.prototype, "update")
      .mockResolvedValue({});

    const wrapper = await montarVista();
    await wrapper.find("#especialidad").setValue("   ");
    await enviar(wrapper);

    expect(wrapper.text()).toContain(
      "Rellena la especialidad y la descripción."
    );
    expect(updateSpy).not.toHaveBeenCalled();
  });

  test("no guarda si la tarifa es 0", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue(
      perfil
    );
    const updateSpy = vi
      .spyOn(CuidadorRepository.prototype, "update")
      .mockResolvedValue({});

    const wrapper = await montarVista();
    await wrapper.find("#tarifa").setValue("0");
    await enviar(wrapper);

    expect(wrapper.text()).toContain("La tarifa por hora debe ser mayor que 0.");
    expect(updateSpy).not.toHaveBeenCalled();
  });

  test("no guarda si los años de experiencia son negativos", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue(
      perfil
    );
    const updateSpy = vi
      .spyOn(CuidadorRepository.prototype, "update")
      .mockResolvedValue({});

    const wrapper = await montarVista();
    await wrapper.find("#anos").setValue("-1");
    await enviar(wrapper);

    expect(wrapper.text()).toContain(
      "Los años de experiencia no pueden ser negativos."
    );
    expect(updateSpy).not.toHaveBeenCalled();
  });

  test("guarda los cambios y avisa de que se ha guardado", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue(
      perfil
    );
    const updateSpy = vi
      .spyOn(CuidadorRepository.prototype, "update")
      .mockResolvedValue({});

    const wrapper = await montarVista();
    await wrapper.find("#tarifa").setValue("20");
    await wrapper.find("#disponible").setValue(true);
    await enviar(wrapper);

    expect(updateSpy).toHaveBeenCalledWith(3, {
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 20,
      bio: "Cuido personas mayores desde hace años",
      tieneVehiculo: true,
      disponibleAhora: true,
      usuarioId: 8,
    });
    expect(wrapper.text()).toContain("Perfil guardado correctamente.");
  });

  test("muestra error si falla el guardado", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue(
      perfil
    );
    vi.spyOn(CuidadorRepository.prototype, "update").mockRejectedValue(
      new Error("fallo")
    );

    const wrapper = await montarVista();
    await enviar(wrapper);

    expect(wrapper.text()).toContain("No se pudo guardar tu perfil.");
    expect(wrapper.text()).not.toContain("Perfil guardado correctamente.");
  });
});