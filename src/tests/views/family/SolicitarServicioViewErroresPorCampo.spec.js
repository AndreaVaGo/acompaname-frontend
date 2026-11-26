import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
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
    attachTo: document.body,
    global: { plugins: [router, pinia] },
  });
  useAuthStore(pinia).login(1, "ana@test.com", "12345678", "FAMILIA");

  await new Promise((resolve) => setTimeout(resolve, 0));
  return wrapper;
}

async function enviar(wrapper) {
  await wrapper.find("form").trigger("submit.prevent");
  await new Promise((resolve) => setTimeout(resolve, 0));
}

async function rellenarTodoMenosLaFecha(wrapper) {
  await wrapper.findAll(".solicitar__opcion")[1].trigger("click");
  await wrapper.find("#hora-inicio").setValue("09:00");
  await wrapper.find("#hora-fin").setValue("12:00");
  await wrapper.find("#direccion").setValue("Calle Uría 10, Oviedo");
  await wrapper
    .find('input[name="grupo-solicitud"][value="MAYORES"]')
    .setValue(true);
  await wrapper.find("#paciente").setValue("Antonio Serrano");
  await wrapper.find("#edad").setValue("81");
}

describe("SolicitarServicioView · errores por campo", () => {
  let wrapper;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 0, 1, 10, 0));
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
    });
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("si no se rellena nada, cada campo vacío muestra su propio mensaje", async () => {
    wrapper = await montarVista();
    await enviar(wrapper);

    expect(wrapper.find(".solicitar__error").text()).toBe(
      "Revisa los campos marcados en rojo.",
    );
    expect(wrapper.find("#error-grupoEdad").text()).toBe(
      "Elige quién necesita cuidados.",
    );
    expect(wrapper.find("#error-tipoCuidado").exists()).toBe(true);
    expect(wrapper.find("#error-fechaInicio").exists()).toBe(true);
    expect(wrapper.find("#error-horaInicio").exists()).toBe(true);
    expect(wrapper.find("#error-horaFin").exists()).toBe(true);
  });

  test("el campo con error queda marcado y unido a su mensaje", async () => {
    wrapper = await montarVista();
    await rellenarTodoMenosLaFecha(wrapper);
    await enviar(wrapper);

    const fecha = wrapper.find("#fecha");
    expect(fecha.attributes("aria-invalid")).toBe("true");
    expect(fecha.attributes("aria-describedby")).toBe("error-fechaInicio");
    expect(wrapper.find("#error-fechaInicio").text()).toBe(
      "Elige la fecha de inicio.",
    );
    // Los campos correctos no se marcan
    expect(wrapper.find("#direccion").attributes("aria-invalid")).toBe(
      undefined,
    );
  });

  test("el cursor va al primer campo con error", async () => {
    wrapper = await montarVista();
    await rellenarTodoMenosLaFecha(wrapper);
    await enviar(wrapper);

    expect(document.activeElement.id).toBe("fecha");
  });

  test("la fecha de inicio no deja elegir días anteriores a hoy", async () => {
    wrapper = await montarVista();
    expect(wrapper.find("#fecha").attributes("min")).toBe("2026-01-01");
  });

  test("una fecha de inicio pasada no se envía y se explica", async () => {
    const createSpy = vi.spyOn(SolicitudRepository.prototype, "create");
    wrapper = await montarVista();
    await rellenarTodoMenosLaFecha(wrapper);
    await wrapper.find("#fecha").setValue("2025-12-31");
    await enviar(wrapper);

    expect(createSpy).not.toHaveBeenCalled();
    expect(wrapper.find("#error-fechaInicio").text()).toBe(
      "La fecha de inicio no puede estar en el pasado.",
    );
  });

  test("el error de una persona se muestra bajo su campo", async () => {
    wrapper = await montarVista();
    await rellenarTodoMenosLaFecha(wrapper);
    await wrapper.find("#fecha").setValue("2026-02-01");
    await wrapper.find("#paciente").setValue("");
    await enviar(wrapper);

    expect(wrapper.find('[id="error-personas.0.nombre"]').text()).toBe(
      "Escribe el nombre de la persona.",
    );
    expect(wrapper.find("#paciente").attributes("aria-invalid")).toBe("true");
  });

  test("cuando el servidor devuelve errores por campo, se marcan en pantalla", async () => {
    const error = new Error("Error en la petición POST");
    error.status = 400;
    error.detalle = JSON.stringify({ notas: "Texto demasiado largo" });
    vi.spyOn(SolicitudRepository.prototype, "create").mockRejectedValue(error);
    wrapper = await montarVista();
    await rellenarTodoMenosLaFecha(wrapper);
    await wrapper.find("#fecha").setValue("2026-02-01");
    await enviar(wrapper);

    expect(wrapper.find("#error-notas").text()).toBe("Texto demasiado largo");
    expect(wrapper.find("#notas").attributes("aria-invalid")).toBe("true");
    expect(wrapper.find(".solicitar__error").text()).toBe(
      "Revisa los campos marcados en rojo.",
    );
  });

  test("un 400 sin detalle por campo muestra el aviso general de siempre", async () => {
    const error = new Error("Error en la petición POST");
    error.status = 400;
    error.detalle = "";
    vi.spyOn(SolicitudRepository.prototype, "create").mockRejectedValue(error);
    wrapper = await montarVista();
    await rellenarTodoMenosLaFecha(wrapper);
    await wrapper.find("#fecha").setValue("2026-02-01");
    await enviar(wrapper);

    expect(wrapper.find(".solicitar__error").text()).toContain(
      "Los datos enviados no son correctos.",
    );
    expect(wrapper.find(".campo-error").exists()).toBe(false);
  });
});
