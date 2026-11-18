import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import SolicitarServicioView from "../../../views/family/SolicitarServicioView.vue";
import CuidadorRepository from "../../../repositories/CuidadorRepository";
import SolicitudRepository from "../../../repositories/SolicitudRepository";
import { useAuthStore } from "../../../stores/auth";

// Tests del grupo de edad de cada persona (por ejemplo, tres niños y un abuelo)

async function montarVista() {
  vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
    usuarioNombre: "Pepe",
  });
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/solicitar/:id", name: "solicitar", component: SolicitarServicioView },
      { path: "/confirmacion", name: "confirmacion", component: { template: "<div>ok</div>" } },
    ],
  });
  await router.push("/solicitar/3");
  await router.isReady();

  const pinia = createPinia();
  const wrapper = mount(SolicitarServicioView, {
    global: { plugins: [router, pinia] },
  });
  useAuthStore(pinia).login(1, "ana@test.com", "12345678", "FAMILIA");

  await new Promise((resolve) => setTimeout(resolve, 0));
  return wrapper;
}

async function elegirGrupo(wrapper, codigo) {
  await wrapper
    .find(`input[name="grupo-solicitud"][value="${codigo}"]`)
    .setValue(true);
}

async function rellenarDatosComunes(wrapper) {
  await wrapper.findAll(".solicitar__opcion")[1].trigger("click");
  await wrapper.find("#direccion").setValue("Calle Uría 10, Oviedo");
  await wrapper.find("#fecha").setValue("2026-10-10");
  await wrapper.find("#hora-inicio").setValue("09:00");
  await wrapper.find("#hora-fin").setValue("12:00");
}

