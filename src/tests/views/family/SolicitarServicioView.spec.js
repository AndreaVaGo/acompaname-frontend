import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import SolicitarServicioView from "../../../views/family/SolicitarServicioView.vue";
import CuidadorRepository from "../../../repositories/CuidadorRepository";
import SolicitudRepository from "../../../repositories/SolicitudRepository";
import { useAuthStore } from "../../../stores/auth";

function crearRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: "/solicitar/:id",
        name: "solicitar",
        component: SolicitarServicioView,
      },
      {
        path: "/confirmacion",
        name: "confirmacion",
        component: { template: "<div>ok</div>" },
      },
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

// Elige el grupo de edad de la persona cuidada (es lo primero que se hace en el formulario)
async function elegirGrupo(wrapper, codigo) {
  await wrapper
    .find(`input[name="grupo-solicitud"][value="${codigo}"]`)
    .setValue(true);
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
      new Error("fallo"),
    );

    const { wrapper } = await montarVista();

    expect(wrapper.text()).toContain("No se pudo cargar el cuidador.");
  });

  test("muestra el motivo si el cuidador no existe", async () => {
    const errorNoEncontrado = new Error("fallo");
    errorNoEncontrado.status = 404;
    vi.spyOn(CuidadorRepository.prototype, "getById").mockRejectedValue(
      errorNoEncontrado,
    );

    const { wrapper } = await montarVista();

    expect(wrapper.text()).toContain(
      "No se pudo cargar el cuidador. No se ha encontrado lo que buscas.",
    );
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
      "Por favor, rellena todos los campos obligatorios.",
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
    await wrapper.find("#hospital").setValue("Hospital de Cabueñes");
    await wrapper.find("#ubicacion").setValue("Planta 2, habitación 214");
    await elegirGrupo(wrapper, "MAYORES");
    await wrapper.find("#paciente").setValue("Antonio Serrano");
    await wrapper.find("#edad").setValue("81");
    await wrapper.find("#notas").setValue("Alergia a la penicilina");

    await wrapper.find("form").trigger("submit.prevent");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(createSpy).toHaveBeenCalledWith({
      tipoCuidado: "hospitalario",
      direccion: "Hospital de Cabueñes, Planta 2, habitación 214",
      nombrePaciente: "Antonio Serrano",
      grupoEdad: "MAYORES",
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
    await wrapper.find("#direccion").setValue("Calle Uría 10, Oviedo");
    await elegirGrupo(wrapper, "MAYORES");
    await wrapper.find("#paciente").setValue("Antonio Serrano");
    await wrapper.find("#edad").setValue("81");

    await wrapper.find("form").trigger("submit.prevent");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        fechaCuidado: "2026-10-10",
        fechaFin: "2026-10-17",
      }),
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
    await wrapper.find("#hospital").setValue("Hospital de Cabueñes");
    await wrapper.find("#ubicacion").setValue("Planta 2, habitación 214");
    await elegirGrupo(wrapper, "MAYORES");
    await wrapper.find("#paciente").setValue("Antonio Serrano");
    await wrapper.find("#edad").setValue("81");

    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.text()).toContain(
      "La fecha de fin no puede ser anterior a la de inicio.",
    );
    expect(createSpy).not.toHaveBeenCalled();
  });

  test("muestra error si falla el envío de la solicitud", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });
    vi.spyOn(SolicitudRepository.prototype, "create").mockRejectedValue(
      new Error("fallo"),
    );

    const { wrapper } = await montarVista();

    const opciones = wrapper.findAll(".solicitar__opcion");
    await opciones[1].trigger("click");

    await wrapper.find("#fecha").setValue("2026-10-10");
    await wrapper.find("#direccion").setValue("Calle Uría 10, Oviedo");
    await elegirGrupo(wrapper, "MAYORES");
    await wrapper.find("#paciente").setValue("Antonio Serrano");
    await wrapper.find("#edad").setValue("81");

    await wrapper.find("form").trigger("submit.prevent");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("No se pudo enviar la solicitud.");
  });

  test("muestra el motivo si el servidor no deja enviar la solicitud", async () => {
    const errorPermiso = new Error("fallo");
    errorPermiso.status = 403;
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });
    vi.spyOn(SolicitudRepository.prototype, "create").mockRejectedValue(
      errorPermiso,
    );

    const { wrapper } = await montarVista();

    const opciones = wrapper.findAll(".solicitar__opcion");
    await opciones[1].trigger("click");

    await wrapper.find("#fecha").setValue("2026-10-10");
    await wrapper.find("#direccion").setValue("Calle Uría 10, Oviedo");
    await elegirGrupo(wrapper, "MAYORES");
    await wrapper.find("#paciente").setValue("Antonio Serrano");
    await wrapper.find("#edad").setValue("81");

    await wrapper.find("form").trigger("submit.prevent");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain(
      "No se pudo enviar la solicitud. No tienes permiso para hacer esto.",
    );
  });

    test("muestra los checkboxes de las necesidades de la persona cuidada", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });

    const { wrapper } = await montarVista();
    await elegirGrupo(wrapper, "MAYORES");

    expect(wrapper.findAll(".solicitar__check").length).toBe(10);
    expect(wrapper.text()).toContain("Ayuda a domicilio");
    expect(wrapper.text()).toContain("Acompañamiento general");
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
    await wrapper.find("#hospital").setValue("Hospital de Cabueñes");
    await wrapper.find("#ubicacion").setValue("Planta 2, habitación 214");
    await elegirGrupo(wrapper, "MAYORES");
    await wrapper.find("#paciente").setValue("Antonio Serrano");
    await wrapper.find("#edad").setValue("81");
    await wrapper.find("#necesidad-movilidad").setValue(true);
    await wrapper.find("#necesidad-nocturno").setValue(true);

    await wrapper.find("form").trigger("submit.prevent");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({ necesidades: ["movilidad", "nocturno"] }),
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
    await wrapper.find("#hospital").setValue("Hospital de Cabueñes");
    await wrapper.find("#ubicacion").setValue("Planta 2, habitación 214");
    await elegirGrupo(wrapper, "MAYORES");
    await wrapper.find("#paciente").setValue("Antonio Serrano");
    await wrapper.find("#edad").setValue("81");
    await wrapper.find("#necesidad-higiene").setValue(true);
    await wrapper.find("#necesidad-higiene").setValue(false);

    await wrapper.find("form").trigger("submit.prevent");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({ necesidades: [] }),
    );
  });

  test("pide hospital y ubicación si es hospitalario, y dirección si es a domicilio", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });

    const { wrapper } = await montarVista();
    const opciones = wrapper.findAll(".solicitar__opcion");

    expect(wrapper.find("#hospital").exists()).toBe(false);
    expect(wrapper.find("#direccion").exists()).toBe(false);

    await opciones[1].trigger("click");
    expect(wrapper.find("#direccion").exists()).toBe(true);
    expect(wrapper.find("#hospital").exists()).toBe(false);

    await opciones[0].trigger("click");
    expect(wrapper.find("#hospital").exists()).toBe(true);
    expect(wrapper.find("#ubicacion").exists()).toBe(true);
    expect(wrapper.find("#direccion").exists()).toBe(false);
  });

  test("en un hospital no envía la solicitud si falta la planta o habitación", async () => {
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
    await wrapper.find("#hospital").setValue("HUCA");
    await elegirGrupo(wrapper, "MAYORES");
    await wrapper.find("#paciente").setValue("Antonio Serrano");
    await wrapper.find("#edad").setValue("81");

    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.text()).toContain(
      "Por favor, rellena todos los campos obligatorios.",
    );
    expect(createSpy).not.toHaveBeenCalled();
  });

  test("no envía la solicitud si falta la dirección", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });
    const createSpy = vi
      .spyOn(SolicitudRepository.prototype, "create")
      .mockResolvedValue({});

    const { wrapper } = await montarVista();

    const opciones = wrapper.findAll(".solicitar__opcion");
    await opciones[1].trigger("click");

    await wrapper.find("#fecha").setValue("2026-10-10");
    await wrapper.find("#direccion").setValue("   ");
    await elegirGrupo(wrapper, "MAYORES");
    await wrapper.find("#paciente").setValue("Antonio Serrano");
    await wrapper.find("#edad").setValue("81");

    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.text()).toContain(
      "Por favor, rellena todos los campos obligatorios.",
    );
    expect(createSpy).not.toHaveBeenCalled();
  });

  test("al principio pide elegir el grupo de edad y no enseña los datos de la persona", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });

    const { wrapper } = await montarVista();

    expect(wrapper.text()).toContain("¿Quién necesita cuidados?");
    expect(wrapper.findAll('input[name="grupo-solicitud"]')).toHaveLength(6);
    expect(wrapper.text()).toContain("Elige arriba quién necesita cuidados");
    expect(wrapper.find("#paciente").exists()).toBe(false);
    expect(wrapper.find("#edad").exists()).toBe(false);
    expect(wrapper.findAll(".solicitar__check")).toHaveLength(0);
  });

  test("al elegir un grupo salen los datos de la persona cuidada", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });

    const { wrapper } = await montarVista();
    await elegirGrupo(wrapper, "MAYORES");

    expect(wrapper.find("#paciente").exists()).toBe(true);
    expect(wrapper.find("#edad").exists()).toBe(true);
    expect(wrapper.text()).not.toContain(
      "Elige arriba quién necesita cuidados",
    );
  });

  test("en los textos visibles se habla de persona cuidada y no de paciente", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });

    const { wrapper } = await montarVista();
    await elegirGrupo(wrapper, "MAYORES");

    expect(wrapper.text().toLowerCase()).not.toContain("paciente");
    expect(wrapper.text()).toContain("Nombre de la persona cuidada");
    expect(wrapper.text()).toContain("Edad de la persona cuidada");
    expect(wrapper.text()).toContain("Información sobre la persona cuidada");
  });

  test("los textos de ejemplo cambian según el grupo elegido", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });

    const { wrapper } = await montarVista();

    await elegirGrupo(wrapper, "BEBES");
    expect(wrapper.find("#paciente").attributes("placeholder")).toBe("Lucía");
    expect(wrapper.find("#edad").attributes("placeholder")).toBe("1");
    expect(wrapper.find("#notas").attributes("placeholder")).toContain(
      "Pediatra",
    );

    await elegirGrupo(wrapper, "MAYORES");
    expect(wrapper.find("#paciente").attributes("placeholder")).toBe(
      "Antonio Serrano",
    );
    expect(wrapper.find("#edad").attributes("placeholder")).toBe("81");
    expect(wrapper.find("#notas").attributes("placeholder")).not.toContain(
      "Pediatra",
    );
  });

  test("la edad acepta solo los años del grupo elegido", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });

    const { wrapper } = await montarVista();

    await elegirGrupo(wrapper, "BEBES");
    expect(wrapper.find("#edad").attributes("min")).toBe("0");
    expect(wrapper.find("#edad").attributes("max")).toBe("3");

    await elegirGrupo(wrapper, "MAYORES");
    expect(wrapper.find("#edad").attributes("min")).toBe("65");
  });

  test("las necesidades que salen son las mismas para cualquier grupo de edad", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });

    const { wrapper } = await montarVista();

    await elegirGrupo(wrapper, "BEBES");
    const paraBebes = wrapper.findAll(".solicitar__check").map((c) => c.text());
    await elegirGrupo(wrapper, "MAYORES");
    const paraMayores = wrapper
      .findAll(".solicitar__check")
      .map((c) => c.text());

    expect(paraBebes).toEqual(paraMayores);
    expect(paraBebes).toContain("Cuidados paliativos");
    expect(wrapper.text()).not.toContain("Apoyo escolar");
  });

  test("no envía la solicitud si no se ha elegido el grupo de edad", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });
    const createSpy = vi
      .spyOn(SolicitudRepository.prototype, "create")
      .mockResolvedValue({});

    const { wrapper } = await montarVista();

    await wrapper.findAll(".solicitar__opcion")[1].trigger("click");
    await wrapper.find("#fecha").setValue("2026-10-10");
    await wrapper.find("#direccion").setValue("Calle Uría 10, Oviedo");

    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.text()).toContain(
      "Por favor, rellena todos los campos obligatorios.",
    );
    expect(createSpy).not.toHaveBeenCalled();
  });

  test("no envía la solicitud si la edad no corresponde al grupo elegido", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });
    const createSpy = vi
      .spyOn(SolicitudRepository.prototype, "create")
      .mockResolvedValue({});

    const { wrapper } = await montarVista();

    await wrapper.findAll(".solicitar__opcion")[1].trigger("click");
    await wrapper.find("#fecha").setValue("2026-10-10");
    await wrapper.find("#direccion").setValue("Calle Uría 10, Oviedo");
    await elegirGrupo(wrapper, "BEBES");
    await wrapper.find("#paciente").setValue("Lucía");
    await wrapper.find("#edad").setValue("5");

    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.text()).toContain(
      'Para "Bebés" la edad tiene que estar entre 0 y 3 años.',
    );
    expect(createSpy).not.toHaveBeenCalled();
  });

  test("se puede enviar la solicitud de un bebé de 0 años", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });
    const createSpy = vi
      .spyOn(SolicitudRepository.prototype, "create")
      .mockResolvedValue({ id: 9 });

    const { wrapper } = await montarVista();

    await wrapper.findAll(".solicitar__opcion")[1].trigger("click");
    await wrapper.find("#fecha").setValue("2026-10-10");
    await wrapper.find("#direccion").setValue("Calle Uría 10, Oviedo");
    await elegirGrupo(wrapper, "BEBES");
    await wrapper.find("#paciente").setValue("Lucía");
    await wrapper.find("#edad").setValue("0");

    await wrapper.find("form").trigger("submit.prevent");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({ grupoEdad: "BEBES", edadPaciente: 0 }),
    );
  });
});
