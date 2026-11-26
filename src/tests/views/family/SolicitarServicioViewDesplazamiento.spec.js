import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import SolicitarServicioView from "../../../views/family/SolicitarServicioView.vue";
import CuidadorRepository from "../../../repositories/CuidadorRepository";
import { useAuthStore } from "../../../stores/auth";

// ACOM-232: junto al precio estimado se dice que el desplazamiento está incluido
async function montarVista() {
  vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
    usuarioNombre: "Pepe",
    tarifaHora: 15,
  });

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
  useAuthStore(pinia).login(1, "ana@test.com", "12345678", "FAMILIA");

  await new Promise((resolve) => setTimeout(resolve, 0));
  return wrapper;
}

describe("SolicitarServicioView · desplazamiento incluido", () => {
  // Fecha fija: la vista no deja elegir fechas pasadas, así que los tests no pueden depender del día real
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 0, 1, 10, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("no se muestra mientras no hay precio estimado", async () => {
    const wrapper = await montarVista();

    expect(wrapper.find('[data-testid="desplazamiento-incluido"]').exists()).toBe(false);
  });

  test("con el precio estimado avisa de que el desplazamiento está incluido", async () => {
    const wrapper = await montarVista();

    await wrapper
      .find('input[name="grupo-solicitud"][value]')
      .setValue(true);
    await wrapper.find("#fecha").setValue("2026-12-15");
    await wrapper.find("#hora-inicio").setValue("10:00");
    await wrapper.find("#hora-fin").setValue("14:00");

    const aviso = wrapper.find('[data-testid="desplazamiento-incluido"]');
    expect(aviso.exists()).toBe(true);
    expect(aviso.text()).toContain("incluye el desplazamiento");
  });
});
