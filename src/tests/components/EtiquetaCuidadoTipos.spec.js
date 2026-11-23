import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import EtiquetaCuidado from "../../components/EtiquetaCuidado.vue";
import { PALETA } from "../../utils/paletaEtiquetas";

function rgb(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}

describe("EtiquetaCuidado · el resto de tipos", () => {
  test("un grupo de edad lleva su icono y su nombre", () => {
    const wrapper = mount(EtiquetaCuidado, { props: { tipo: "grupo", codigo: "BEBES" } });

    expect(wrapper.text()).toBe("Bebés");
    expect(wrapper.attributes("data-icono")).toBe("👶");
    expect(wrapper.element.style.backgroundColor).toBe(rgb(PALETA.rosa.fondo));
  });

  test("la modalidad de domicilio lleva la casa", () => {
    const wrapper = mount(EtiquetaCuidado, { props: { tipo: "modalidad", codigo: "domicilio" } });

    expect(wrapper.text()).toBe("A domicilio");
    expect(wrapper.attributes("data-icono")).toBe("🏠");
  });

  test("hospital y domicilio lleva los dos iconos", () => {
    const wrapper = mount(EtiquetaCuidado, { props: { tipo: "modalidad", codigo: "ambos" } });

    expect(wrapper.text()).toBe("Hospital y domicilio");
    expect(wrapper.attributes("data-icono")).toBe("🏥🏠");
  });

  test("el vehículo propio lleva el coche y disponible ahora, el círculo verde", () => {
    const vehiculo = mount(EtiquetaCuidado, { props: { tipo: "extra", codigo: "vehiculo" } });
    const disponible = mount(EtiquetaCuidado, { props: { tipo: "extra", codigo: "disponible" } });

    expect(vehiculo.text()).toBe("Vehículo propio");
    expect(vehiculo.attributes("data-icono")).toBe("🚗");
    expect(disponible.text()).toBe("Disponible ahora");
    expect(disponible.attributes("data-icono")).toBe("🟢");
  });

  test("un tipo desconocido busca entre los cuidados", () => {
    const wrapper = mount(EtiquetaCuidado, { props: { tipo: "otro", codigo: "medicacion" } });

    expect(wrapper.text()).toBe("Medicación");
  });

  test("los traslados llevan la ambulancia, para no repetir el coche del vehículo propio", () => {
    const wrapper = mount(EtiquetaCuidado, { props: { codigo: "traslados" } });

    expect(wrapper.attributes("data-icono")).toBe("🚑");
  });
});
