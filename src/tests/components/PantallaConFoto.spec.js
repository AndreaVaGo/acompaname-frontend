import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PantallaConFoto from "../../components/PantallaConFoto.vue";

// ACOM-189 / ACOM-242: pantalla con panel de manos animadas para login y registro
function montar(contenido = "<p id='dentro'>Formulario</p>") {
  return mount(PantallaConFoto, { slots: { default: contenido } });
}

describe("PantallaConFoto", () => {
  test("enseña el contenido que se le pasa", () => {
    const wrapper = montar();

    expect(wrapper.find("#dentro").exists()).toBe(true);
    expect(wrapper.find(".pantalla-foto__contenido").text()).toContain("Formulario");
  });

  test("el contenido va dentro de su propia columna, no del panel de la foto", () => {
    const wrapper = montar();

    expect(wrapper.find('[data-testid="panel-foto"] #dentro').exists()).toBe(false);
  });

  test("tiene un panel con las manos que se dan la mano", () => {
    const wrapper = montar();

    expect(wrapper.find('[data-testid="panel-foto"] [data-testid="manos-ilustracion"]').exists()).toBe(true);
  });

  test("ya no carga ninguna foto", () => {
    const wrapper = montar();

    expect(wrapper.find('[data-testid="panel-foto"] img').exists()).toBe(false);
  });

  test("el panel es decorativo: escondido a los lectores de pantalla", () => {
    const wrapper = montar();

    expect(wrapper.find('[data-testid="panel-foto"]').attributes("aria-hidden")).toBe("true");
    expect(wrapper.find('[data-testid="manos-ilustracion"]').attributes("aria-hidden")).toBe("true");
  });

  test("lleva un fondo de color detrás de las manos", () => {
    const wrapper = montar();

    expect(wrapper.find(".pantalla-foto__velo").exists()).toBe(true);
  });

  test("lleva un lema sobre el panel", () => {
    const wrapper = montar();

    expect(wrapper.find(".pantalla-foto__lema").text()).toBe("Cuidar también es acompañar");
  });

  test("sin contenido sigue enseñando el panel sin romperse", () => {
    const wrapper = mount(PantallaConFoto);

    expect(wrapper.find('[data-testid="panel-foto"]').exists()).toBe(true);
    expect(wrapper.find(".pantalla-foto__contenido").text()).toBe("");
  });
});
