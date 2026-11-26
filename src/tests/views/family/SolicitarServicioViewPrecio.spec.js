import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import SolicitarServicioView from "../../../views/family/SolicitarServicioView.vue";
import CuidadorRepository from "../../../repositories/CuidadorRepository";
import { useAuthStore } from "../../../stores/auth";

// Precio estimado del formulario: horas x tarifa, con recargo por cada persona extra
async function montarVista(cuidador = { usuarioNombre: "Pepe", tarifaHora: 15 }) {
  vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue(cuidador);

  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/solicitar/:id", name: "solicitar", component: SolicitarServicioView },
    ],
  });
  await router.push("/solicitar/3");
  await router.isReady();

  const pinia = createPinia();
  const wrapper = mount(SolicitarServicioView, {
    global: { plugins: [router, pinia] },
  });
  const authStore = useAuthStore(pinia);
  authStore.login(1, "ana@test.com", "12345678", "FAMILIA");

  await new Promise((resolve) => setTimeout(resolve, 0));
  return wrapper;
}

async function elegirGrupo(wrapper, codigo) {
  await wrapper
    .find(`input[name="grupo-solicitud"][value="${codigo}"]`)
    .setValue(true);
}

async function rellenarFechasYHoras(wrapper, inicio = "10:00", fin = "14:00") {
  await wrapper.find("#fecha").setValue("2026-12-15");
  await wrapper.find("#hora-inicio").setValue(inicio);
  await wrapper.find("#hora-fin").setValue(fin);
}

describe("SolicitarServicioView · precio estimado", () => {
  // Fecha fija: la vista no deja elegir fechas pasadas, así que los tests no pueden depender del día real
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 0, 1, 10, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("no se muestra mientras faltan las fechas y las horas", async () => {
    const wrapper = await montarVista();

    expect(wrapper.find('[data-testid="precio-estimado"]').exists()).toBe(false);
  });

  test("con las horas puestas muestra horas por tarifa y el total", async () => {
    const wrapper = await montarVista();

    await rellenarFechasYHoras(wrapper);

    const texto = wrapper.find('[data-testid="precio-estimado"]').text();
    expect(texto).toContain("4 horas");
    expect(texto).toContain("15,00 €/hora");
    expect(texto).toContain("Total estimado: 60,00 €");
  });

  test("con una sola persona no aparece la línea de personas extra", async () => {
    const wrapper = await montarVista();

    await rellenarFechasYHoras(wrapper);

    expect(wrapper.find('[data-testid="precio-estimado"]').text()).not.toContain(
      "persona extra",
    );
  });

  test("una hora se escribe en singular", async () => {
    const wrapper = await montarVista();

    await rellenarFechasYHoras(wrapper, "10:00", "11:00");

    const texto = wrapper.find('[data-testid="precio-estimado"]').text();
    expect(texto).toContain("1 hora ");
    expect(texto).toContain("Total estimado: 15,00 €");
  });

  test("al añadir otra persona suma el recargo del 25 %", async () => {
    const wrapper = await montarVista();
    await elegirGrupo(wrapper, "MAYORES");
    await rellenarFechasYHoras(wrapper);

    await wrapper.find(".solicitar__anadir").trigger("click");

    const texto = wrapper.find('[data-testid="precio-estimado"]').text();
    expect(texto).toContain("1 persona extra (25 % cada una)");
    expect(texto).toContain("Total estimado: 75,00 €");
  });

  test("con tres personas suma dos recargos", async () => {
    const wrapper = await montarVista();
    await elegirGrupo(wrapper, "MAYORES");
    await rellenarFechasYHoras(wrapper);

    await wrapper.find(".solicitar__anadir").trigger("click");
    await wrapper.find(".solicitar__anadir").trigger("click");

    const texto = wrapper.find('[data-testid="precio-estimado"]').text();
    expect(texto).toContain("2 personas extra");
    expect(texto).toContain("Total estimado: 90,00 €");
  });

  test("si la hora de fin es anterior a la de inicio no se muestra", async () => {
    const wrapper = await montarVista();

    await rellenarFechasYHoras(wrapper, "14:00", "10:00");

    expect(wrapper.find('[data-testid="precio-estimado"]').exists()).toBe(false);
  });

  test("con varios días cuenta desde la hora de inicio hasta la de fin", async () => {
    const wrapper = await montarVista();

    await wrapper.find("#fecha").setValue("2026-12-15");
    await wrapper.find("#fecha-fin").setValue("2026-12-16");
    await wrapper.find("#hora-inicio").setValue("20:00");
    await wrapper.find("#hora-fin").setValue("08:00");

    const texto = wrapper.find('[data-testid="precio-estimado"]').text();
    expect(texto).toContain("12 horas");
    expect(texto).toContain("Total estimado: 180,00 €");
  });

  test("si la persona cuidadora no tiene tarifa no se muestra el precio", async () => {
    const wrapper = await montarVista({ usuarioNombre: "Pepe" });

    await rellenarFechasYHoras(wrapper);

    expect(wrapper.find('[data-testid="precio-estimado"]').exists()).toBe(false);
  });

  test("avisa de que es una estimación", async () => {
    const wrapper = await montarVista();

    await rellenarFechasYHoras(wrapper);

    expect(wrapper.find('[data-testid="precio-estimado"]').text()).toContain(
      "Es una estimación",
    );
  });

  test("usa el recargo propio de la persona cuidadora", async () => {
    const wrapper = await montarVista({
      usuarioNombre: "Pepe",
      tarifaHora: 15,
      recargoPersonaExtra: 50,
    });
    await elegirGrupo(wrapper, "MAYORES");
    await rellenarFechasYHoras(wrapper);

    await wrapper.find(".solicitar__anadir").trigger("click");

    const texto = wrapper.find('[data-testid="precio-estimado"]').text();
    expect(texto).toContain("1 persona extra (50 % cada una)");
    // 4 x 15 x 1,5 = 90
    expect(texto).toContain("Total estimado: 90,00 €");
  });
});
