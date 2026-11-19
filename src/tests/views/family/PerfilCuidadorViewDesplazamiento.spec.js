import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import PerfilCuidadorView from "../../../views/family/PerfilCuidadorView.vue";
import CuidadorRepository from "../../../repositories/CuidadorRepository";
import { useAuthStore } from "../../../stores/auth";

// ACOM-232: la ficha deja claro que la tarifa incluye el desplazamiento
async function montarVista() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/cuidador/:id", name: "perfil-cuidador", component: PerfilCuidadorView },
    ],
  });
  await router.push("/cuidador/3");
  await router.isReady();

  const pinia = createPinia();
  const wrapper = mount(PerfilCuidadorView, {
    global: { plugins: [router, pinia] },
  });
  useAuthStore(pinia).login(1, "ana@test.com", "12345678", "FAMILIA");

  await new Promise((resolve) => setTimeout(resolve, 0));
  return wrapper;
}

describe("PerfilCuidadorView · desplazamiento incluido", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("avisa de que la tarifa incluye el desplazamiento", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      bio: "Cuidador con experiencia",
    });

    const wrapper = await montarVista();

    expect(wrapper.find('[data-testid="desplazamiento-incluido"]').text()).toContain(
      "La tarifa incluye el desplazamiento",
    );
  });

  test("el aviso sale junto al precio, en la columna lateral", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getById").mockResolvedValue({
      usuarioNombre: "Pepe",
      especialidad: "Geriatría",
      anosExperiencia: 4,
      tarifaHora: 18,
      disponibleAhora: true,
      bio: "Cuidador con experiencia",
    });

    const wrapper = await montarVista();

    const aviso = wrapper.find('.perfil__sidebar [data-testid="desplazamiento-incluido"]');
    expect(aviso.exists()).toBe(true);
  });
});
