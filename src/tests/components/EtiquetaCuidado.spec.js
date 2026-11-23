import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import EtiquetaCuidado from "../../components/EtiquetaCuidado.vue";
import { PALETA } from "../../utils/paletaEtiquetas";

// El navegador (jsdom) convierte #RRGGBB en rgb(r, g, b): se hace lo mismo para comparar
function rgb(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}

describe("EtiquetaCuidado", () => {
  test("un servicio enseña solo su nombre, con su icono aparte", () => {
    const wrapper = mount(EtiquetaCuidado, { props: { codigo: "medicacion" } });

    expect(wrapper.text()).toBe("Medicación");
    expect(wrapper.attributes("data-icono")).toBe("💊");
  });

  test("un servicio usa el fondo suave y la letra oscura de su color", () => {
    const wrapper = mount(EtiquetaCuidado, { props: { codigo: "medicacion" } });
    const estilo = wrapper.element.style;

    expect(estilo.backgroundColor).toBe(rgb(PALETA.verde.fondo));
    expect(estilo.color).toBe(rgb(PALETA.verde.texto));
    expect(wrapper.classes()).not.toContain("etiqueta--titulacion");
  });

  test("una titulación se destaca: fondo lleno y letra blanca", () => {
    const wrapper = mount(EtiquetaCuidado, {
      props: { codigo: "ENFERMERIA", tipo: "titulacion" },
    });
    const estilo = wrapper.element.style;

    expect(wrapper.classes()).toContain("etiqueta--titulacion");
    expect(estilo.backgroundColor).toBe(rgb(PALETA.verde.solido));
    expect(estilo.color).toBe("rgb(255, 255, 255)");
    expect(wrapper.attributes("data-icono")).toBe("🩺");
  });

  test("una titulación enseña el nombre completo, o el corto si se pide", () => {
    const completo = mount(EtiquetaCuidado, {
      props: { codigo: "AUXILIAR_ENFERMERIA", tipo: "titulacion" },
    });
    const corto = mount(EtiquetaCuidado, {
      props: { codigo: "AUXILIAR_ENFERMERIA", tipo: "titulacion", corto: true },
    });

    expect(completo.text()).toBe("Auxiliar de enfermería (TCAE)");
    expect(corto.text()).toBe("TCAE");
  });

  test("un código que no está en el catálogo se ve tal cual, sin icono y en gris", () => {
    const wrapper = mount(EtiquetaCuidado, { props: { codigo: "inventado" } });

    expect(wrapper.text()).toBe("inventado");
    expect(wrapper.attributes("data-icono")).toBe("");
    expect(wrapper.element.style.backgroundColor).toBe(rgb(PALETA.neutro.fondo));
  });

  test("conserva las clases que le pone la pantalla donde se usa", () => {
    const wrapper = mount(EtiquetaCuidado, {
      props: { codigo: "higiene" },
      attrs: { class: "buscar__tag buscar__tag--servicio" },
    });

    expect(wrapper.classes()).toContain("buscar__tag--servicio");
    expect(wrapper.classes()).toContain("etiqueta");
  });
});
