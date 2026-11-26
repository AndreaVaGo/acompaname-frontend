import { describe, test, expect } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import SugerenciasMunicipios from "../../components/SugerenciasMunicipios.vue";
import { MUNICIPIOS } from "../../utils/catalogoMunicipios";

describe("SugerenciasMunicipios", () => {
  test("ofrece todos los municipios del catálogo", async () => {
    const wrapper = mount(SugerenciasMunicipios);
    await flushPromises();

    expect(wrapper.find("datalist").attributes("id")).toBe("lista-municipios");
    expect(wrapper.findAll("option")).toHaveLength(MUNICIPIOS.length);
  });

  test("cada sugerencia lleva el municipio y, al lado, su provincia", async () => {
    const wrapper = mount(SugerenciasMunicipios);
    await flushPromises();

    const gijon = wrapper
      .findAll("option")
      .find((o) => o.attributes("value") === "Gijón");
    expect(gijon.attributes("label")).toBe("(Asturias)");
  });
});
