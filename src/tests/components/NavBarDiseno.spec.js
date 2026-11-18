import { describe, test, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { readFileSync } from "node:fs";
import { createRouter, createWebHistory } from "vue-router";
import NavBar from "../../components/NavBar.vue";

// Diseño de la barra: fija arriba, con sombra al bajar y movimiento que se puede apagar
const archivo = readFileSync("src/components/NavBar.vue", "utf-8");

function montar() {
  setActivePinia(createPinia());
  const router = createRouter({ history: createWebHistory(), routes: [] });
  const wrapper = mount(NavBar, { global: { plugins: [router] } });
  return { wrapper };
}

describe("NavBar · diseño", () => {
  afterEach(() => {
    window.scrollY = 0;
    vi.restoreAllMocks();
  });

  test("la barra está dentro de un header fijo arriba", () => {
    const { wrapper } = montar();

    expect(wrapper.find("header.navbar-barra nav.navbar").exists()).toBe(true);
    expect(archivo).toContain("position: sticky");
  });

  test("arriba del todo no tiene sombra", () => {
    const { wrapper } = montar();

    expect(wrapper.find("header").classes()).not.toContain("navbar-barra--sombra");
  });

  test("al bajar la página aparece la sombra", async () => {
    const { wrapper } = montar();

    window.scrollY = 120;
    window.dispatchEvent(new Event("scroll"));
    await wrapper.vm.$nextTick();

    expect(wrapper.find("header").classes()).toContain("navbar-barra--sombra");
  });

  test("al volver arriba la sombra desaparece", async () => {
    const { wrapper } = montar();
    window.scrollY = 120;
    window.dispatchEvent(new Event("scroll"));
    await wrapper.vm.$nextTick();

    window.scrollY = 0;
    window.dispatchEvent(new Event("scroll"));
    await wrapper.vm.$nextTick();

    expect(wrapper.find("header").classes()).not.toContain("navbar-barra--sombra");
  });

  test("al quitar la barra se deja de escuchar el scroll", () => {
    const quitar = vi.spyOn(window, "removeEventListener");
    const { wrapper } = montar();

    wrapper.unmount();

    expect(quitar).toHaveBeenCalledWith("scroll", expect.any(Function));
  });

  test("el menú de la cuenta tiene su animación al desplegarse", () => {
    expect(archivo).toContain("@keyframes menu-aparece");
    expect(archivo).toContain("transform-origin: top right");
  });

  test("el aviso de solicitudes nuevas tiene su animación", () => {
    expect(archivo).toContain("@keyframes aviso-aparece");
  });

  test("con reducir movimiento se apagan las animaciones de la barra", () => {
    const bloque = archivo.slice(archivo.indexOf("@media (prefers-reduced-motion: reduce)"));

    expect(bloque).toContain(".navbar__aviso");
    expect(bloque).toContain(".navbar__menu");
    expect(bloque).toContain(".navbar__logo:hover .navbar__logo-icon");
  });
});
