import { describe, test, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import MiPerfilView from "../../../views/common/MiPerfilView.vue";
import UsuarioRepository from "../../../repositories/UsuarioRepository";
import { useAuthStore } from "../../../stores/auth";

vi.spyOn(UsuarioRepository.prototype, "getById").mockResolvedValue({
  id: 1,
  nombre: "Ana",
  email: "ana@test.com",
  telefono: "600111222",
  roles: ["FAMILIA"],
});

const router = createRouter({
  history: createWebHistory(),
  routes: [],
});

async function montarVista() {
  const pinia = createPinia();
  const wrapper = mount(MiPerfilView, {
    global: {
      plugins: [router, pinia],
    },
  });

  const authStore = useAuthStore(pinia);
  authStore.login(1, "ana@test.com", "12345678", "FAMILIA");

  await new Promise((resolve) => setTimeout(resolve, 0));
  return wrapper;
}

describe("MiPerfilView", () => {
  test("muestra los datos del usuario", async () => {
    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("Ana");
  });

  test("no muestra los botones de editar datos ni cambiar contraseña", async () => {
    const wrapper = await montarVista();

    expect(wrapper.find("#mi-perfil-editar-datos").exists()).toBe(false);
    expect(wrapper.find("#mi-perfil-cambiar-password").exists()).toBe(false);
  });
});