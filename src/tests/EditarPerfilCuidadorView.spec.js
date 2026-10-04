import { describe, test, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import EditarPerfilCuidadorView from "../views/EditarPerfilCuidadorView.vue";
import CuidadorRepository from "../repositories/CuidadorRepository";
import { useAuthStore } from "../stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [],
});

async function montarVista() {
  const pinia = createPinia();
  const wrapper = mount(EditarPerfilCuidadorView, {
    global: {
      plugins: [router, pinia],
    },
  });

  const authStore = useAuthStore(pinia);
  authStore.login(2, "pepe@test.com", "12345678", "CUIDADOR");

  await new Promise((resolve) => setTimeout(resolve, 0));

  return wrapper;
}

describe("EditarPerfilCuidadorView", () => {
  test("carga y muestra los datos del perfil", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue({
      id: 5,
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      tieneVehiculo: true,
      bio: "Cuidadora con experiencia",
    });

    const wrapper = await montarVista();

    expect(wrapper.find("#especialidad").element.value).toBe("Geriatría");
    expect(wrapper.find("#bio").element.value).toBe(
      "Cuidadora con experiencia"
    );
  });

  test("muestra error si falla la carga del perfil", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockRejectedValue(
      new Error("fallo")
    );

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("No se pudo cargar tu perfil.");
  });

  test("no guarda si faltan campos obligatorios", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue({
      id: 5,
      especialidad: "",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      tieneVehiculo: true,
      bio: "",
    });
    const updateSpy = vi
      .spyOn(CuidadorRepository.prototype, "update")
      .mockResolvedValue({});

    const wrapper = await montarVista();

    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.text()).toContain(
      "Por favor, rellena todos los campos obligatorios."
    );
    expect(updateSpy).not.toHaveBeenCalled();
  });

  test("guarda los cambios correctamente", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue({
      id: 5,
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      tieneVehiculo: true,
      bio: "Cuidadora con experiencia",
    });
    const updateSpy = vi
      .spyOn(CuidadorRepository.prototype, "update")
      .mockResolvedValue({});

    const wrapper = await montarVista();

    await wrapper.find("#especialidad").setValue("Geriatría avanzada");
    await wrapper.find("form").trigger("submit.prevent");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(updateSpy).toHaveBeenCalledWith(5, {
      especialidad: "Geriatría avanzada",
      anosExperiencia: 4,
      tarifaHora: 18,
      bio: "Cuidadora con experiencia",
      tieneVehiculo: true,
      disponibleAhora: true,
      usuarioId: 2,
    });
    expect(wrapper.text()).toContain("Cambios guardados ✓");
  });

  test("muestra error si falla el guardado", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue({
      id: 5,
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      tieneVehiculo: true,
      bio: "Cuidadora con experiencia",
    });
    vi.spyOn(CuidadorRepository.prototype, "update").mockRejectedValue(
      new Error("fallo")
    );

    const wrapper = await montarVista();

    await wrapper.find("form").trigger("submit.prevent");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("No se pudieron guardar los cambios.");
  });
});