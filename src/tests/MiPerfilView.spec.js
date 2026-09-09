import { describe, test, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import MiPerfilView from "../views/MiPerfilView.vue";
import UsuarioRepository from "../repositories/UsuarioRepository";
import { useAuthStore } from "../stores/auth";

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

describe("MiPerfilView", () => {
  test("muestra los datos del usuario", async () => {
    const pinia = createPinia();
    const wrapper = mount(MiPerfilView, {
      global: {
        plugins: [router, pinia],
      },
    });

    const authStore = useAuthStore(pinia);
    authStore.login(1, "ana@test.com", "12345678", "FAMILIA");

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("Ana");
  });
});
