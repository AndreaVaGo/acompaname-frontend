import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import App from "../App.vue";

// Solo interesa la estructura de la página, así que las partes se sustituyen por vacías
function montarApp() {
  return mount(App, {
    global: {
      stubs: { NavBar: true, AppFooter: true, RouterView: true },
    },
  });
}

describe("App", () => {
  test("el contenido va dentro de un main con su identificador", () => {
    const wrapper = montarApp();

    const main = wrapper.find("main");
    expect(main.exists()).toBe(true);
    expect(main.attributes("id")).toBe("contenido");
  });

  test("tiene un enlace para saltar al contenido", () => {
    const wrapper = montarApp();

    const enlace = wrapper.find("a.saltar-contenido");
    expect(enlace.text()).toBe("Saltar al contenido");
    expect(enlace.attributes("href")).toBe("#contenido");
  });

  test("el enlace de saltar va antes que la barra y que el contenido", () => {
    const html = montarApp().html();

    const posicionEnlace = html.indexOf("saltar-contenido");
    const posicionBarra = html.indexOf("nav-bar-stub");
    const posicionMain = html.indexOf("<main");

    expect(posicionEnlace).toBeGreaterThan(-1);
    expect(posicionEnlace).toBeLessThan(posicionBarra);
    expect(posicionBarra).toBeLessThan(posicionMain);
  });

  test("la página de la ruta se muestra dentro del main", () => {
    const Pagina = { template: '<div class="pagina-de-prueba">Hola</div>' };
    const RouterViewFalso = {
      setup(props, { slots }) {
        return () => slots.default({ Component: Pagina, route: { path: "/prueba" } });
      },
    };
    const wrapper = mount(App, {
      global: {
        stubs: { NavBar: true, AppFooter: true, RouterView: RouterViewFalso },
      },
    });

    expect(wrapper.find("main .pagina-de-prueba").exists()).toBe(true);
  });
});
