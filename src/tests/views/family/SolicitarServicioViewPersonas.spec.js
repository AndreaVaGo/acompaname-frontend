import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import SolicitarServicioView from "../../../views/family/SolicitarServicioView.vue";
import CuidadorRepository from "../../../repositories/CuidadorRepository";
import SolicitudRepository from "../../../repositories/SolicitudRepository";
import { useAuthStore } from "../../../stores/auth";

// Tests de la lista de personas a cuidar en el formulario de solicitud (de 1 a 5)

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
  vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
    usuarioNombre: "Pepe",
  });
  const router = crearRouter();
  await router.push("/solicitar/3");
  await router.isReady();

  const pinia = createPinia();
  const wrapper = mount(SolicitarServicioView, {
    global: { plugins: [router, pinia] },
  });
  const authStore = useAuthStore(pinia);
  authStore.login(1, "ana@test.com", "12345678", "FAMILIA");

  await new Promise((resolve) => setTimeout(resolve, 0));
  return { wrapper, router };
}

async function elegirGrupo(wrapper, codigo) {
  await wrapper
    .find(`input[name="grupo-solicitud"][value="${codigo}"]`)
    .setValue(true);
}

// Rellena todo lo que no son las personas
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

describe("SolicitarServicioView · varias personas", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("empieza con una sola persona y sin botón de quitar", async () => {
    const { wrapper } = await montarVista();
    await elegirGrupo(wrapper, "MAYORES");

    expect(wrapper.findAll(".solicitar__persona")).toHaveLength(1);
    expect(wrapper.find(".solicitar__quitar").exists()).toBe(false);
    expect(wrapper.find(".solicitar__anadir").exists()).toBe(true);
    expect(wrapper.text()).toContain("La persona cuidada");
  });

  test("añadir otra persona crea otro par de campos con ids propios", async () => {
    const { wrapper } = await montarVista();
    await elegirGrupo(wrapper, "MAYORES");

    await wrapper.find(".solicitar__anadir").trigger("click");

    expect(wrapper.findAll(".solicitar__persona")).toHaveLength(2);
    expect(wrapper.find("#paciente-2").exists()).toBe(true);
    expect(wrapper.find("#edad-2").exists()).toBe(true);
    expect(wrapper.text()).toContain("Las personas cuidadas");
    expect(wrapper.text()).toContain("Persona 2");
  });

  test("con cinco personas desaparece el botón de añadir", async () => {
    const { wrapper } = await montarVista();
    await elegirGrupo(wrapper, "MAYORES");

    for (let i = 0; i < 4; i++) {
      await wrapper.find(".solicitar__anadir").trigger("click");
    }

    expect(wrapper.findAll(".solicitar__persona")).toHaveLength(5);
    expect(wrapper.find(".solicitar__anadir").exists()).toBe(false);
    expect(wrapper.text()).toContain("hasta 5 personas");
  });

  test("quitar una persona la elimina y deja las demás", async () => {
    const { wrapper } = await montarVista();
    await elegirGrupo(wrapper, "MAYORES");
    await wrapper.find(".solicitar__anadir").trigger("click");
    await wrapper.find("#paciente-2").setValue("Carmen");

    await wrapper.find(".solicitar__quitar").trigger("click");

    expect(wrapper.findAll(".solicitar__persona")).toHaveLength(1);
    expect(wrapper.find("#paciente-2").exists()).toBe(false);
  });

  test("envía la lista con todas las personas y la edad como número", async () => {
    const createSpy = vi
      .spyOn(SolicitudRepository.prototype, "create")
      .mockResolvedValue({ id: 9 });
    const { wrapper } = await montarVista();
    await rellenarDatosComunes(wrapper);
    await elegirGrupo(wrapper, "MAYORES");
    await wrapper.find("#paciente").setValue("Carmen");
    await wrapper.find("#edad").setValue("82");
    await wrapper.find(".solicitar__anadir").trigger("click");
    await wrapper.find("#paciente-2").setValue("  Antonio ");
    await wrapper.find("#edad-2").setValue("85");

    await enviar(wrapper);

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        personas: [
          { nombre: "Carmen", edad: 82, grupoEdad: "MAYORES" },
          { nombre: "Antonio", edad: 85, grupoEdad: "MAYORES" },
        ],
      }),
    );
  });

  test("si falta el nombre de una persona no envía y avisa", async () => {
    const createSpy = vi
      .spyOn(SolicitudRepository.prototype, "create")
      .mockResolvedValue({ id: 9 });
    const { wrapper } = await montarVista();
    await rellenarDatosComunes(wrapper);
    await elegirGrupo(wrapper, "MAYORES");
    await wrapper.find("#paciente").setValue("Carmen");
    await wrapper.find("#edad").setValue("82");
    await wrapper.find(".solicitar__anadir").trigger("click");
    await wrapper.find("#edad-2").setValue("85");

    await enviar(wrapper);

    expect(createSpy).not.toHaveBeenCalled();
    expect(wrapper.find(".solicitar__error").text()).toContain(
      "rellena todos los campos obligatorios",
    );
  });

  test("si falta la edad de una persona no envía y avisa", async () => {
    const createSpy = vi
      .spyOn(SolicitudRepository.prototype, "create")
      .mockResolvedValue({ id: 9 });
    const { wrapper } = await montarVista();
    await rellenarDatosComunes(wrapper);
    await elegirGrupo(wrapper, "MAYORES");
    await wrapper.find("#paciente").setValue("Carmen");
    await wrapper.find("#edad").setValue("82");
    await wrapper.find(".solicitar__anadir").trigger("click");
    await wrapper.find("#paciente-2").setValue("Antonio");

    await enviar(wrapper);

    expect(createSpy).not.toHaveBeenCalled();
    expect(wrapper.find(".solicitar__error").exists()).toBe(true);
  });

  test("la edad de cada persona tiene que encajar con el grupo elegido", async () => {
    const createSpy = vi
      .spyOn(SolicitudRepository.prototype, "create")
      .mockResolvedValue({ id: 9 });
    const { wrapper } = await montarVista();
    await rellenarDatosComunes(wrapper);
    await elegirGrupo(wrapper, "MAYORES");
    await wrapper.find("#paciente").setValue("Carmen");
    await wrapper.find("#edad").setValue("82");
    await wrapper.find(".solicitar__anadir").trigger("click");
    await wrapper.find("#paciente-2").setValue("Lucía");
    await wrapper.find("#edad-2").setValue("30");

    await enviar(wrapper);

    expect(createSpy).not.toHaveBeenCalled();
    expect(wrapper.find(".solicitar__error").text()).toContain("65");
  });

  test("las personas añadidas heredan los límites de edad del grupo", async () => {
    const { wrapper } = await montarVista();
    await elegirGrupo(wrapper, "BEBES");
    await wrapper.find(".solicitar__anadir").trigger("click");

    expect(wrapper.find("#edad-2").attributes("min")).toBe("0");
    expect(wrapper.find("#edad-2").attributes("max")).toBe("3");
  });
});
