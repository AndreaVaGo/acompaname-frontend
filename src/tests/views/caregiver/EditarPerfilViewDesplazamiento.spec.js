import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import EditarPerfilView from "../../../views/caregiver/EditarPerfilView.vue";
import CuidadorRepository from "../../../repositories/CuidadorRepository";

// ACOM-232: el cuidador sabe que su tarifa incluye el desplazamiento
const perfil = {
  id: 3,
  especialidad: "Geriatría",
  anosExperiencia: 4,
  tarifaHora: 18,
  bio: "Cuido personas mayores desde hace años",
  tieneVehiculo: true,
  disponibleAhora: false,
  usuarioId: 8,
  usuarioNombre: "Pepe",
};

describe("EditarPerfilView · desplazamiento incluido", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("explica que la tarifa incluye el desplazamiento", async () => {
    vi.spyOn(CuidadorRepository.prototype, "getMiPerfil").mockResolvedValue(perfil);

    const wrapper = mount(EditarPerfilView);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const ayuda = wrapper.find('[data-testid="ayuda-desplazamiento"]');
    expect(ayuda.exists()).toBe(true);
    expect(ayuda.text()).toContain("incluye tu desplazamiento");
    expect(ayuda.text()).toContain("no se cobra aparte");
  });
});
