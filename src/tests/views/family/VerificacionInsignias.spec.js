import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import BuscarView from "../../../views/family/BuscarView.vue";
import PerfilCuidadorView from "../../../views/family/PerfilCuidadorView.vue";
import CuidadorRepository from "../../../repositories/CuidadorRepository";
import VerificacionRepository from "../../../repositories/VerificacionRepository";
import { useAuthStore } from "../../../stores/auth";

// ACOM-237: las familias ven la insignia "verificado" en la búsqueda y en el perfil
function cuidador(id, nombre) {
  return {
    id,
    usuarioNombre: nombre,
    especialidad: "Geriatría",
    anosExperiencia: 4,
    tarifaHora: 15,
    tieneVehiculo: false,
    disponibleAhora: true,
    ciudad: "Oviedo",
    valoracionMedia: null,
    numValoraciones: 0,
    tipoCuidado: "ambos",
    servicios: [],
    gruposEdad: [],
    titulaciones: [],
    bio: "Bio",
  };
}

const esperar = () => new Promise((resolve) => setTimeout(resolve, 0));

async function montarBuscar() {
  vi.spyOn(CuidadorRepository.prototype, "getAll").mockResolvedValue([
    cuidador(1, "Pepe"),
    cuidador(2, "Ana"),
  ]);
  const router = createRouter({ history: createWebHistory(), routes: [] });
  const wrapper = mount(BuscarView, { global: { plugins: [router] } });
  await esperar();
  await esperar();
  return wrapper;
}

async function montarPerfil() {
  vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue(cuidador(3, "Pepe"));
  const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: "/cuidador/:id", name: "perfil-cuidador", component: PerfilCuidadorView }],
  });
  await router.push("/cuidador/3");
  await router.isReady();
  const pinia = createPinia();
  const wrapper = mount(PerfilCuidadorView, { global: { plugins: [router, pinia] } });
  useAuthStore(pinia).login(1, "ana@test.com", "12345678", "FAMILIA");
  await esperar();
  await esperar();
  return wrapper;
}

describe("Insignias de verificado", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("en la búsqueda solo sale en quien tiene algo verificado", async () => {
    vi.spyOn(VerificacionRepository.prototype, "getPublicas").mockResolvedValue([
      { cuidadorId: 1, titulacionVerificada: true, antecedentesVerificados: false },
    ]);

    const wrapper = await montarBuscar();
    const tarjetas = wrapper.findAll(".buscar__card");

    expect(tarjetas[0].find('[data-testid="insignia-titulacion"]').exists()).toBe(true);
    expect(tarjetas[0].find('[data-testid="insignia-antecedentes"]').exists()).toBe(false);
    expect(tarjetas[1].find(".insignias").exists()).toBe(false);
  });

  test("si no se pueden pedir las insignias, la búsqueda sigue funcionando", async () => {
    vi.spyOn(VerificacionRepository.prototype, "getPublicas").mockRejectedValue(new Error("fallo"));

    const wrapper = await montarBuscar();

    expect(wrapper.findAll(".buscar__card")).toHaveLength(2);
    expect(wrapper.find(".insignias").exists()).toBe(false);
  });

  test("en el perfil salen las dos insignias si las tiene", async () => {
    vi.spyOn(VerificacionRepository.prototype, "getPublicas").mockResolvedValue([
      { cuidadorId: 3, titulacionVerificada: true, antecedentesVerificados: true },
    ]);

    const wrapper = await montarPerfil();

    expect(wrapper.find('[data-testid="insignia-titulacion"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="insignia-antecedentes"]').exists()).toBe(true);
  });

  test("en el perfil no sale nada si no tiene nada verificado", async () => {
    vi.spyOn(VerificacionRepository.prototype, "getPublicas").mockResolvedValue([
      { cuidadorId: 99, titulacionVerificada: true, antecedentesVerificados: true },
    ]);

    const wrapper = await montarPerfil();

    expect(wrapper.find(".insignias").exists()).toBe(false);
  });

  test("si no se pueden pedir las insignias, el perfil se ve igual", async () => {
    vi.spyOn(VerificacionRepository.prototype, "getPublicas").mockRejectedValue(new Error("fallo"));

    const wrapper = await montarPerfil();

    expect(wrapper.find("h1").text()).toBe("Pepe");
    expect(wrapper.find(".insignias").exists()).toBe(false);
  });
});