async function enviar(wrapper) {
  await wrapper.find("form").trigger("submit.prevent");
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("SolicitarServicioView · grupo de edad por persona", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("con una sola persona no hay selector de grupo propio", async () => {
    const wrapper = await montarVista();
    await elegirGrupo(wrapper, "NINOS");

    expect(wrapper.find("#grupo-1").exists()).toBe(false);
    expect(wrapper.find("#grupo-2").exists()).toBe(false);
  });

  test("con varias personas la primera también tiene su selector, con el grupo de arriba", async () => {
    const wrapper = await montarVista();
    await elegirGrupo(wrapper, "NINOS");

    await wrapper.find(".solicitar__anadir").trigger("click");

    expect(wrapper.find("#grupo-1").exists()).toBe(true);
    expect(wrapper.find("#grupo-1").element.value).toBe("NINOS");
  });

  test("cambiar el grupo de la primera persona cambia el selector de arriba y sus límites", async () => {
    const wrapper = await montarVista();
    await elegirGrupo(wrapper, "NINOS");
    await wrapper.find(".solicitar__anadir").trigger("click");

    await wrapper.find("#grupo-1").setValue("MAYORES");

    expect(
      wrapper.find('input[name="grupo-solicitud"][value="MAYORES"]').element.checked,
    ).toBe(true);
    expect(wrapper.find("#edad").attributes("min")).toBe("65");
    expect(wrapper.find("#edad-2").attributes("min")).toBe("4");
  });

  test("la persona añadida tiene su selector, con el mismo grupo que la primera", async () => {
    const wrapper = await montarVista();
    await elegirGrupo(wrapper, "NINOS");

    await wrapper.find(".solicitar__anadir").trigger("click");

    expect(wrapper.find("#grupo-2").exists()).toBe(true);
    expect(wrapper.find("#grupo-2").element.value).toBe("NINOS");
  });

  test("al cambiar el grupo de una persona cambian sus límites de edad", async () => {
    const wrapper = await montarVista();
    await elegirGrupo(wrapper, "NINOS");
    await wrapper.find(".solicitar__anadir").trigger("click");

    await wrapper.find("#grupo-2").setValue("MAYORES");

    expect(wrapper.find("#edad-2").attributes("min")).toBe("65");
    expect(wrapper.find("#edad").attributes("min")).toBe("4");
    expect(wrapper.find("#edad").attributes("max")).toBe("12");
  });

  test("envía tres niños y un abuelo, cada uno con su grupo", async () => {
    const createSpy = vi
      .spyOn(SolicitudRepository.prototype, "create")
      .mockResolvedValue({ id: 9 });
    const wrapper = await montarVista();
    await rellenarDatosComunes(wrapper);
    await elegirGrupo(wrapper, "NINOS");
    await wrapper.find("#paciente").setValue("Zoe");
    await wrapper.find("#edad").setValue("5");
    await wrapper.find(".solicitar__anadir").trigger("click");
    await wrapper.find("#paciente-2").setValue("Ada");
    await wrapper.find("#edad-2").setValue("9");
    await wrapper.find(".solicitar__anadir").trigger("click");
    await wrapper.find("#paciente-3").setValue("Leo");
    await wrapper.find("#edad-3").setValue("11");
    await wrapper.find(".solicitar__anadir").trigger("click");
    await wrapper.find("#paciente-4").setValue("Abuelo");
    await wrapper.find("#grupo-4").setValue("MAYORES");
    await wrapper.find("#edad-4").setValue("80");

    await enviar(wrapper);

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        grupoEdad: "NINOS",
        personas: [
          { nombre: "Zoe", edad: 5, grupoEdad: "NINOS" },
          { nombre: "Ada", edad: 9, grupoEdad: "NINOS" },
          { nombre: "Leo", edad: 11, grupoEdad: "NINOS" },
          { nombre: "Abuelo", edad: 80, grupoEdad: "MAYORES" },
        ],
      }),
    );
  });

  test("la edad de cada persona se comprueba con SU grupo y el error dice cuál es", async () => {
    const createSpy = vi
      .spyOn(SolicitudRepository.prototype, "create")
      .mockResolvedValue({ id: 9 });
    const wrapper = await montarVista();
    await rellenarDatosComunes(wrapper);
    await elegirGrupo(wrapper, "NINOS");
    await wrapper.find("#paciente").setValue("Zoe");
    await wrapper.find("#edad").setValue("5");
    await wrapper.find(".solicitar__anadir").trigger("click");
    await wrapper.find("#paciente-2").setValue("Abuelo");
    await wrapper.find("#grupo-2").setValue("MAYORES");
    await wrapper.find("#edad-2").setValue("40");

    await enviar(wrapper);

    expect(createSpy).not.toHaveBeenCalled();
    const texto = wrapper.find(".solicitar__error").text();
    expect(texto).toContain("Persona 2");
    expect(texto).toContain("Personas mayores");
    expect(texto).toContain("65");
  });

  test("una edad que encaja con el grupo de la primera pero no con el de la segunda no se envía", async () => {
    const createSpy = vi
      .spyOn(SolicitudRepository.prototype, "create")
      .mockResolvedValue({ id: 9 });
    const wrapper = await montarVista();
    await rellenarDatosComunes(wrapper);
    await elegirGrupo(wrapper, "MAYORES");
    await wrapper.find("#paciente").setValue("Carmen");
    await wrapper.find("#edad").setValue("82");
    await wrapper.find(".solicitar__anadir").trigger("click");
    await wrapper.find("#paciente-2").setValue("Mateo");
    await wrapper.find("#grupo-2").setValue("NINOS");
    await wrapper.find("#edad-2").setValue("82");

    await enviar(wrapper);

    expect(createSpy).not.toHaveBeenCalled();
    expect(wrapper.find(".solicitar__error").text()).toContain("Niñas y niños");
  });

  test("si una persona añadida se queda sin grupo no se envía", async () => {
    const createSpy = vi
      .spyOn(SolicitudRepository.prototype, "create")
      .mockResolvedValue({ id: 9 });
    const wrapper = await montarVista();
    await rellenarDatosComunes(wrapper);
    await elegirGrupo(wrapper, "MAYORES");
    await wrapper.find("#paciente").setValue("Carmen");
    await wrapper.find("#edad").setValue("82");
    await wrapper.find(".solicitar__anadir").trigger("click");
    await wrapper.find("#paciente-2").setValue("Antonio");
    await wrapper.find("#edad-2").setValue("85");
    await wrapper.find("#grupo-2").setValue("");

    await enviar(wrapper);

    expect(createSpy).not.toHaveBeenCalled();
    expect(wrapper.find(".solicitar__error").text()).toContain(
      "rellena todos los campos obligatorios",
    );
  });

  test("explica que cada persona añadida tiene su propio grupo", async () => {
    const wrapper = await montarVista();
    await elegirGrupo(wrapper, "NINOS");

    await wrapper.find(".solicitar__anadir").trigger("click");

    expect(wrapper.text()).toContain("tres niños y un abuelo");
  });
});
