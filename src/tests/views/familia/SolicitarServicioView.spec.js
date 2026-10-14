import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import SolicitarServicioView from "../../../views/familia/SolicitarServicioView.vue";
import CuidadorRepository from "../../../repositories/CuidadorRepository";
import SolicitudRepository from "../../../repositories/SolicitudRepository";
import { useAuthStore } from "../../../stores/auth";

function crearRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/solicitar/:id", name: "solicitar", component: SolicitarServicioView },
      { path: "/confirmacion", name: "confirmacion", component: { template: "<div>ok</div>" } },
    ],
  });
}

async function montarVista() {
  const router = crearRouter();
  await router.push("/solicitar/3");
  await router.isReady();

  const pinia = createPinia();
  const wrapper = mount(SolicitarServicioView, {
    global: {
      plugins: [router, pinia],
    },
  });

  const authStore = useAuthStore(pinia);
  authStore.login(1, "ana@test.com", "12345678", "FAMILIA");

  await new Promise((resolve) => setTimeout(resolve, 0));

  return { wrapper, router };
}

describe("SolicitarServicioView", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("muestra el nombre del cuidador tras cargarlo", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });

    const { wrapper } = await montarVista();

    expect(wrapper.text()).toContain("Pepe");
  });

  test("muestra error si falla la carga del cuidador", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockRejectedValue(
      new Error("fallo")
    );

    const { wrapper } = await montarVista();

    expect(wrapper.text()).toContain("No se pudo cargar el cuidador.");
  });

  test("no envía la solicitud si faltan campos obligatorios", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });
    const createSpy = vi
      .spyOn(SolicitudRepository.prototype, "create")
      .mockResolvedValue({});

    const { wrapper } = await montarVista();

    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.text()).toContain(
      "Por favor, rellena todos los campos obligatorios."
    );
    expect(createSpy).not.toHaveBeenCalled();
  });

  test("envía la solicitud correctamente y redirige a confirmación", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });
    const createSpy = vi
      .spyOn(SolicitudRepository.prototype, "create")
      .mockResolvedValue({ id: 9 });

    const { wrapper, router } = await montarVista();

    const opciones = wrapper.findAll(".solicitar__opcion");
    await opciones[0].trigger("click");

    await wrapper.find("#fecha").setValue("2026-10-10");
    await wrapper.find("#paciente").setValue("Antonio Serrano");
    await wrapper.find("#edad").setValue("81");
    await wrapper.find("#notas").setValue("Alergia a la penicilina");

    await wrapper.find("form").trigger("submit.prevent");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(createSpy).toHaveBeenCalledWith({
      tipoCuidado: "hospitalario",
      nombrePaciente: "Antonio Serrano",
      notas: "Alergia a la penicilina",
      edadPaciente: 81,
      fechaCuidado: "2026-10-10",
      fechaFin: null,
      familiaId: 1,
      cuidadorId: 3,
      necesidades: [],
    });
    expect(router.currentRoute.value.name).toBe("confirmacion");
    expect(router.currentRoute.value.query.id).toBe("9");
  });

  test("envía la fecha de fin si se rellena", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });
    const createSpy = vi
      .spyOn(SolicitudRepository.prototype, "create")
      .mockResolvedValue({ id: 9 });

    const { wrapper } = await montarVista();

    const opciones = wrapper.findAll(".solicitar__opcion");
    await opciones[1].trigger("click");

    await wrapper.find("#fecha").setValue("2026-10-10");
    await wrapper.find("#fecha-fin").setValue("2026-10-17");
    await wrapper.find("#paciente").setValue("Antonio Serrano");
    await wrapper.find("#edad").setValue("81");

    await wrapper.find("form").trigger("submit.prevent");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        fechaCuidado: "2026-10-10",
        fechaFin: "2026-10-17",
      })
    );
  });

  test("no envía la solicitud si la fecha de fin es anterior a la de inicio", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });
    const createSpy = vi
      .spyOn(SolicitudRepository.prototype, "create")
      .mockResolvedValue({});

    const { wrapper } = await montarVista();

    const opciones = wrapper.findAll(".solicitar__opcion");
    await opciones[0].trigger("click");

    await wrapper.find("#fecha").setValue("2026-10-10");
    await wrapper.find("#fecha-fin").setValue("2026-10-05");
    await wrapper.find("#paciente").setValue("Antonio Serrano");
    await wrapper.find("#edad").setValue("81");

    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.text()).toContain(
      "La fecha de fin no puede ser anterior a la de inicio."
    );
    expect(createSpy).not.toHaveBeenCalled();
  });

  test("muestra error si falla el envío de la solicitud", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });
    vi.spyOn(SolicitudRepository.prototype, "create").mockRejectedValue(
      new Error("fallo")
    );

    const { wrapper } = await montarVista();

    const opciones = wrapper.findAll(".solicitar__opcion");
    await opciones[1].trigger("click");

    await wrapper.find("#fecha").setValue("2026-10-10");
    await wrapper.find("#paciente").setValue("Antonio Serrano");
    await wrapper.find("#edad").setValue("81");

    await wrapper.find("form").trigger("submit.prevent");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain(
      "No se pudo enviar la solicitud. Inténtalo de nuevo."
    );
  });

  test("muestra los checkboxes de las necesidades del paciente", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });

    const { wrapper } = await montarVista();

    expect(wrapper.findAll(".solicitar__check").length).toBe(7);
    expect(wrapper.text()).toContain("Movilidad reducida");
    expect(wrapper.text()).toContain("Cuidados paliativos");
    expect(wrapper.find("#necesidad-medicacion").element.checked).toBe(false);
  });

  test("envía las necesidades marcadas", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });
    const createSpy = vi
      .spyOn(SolicitudRepository.prototype, "create")
      .mockResolvedValue({ id: 9 });

    const { wrapper } = await montarVista();

    const opciones = wrapper.findAll(".solicitar__opcion");
    await opciones[0].trigger("click");

    await wrapper.find("#fecha").setValue("2026-10-10");
    await wrapper.find("#paciente").setValue("Antonio Serrano");
    await wrapper.find("#edad").setValue("81");
    await wrapper.find("#necesidad-movilidad").setValue(true);
    await wrapper.find("#necesidad-nocturno").setValue(true);

    await wrapper.find("form").trigger("submit.prevent");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({ necesidades: ["movilidad", "nocturno"] })
    );
  });

  test("una necesidad desmarcada no se envía", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });
    const createSpy = vi
      .spyOn(SolicitudRepository.prototype, "create")
      .mockResolvedValue({ id: 9 });

    const { wrapper } = await montarVista();

    const opciones = wrapper.findAll(".solicitar__opcion");
    await opciones[0].trigger("click");

    await wrapper.find("#fecha").setValue("2026-10-10");
    await wrapper.find("#paciente").setValue("Antonio Serrano");
    await wrapper.find("#edad").setValue("81");
    await wrapper.find("#necesidad-higiene").setValue(true);
    await wrapper.find("#necesidad-higiene").setValue(false);

    await wrapper.find("form").trigger("submit.prevent");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({ necesidades: [] })
    );
  });
});