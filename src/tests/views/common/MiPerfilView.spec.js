import { describe, test, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import MiPerfilView from "../../../views/common/MiPerfilView.vue";
import UsuarioRepository from "../../../repositories/UsuarioRepository";
import { useAuthStore } from "../../../stores/auth";

const getByIdFalso = vi
  .spyOn(UsuarioRepository.prototype, "getById")
  .mockResolvedValue({
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

  test("muestra un error si no se pueden cargar los datos", async () => {
    getByIdFalso.mockRejectedValueOnce(new Error("fallo"));

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain("No se pudieron cargar tus datos.");
    expect(wrapper.text()).not.toContain("Cargando...");
  });

  test("muestra el motivo si el servidor responde con un error al cargar los datos", async () => {
    const errorNoEncontrado = new Error("fallo");
    errorNoEncontrado.status = 404;
    getByIdFalso.mockRejectedValueOnce(errorNoEncontrado);

    const wrapper = await montarVista();

    expect(wrapper.text()).toContain(
      "No se pudieron cargar tus datos. No se ha encontrado lo que buscas."
    );
  });
});