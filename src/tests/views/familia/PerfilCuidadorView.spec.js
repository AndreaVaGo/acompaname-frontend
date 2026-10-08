import { describe, test, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import PerfilCuidadorView from "../../../views/familia/PerfilCuidadorView.vue";
import CuidadorRepository from "../../../repositories/CuidadorRepository";
import { useAuthStore } from "../../../stores/auth";

function crearRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/cuidador/:id", name: "perfil-cuidador", component: PerfilCuidadorView },
    ],
  });
}

async function montarVista(rol) {
  const router = crearRouter();
  await router.push("/cuidador/3");
  await router.isReady();

  const pinia = createPinia();
  const wrapper = mount(PerfilCuidadorView, {
    global: {
      plugins: [router, pinia],
    },
  });

  const authStore = useAuthStore(pinia);
  if (rol) {
    authStore.login(1, "ana@test.com", "12345678", rol);
  }

  await new Promise((resolve) => setTimeout(resolve, 0));

  return wrapper;
}

describe("PerfilCuidadorView", () => {
  test("muestra los datos del cuidador", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      bio: "Cuidador con experiencia",
    });

    const wrapper = await montarVista("FAMILIA");

    expect(wrapper.text()).toContain("Pepe");
    expect(wrapper.text()).toContain("Geriatría");
  });

  test("muestra un mensaje de error si falla la carga", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockRejectedValue(
      new Error("fallo")
    );

    const wrapper = await montarVista("FAMILIA");

    expect(wrapper.text()).toContain(
      "No se pudo cargar el perfil del cuidador."
    );
  });

  test("muestra el botón de solicitar si el usuario es FAMILIA", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      bio: "Cuidador con experiencia",
    });

    const wrapper = await montarVista("FAMILIA");

    expect(wrapper.find(".perfil__solicitar").exists()).toBe(true);
  });

  test("no muestra el botón de solicitar si el usuario es CUIDADOR", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      bio: "Cuidador con experiencia",
    });

    const wrapper = await montarVista("CUIDADOR");

    expect(wrapper.find(".perfil__solicitar").exists()).toBe(false);
  });

  test("un visitante sin sesión ve el enlace para iniciar sesión", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      bio: "Cuidador con experiencia",
    });

    const wrapper = await montarVista(null);

    expect(wrapper.text()).toContain("Inicia sesión para solicitar");
    expect(wrapper.text()).not.toContain("Solicitar servicio");
  });
});