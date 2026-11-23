import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import BuscarView from "../../../views/family/BuscarView.vue";
import PerfilCuidadorView from "../../../views/family/PerfilCuidadorView.vue";
import CuidadorRepository from "../../../repositories/CuidadorRepository";
import VerificacionRepository from "../../../repositories/VerificacionRepository";
import { useAuthStore } from "../../../stores/auth";

// ACOM-240: los servicios y las titulaciones llevan icono y color fijos, y la titulación se destaca
const esperar = () => new Promise((resolve) => setTimeout(resolve, 0));

const CUIDADOR = {
  id: 3,
  usuarioNombre: "Pepe",
  especialidad: "Enfermería",
  anosExperiencia: 4,
  tarifaHora: 15,
  tieneVehiculo: false,
  disponibleAhora: true,
  ciudad: "Oviedo",
  valoracionMedia: null,
  numValoraciones: 0,
  tipoCuidado: "ambos",
  servicios: ["medicacion", "higiene"],
  gruposEdad: [],
  titulaciones: ["ENFERMERIA"],
  otrasTitulaciones: "Curso de geriatría",
  bio: "Bio",
};

async function montarBuscar() {
  vi.spyOn(CuidadorRepository.prototype, "getAll").mockResolvedValue([CUIDADOR]);
  vi.spyOn(VerificacionRepository.prototype, "getPublicas").mockResolvedValue([]);
  const router = createRouter({ history: createWebHistory(), routes: [] });
  const wrapper = mount(BuscarView, { global: { plugins: [router] } });
  await esperar();
  await esperar();
  return wrapper;
}

async function montarPerfil() {
  vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue(CUIDADOR);
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

describe("Etiquetas con icono y color", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("en la búsqueda cada servicio lleva su icono", async () => {
    const wrapper = await montarBuscar();
    const servicios = wrapper.findAll(".buscar__tag--servicio");

    expect(servicios.map((s) => s.attributes("data-icono"))).toEqual(["💊", "🛁"]);
  });

  test("en la búsqueda la titulación va antes que los servicios y está destacada", async () => {
    const wrapper = await montarBuscar();
    const html = wrapper.find(".buscar__card").html();

    expect(html.indexOf("buscar__tag--titulacion")).toBeGreaterThan(-1);
    expect(html.indexOf("buscar__tag--titulacion")).toBeLessThan(html.indexOf("buscar__tag--servicio"));
    expect(wrapper.find(".buscar__tag--titulacion").classes()).toContain("etiqueta--titulacion");
  });

  test("en el perfil la formación sale antes que los servicios", async () => {
    const wrapper = await montarPerfil();
    const html = wrapper.html();

    expect(html.indexOf("perfil__formacion")).toBeGreaterThan(-1);
    expect(html.indexOf("perfil__formacion")).toBeLessThan(html.indexOf("perfil__servicios"));
  });

  test("en el perfil la titulación lleva icono y las otras titulaciones salen como texto", async () => {
    const wrapper = await montarPerfil();
    const formacion = wrapper.findAll(".perfil__formacion .perfil__servicio");

    expect(formacion[0].attributes("data-icono")).toBe("🩺");
    expect(formacion[0].classes()).toContain("etiqueta--titulacion");
    expect(formacion[1].text()).toBe("Curso de geriatría");
    expect(formacion[1].attributes("data-icono")).toBeUndefined();
  });

  test("el mismo servicio tiene el mismo color en la búsqueda y en el perfil", async () => {
    const buscar = await montarBuscar();
    const perfil = await montarPerfil();

    const colorBuscar = buscar.find(".buscar__tag--servicio").element.style.backgroundColor;
    const colorPerfil = perfil.find(".perfil__servicios .perfil__servicio").element.style.backgroundColor;

    expect(colorBuscar).not.toBe("");
    expect(colorBuscar).toBe(colorPerfil);
  });
});
