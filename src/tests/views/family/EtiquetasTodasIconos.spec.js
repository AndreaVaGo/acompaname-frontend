import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import BuscarView from "../../../views/family/BuscarView.vue";
import PerfilCuidadorView from "../../../views/family/PerfilCuidadorView.vue";
import CuidadorRepository from "../../../repositories/CuidadorRepository";
import VerificacionRepository from "../../../repositories/VerificacionRepository";
import { useAuthStore } from "../../../stores/auth";

// ACOM-240: todas las etiquetas de la tarjeta y del perfil llevan icono
const esperar = () => new Promise((resolve) => setTimeout(resolve, 0));

const CUIDADOR = {
  id: 3,
  usuarioNombre: "Pepe",
  especialidad: "Enfermería",
  anosExperiencia: 4,
  tarifaHora: 15,
  tieneVehiculo: true,
  disponibleAhora: true,
  ciudad: "Oviedo",
  valoracionMedia: null,
  numValoraciones: 0,
  tipoCuidado: "domicilio",
  servicios: [],
  gruposEdad: ["BEBES", "MAYORES"],
  titulaciones: [],
  bio: "Bio",
};

async function montarBuscar(cuidador = CUIDADOR) {
  vi.spyOn(CuidadorRepository.prototype, "getAll").mockResolvedValue([cuidador]);
  vi.spyOn(VerificacionRepository.prototype, "getPublicas").mockResolvedValue([]);
  const router = createRouter({ history: createWebHistory(), routes: [] });
  const wrapper = mount(BuscarView, { global: { plugins: [router] } });
  await esperar();
  await esperar();
  return wrapper;
}

async function montarPerfil(cuidador = CUIDADOR) {
  vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue(cuidador);
  vi.spyOn(VerificacionRepository.prototype, "getPublicas").mockResolvedValue([]);
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

describe("Todas las etiquetas con icono", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("en la búsqueda la modalidad, disponible y vehículo llevan icono", async () => {
    const wrapper = await montarBuscar();

    expect(wrapper.find(".buscar__tag--tipo").attributes("data-icono")).toBe("🏠");
    expect(wrapper.find(".buscar__tag--disponible").attributes("data-icono")).toBe("🟢");
    expect(wrapper.find(".buscar__tag--vehiculo").attributes("data-icono")).toBe("🚗");
  });

  test("en la búsqueda los grupos de edad llevan su icono", async () => {
    const wrapper = await montarBuscar();
    const iconos = wrapper.findAll(".buscar__tag--grupo").map((e) => e.attributes("data-icono"));

    expect(iconos).toEqual(["👶", "🧓"]);
  });

  test("sin tipo indicado la tarjeta enseña hospital y domicilio con sus dos iconos", async () => {
    const wrapper = await montarBuscar({ ...CUIDADOR, tipoCuidado: undefined });

    expect(wrapper.find(".buscar__tag--tipo").text()).toBe("Hospital y domicilio");
    expect(wrapper.find(".buscar__tag--tipo").attributes("data-icono")).toBe("🏥🏠");
  });

  test("en el perfil salen la modalidad y el vehículo con sus iconos", async () => {
    const wrapper = await montarPerfil();
    const etiquetas = wrapper.findAll('[data-testid="perfil-etiquetas"] .etiqueta');

    expect(etiquetas.map((e) => e.text())).toEqual(["A domicilio", "Vehículo propio"]);
    expect(etiquetas.map((e) => e.attributes("data-icono"))).toEqual(["🏠", "🚗"]);
  });

  test("en el perfil sin vehículo solo sale la modalidad", async () => {
    const wrapper = await montarPerfil({ ...CUIDADOR, tieneVehiculo: false });

    expect(wrapper.findAll('[data-testid="perfil-etiquetas"] .etiqueta')).toHaveLength(1);
  });

  test("en el perfil sale 'Atiende a' con los grupos de edad y sus iconos", async () => {
    const wrapper = await montarPerfil();
    const grupos = wrapper.findAll(".perfil__atiende .etiqueta");

    expect(wrapper.find(".perfil__atiende h2").text()).toBe("Atiende a");
    expect(grupos.map((g) => g.text())).toEqual(["Bebés", "Personas mayores"]);
    expect(grupos.map((g) => g.attributes("data-icono"))).toEqual(["👶", "🧓"]);
  });

  test("en el perfil sin grupos de edad no sale 'Atiende a'", async () => {
    const wrapper = await montarPerfil({ ...CUIDADOR, gruposEdad: [] });

    expect(wrapper.find(".perfil__atiende").exists()).toBe(false);
  });
});
