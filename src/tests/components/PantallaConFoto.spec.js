import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import PantallaConFoto from "../../components/PantallaConFoto.vue";

// ACOM-189 / ACOM-242: pantalla con panel de foto (con animación suave) para login y registro
const archivo = readFileSync("src/components/PantallaConFoto.vue", "utf-8");
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

  test("tiene un panel con una foto", () => {
    const wrapper = montar();
    const imagen = wrapper.find('[data-testid="panel-foto"] img');

    expect(imagen.exists()).toBe(true);
    expect(imagen.attributes("src")).toBeTruthy();
  });

  test("la foto se carga de forma diferida", () => {
    const wrapper = montar();
    const imagen = wrapper.find(".pantalla-foto__imagen");

    expect(imagen.attributes("loading")).toBe("lazy");
    expect(imagen.attributes("decoding")).toBe("async");
  });

  test("la foto tiene tamaño declarado, para que la página no salte al cargarla", () => {
    const wrapper = montar();
    const imagen = wrapper.find(".pantalla-foto__imagen");

    expect(imagen.attributes("width")).toBe("1000");
    expect(imagen.attributes("height")).toBe("667");
  });

  test("la foto es decorativa: sin texto alternativo y escondida a los lectores de pantalla", () => {
    const wrapper = montar();

    expect(wrapper.find(".pantalla-foto__imagen").attributes("alt")).toBe("");
    expect(wrapper.find('[data-testid="panel-foto"]').attributes("aria-hidden")).toBe("true");
  });

  test("lleva un velo de color encima de la foto", () => {
    const wrapper = montar();

    expect(wrapper.find(".pantalla-foto__velo").exists()).toBe(true);
  });

  test("lleva un lema sobre la foto", () => {
    const wrapper = montar();

    expect(wrapper.find(".pantalla-foto__lema").text()).toBe("Cuidar también es acompañar");
  });

  test("sin contenido sigue enseñando el panel sin romperse", () => {
    const wrapper = mount(PantallaConFoto);

    expect(wrapper.find('[data-testid="panel-foto"]').exists()).toBe(true);
    expect(wrapper.find(".pantalla-foto__contenido").text()).toBe("");
  });

  test("la foto entra con una animación y después respira despacio", () => {
    expect(archivo).toContain("@keyframes foto-llega");
    expect(archivo).toContain("@keyframes foto-respira");
    expect(archivo).toContain("@keyframes lema-sube");
  });

  test("solo se anima transform y opacity", () => {
    const keyframes = archivo.match(/@keyframes[^{]+\{[\s\S]*?\n\}/g).join("\n");
    const propiedades = keyframes.match(/^\s+([a-z-]+):/gm).map((p) => p.trim().replace(":", ""));

    for (const propiedad of propiedades) {
      expect(["transform", "opacity"]).toContain(propiedad);
    }
  });

  test("con reducir movimiento la foto se queda quieta", () => {
    const bloque = archivo.slice(archivo.indexOf("@media (prefers-reduced-motion: reduce)"));

    expect(bloque).toContain("animation: none");
    expect(bloque).toContain(".pantalla-foto__imagen");
  });

  test("la foto sigue siendo decorativa", () => {
    const wrapper = montar();

    expect(wrapper.find(".pantalla-foto__imagen").attributes("alt")).toBe("");
    expect(wrapper.find('[data-testid="panel-foto"]').attributes("aria-hidden")).toBe("true");
  });
});
