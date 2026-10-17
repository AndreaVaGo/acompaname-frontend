import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import EditarPerfilView from "../../../views/caregiver/EditarPerfilView.vue";
import CuidadorRepository from "../../../repositories/CuidadorRepository";
import { reducirImagen } from "../../../utils/reducirImagen";
import { useAuthStore } from "../../../stores/auth";

vi.mock("../../../utils/reducirImagen", () => ({
  reducirImagen: vi.fn(),
}));

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

async function elegirArchivo(wrapper, archivo) {
  const input = wrapper.find("#foto");
  Object.defineProperty(input.element, "files", {
    value: [archivo],
    configurable: true,
  });
  await input.trigger("change");
  await new Promise((resolve) => setTimeout(resolve, 0));
}

async function enviar(wrapper) {
  await wrapper.find("form").trigger("submit.prevent");
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("EditarPerfilView", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // jsdom no sabe hacer scroll: lo sustituimos por una función vacía
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    reducirImagen.mockReset();
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
      foto: null,
      ciudad: null,
      tipoCuidado: "ambos",
      servicios: [],
      sexo: "",
    });
    expect(wrapper.text()).toContain("Perfil guardado correctamente.");
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test("carga la ciudad del perfil en el formulario", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue({
      ...perfil,
      ciudad: "Oviedo",
    });

    const wrapper = await montarVista();

    expect(wrapper.find("#ciudad").element.value).toBe("Oviedo");
  });

  test("guarda la ciudad escrita", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue(
      perfil
    );
    const updateSpy = vi
      .spyOn(CuidadorRepository.prototype, "update")
      .mockResolvedValue({});

    const wrapper = await montarVista();
    await wrapper.find("#ciudad").setValue("  Gijón ");
    await enviar(wrapper);

    expect(updateSpy).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ ciudad: "Gijón" })
    );
  });

  test("si se borra la ciudad se guarda sin ciudad", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue({
      ...perfil,
      ciudad: "Oviedo",
    });
    const updateSpy = vi
      .spyOn(CuidadorRepository.prototype, "update")
      .mockResolvedValue({});

    const wrapper = await montarVista();
    await wrapper.find("#ciudad").setValue("");
    await enviar(wrapper);

    expect(updateSpy).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ ciudad: null })
    );
  });

  test("carga la foto del perfil en el formulario", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue({
      ...perfil,
      foto: "https://ejemplo.com/foto.jpg",
    });

    const wrapper = await montarVista();

    expect(wrapper.find("img").attributes("src")).toBe(
      "https://ejemplo.com/foto.jpg"
    );
  });

  test("guarda la foto elegida desde el ordenador", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue(
      perfil
    );
    const updateSpy = vi
      .spyOn(CuidadorRepository.prototype, "update")
      .mockResolvedValue({});
    reducirImagen.mockResolvedValue("data:image/jpeg;base64,AAAA");

    const wrapper = await montarVista();
    await elegirArchivo(wrapper, { type: "image/png", name: "foto.png" });

    expect(wrapper.find("img").attributes("src")).toBe(
      "data:image/jpeg;base64,AAAA"
    );

    await enviar(wrapper);

    expect(updateSpy).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ foto: "data:image/jpeg;base64,AAAA" })
    );
  });

  test("al guardar actualiza la foto del menú de arriba", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue(
      perfil
    );
    vi.spyOn(CuidadorRepository.prototype, "update").mockResolvedValue({});
    reducirImagen.mockResolvedValue("data:image/jpeg;base64,AAAA");
    const authStore = useAuthStore();

    const wrapper = await montarVista();
    await elegirArchivo(wrapper, { type: "image/png", name: "foto.png" });
    await enviar(wrapper);

    expect(authStore.foto).toBe("data:image/jpeg;base64,AAAA");
  });

  test("avisa si el archivo elegido no es una imagen", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue(
      perfil
    );

    const wrapper = await montarVista();
    await elegirArchivo(wrapper, { type: "application/pdf", name: "a.pdf" });

    expect(wrapper.text()).toContain("Elige un archivo de imagen.");
    expect(reducirImagen).not.toHaveBeenCalled();
  });

  test("avisa si no se puede cargar la imagen", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue(
      perfil
    );
    reducirImagen.mockRejectedValue(new Error("fallo"));

    const wrapper = await montarVista();
    await elegirArchivo(wrapper, { type: "image/png", name: "foto.png" });

    expect(wrapper.text()).toContain("No se pudo cargar la imagen.");
  });

  test("quitar la foto guarda el perfil sin foto", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue({
      ...perfil,
      foto: "data:image/jpeg;base64,AAAA",
    });
    const updateSpy = vi
      .spyOn(CuidadorRepository.prototype, "update")
      .mockResolvedValue({});

    const wrapper = await montarVista();
    await wrapper.find("#quitar-foto").trigger("click");
    await enviar(wrapper);

    expect(wrapper.find("img").exists()).toBe(false);
    expect(updateSpy).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ foto: null })
    );
  });

  test("sin foto muestra el monigote", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue(
      perfil
    );

    const wrapper = await montarVista();

    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.find(".foto-cuidador--sin-foto").exists()).toBe(true);
    expect(wrapper.find("#quitar-foto").exists()).toBe(false);
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

  test("carga el tipo de cuidado del perfil en el formulario", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue({
      ...perfil,
      tipoCuidado: "domicilio",
    });

    const wrapper = await montarVista();

    expect(wrapper.find("#tipo-cuidado").element.value).toBe("domicilio");
  });

  test("si el perfil no tiene tipo de cuidado se muestra Ambos", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue(
      perfil
    );

    const wrapper = await montarVista();

    expect(wrapper.find("#tipo-cuidado").element.value).toBe("ambos");
  });

  test("guarda el tipo de cuidado elegido", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue(
      perfil
    );
    const updateSpy = vi
      .spyOn(CuidadorRepository.prototype, "update")
      .mockResolvedValue({});

    const wrapper = await montarVista();
    await wrapper.find("#tipo-cuidado").setValue("hospitalario");
    await enviar(wrapper);

    expect(updateSpy).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ tipoCuidado: "hospitalario" })
    );
  });

  test("carga los servicios marcados del perfil", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue({
      ...perfil,
      servicios: ["medicacion", "higiene"],
    });

    const wrapper = await montarVista();

    expect(wrapper.find("#servicio-medicacion").element.checked).toBe(true);
    expect(wrapper.find("#servicio-higiene").element.checked).toBe(true);
    expect(wrapper.find("#servicio-nocturno").element.checked).toBe(false);
  });

  test("guarda los servicios marcados", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue(
      perfil
    );
    const updateSpy = vi
      .spyOn(CuidadorRepository.prototype, "update")
      .mockResolvedValue({});

    const wrapper = await montarVista();
    await wrapper.find("#servicio-medicacion").setValue(true);
    await wrapper.find("#servicio-nocturno").setValue(true);
    await enviar(wrapper);

    expect(updateSpy).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ servicios: ["medicacion", "nocturno"] })
    );
  });

  test("si se desmarcan todos los servicios se guarda la lista vacía", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue({
      ...perfil,
      servicios: ["medicacion"],
    });
    const updateSpy = vi
      .spyOn(CuidadorRepository.prototype, "update")
      .mockResolvedValue({});

    const wrapper = await montarVista();
    await wrapper.find("#servicio-medicacion").setValue(false);
    await enviar(wrapper);

    expect(updateSpy).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ servicios: [] })
    );
  });

  test("carga el sexo del perfil en el formulario", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue({
      ...perfil,
      sexo: "MUJER",
    });

    const wrapper = await montarVista();

    expect(wrapper.find("#sexo").element.value).toBe("MUJER");
  });

  test("si el perfil no tiene sexo se muestra Prefiero no indicarlo", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue(
      perfil
    );

    const wrapper = await montarVista();

    expect(wrapper.find("#sexo").element.value).toBe("");
  });

  test("guarda el sexo elegido", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue(
      perfil
    );
    const updateSpy = vi
      .spyOn(CuidadorRepository.prototype, "update")
      .mockResolvedValue({});

    const wrapper = await montarVista();
    await wrapper.find("#sexo").setValue("HOMBRE");
    await enviar(wrapper);

    expect(updateSpy).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ sexo: "HOMBRE" })
    );
  });
});