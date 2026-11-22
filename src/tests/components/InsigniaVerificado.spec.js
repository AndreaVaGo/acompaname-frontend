import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import InsigniaVerificado from "../../components/InsigniaVerificado.vue";

describe("InsigniaVerificado", () => {
  test("sin nada verificado no pinta nada", () => {
    const wrapper = mount(InsigniaVerificado);

    expect(wrapper.find(".insignias").exists()).toBe(false);
  });

  test("solo titulación verificada enseña solo esa insignia", () => {
    const wrapper = mount(InsigniaVerificado, { props: { titulacion: true } });

    expect(wrapper.find('[data-testid="insignia-titulacion"]').text()).toContain("Titulación verificada");
    expect(wrapper.find('[data-testid="insignia-antecedentes"]').exists()).toBe(false);
  });

  test("solo antecedentes verificados enseña solo esa insignia", () => {
    const wrapper = mount(InsigniaVerificado, { props: { antecedentes: true } });

    expect(wrapper.find('[data-testid="insignia-antecedentes"]').text()).toContain("Antecedentes verificados");
    expect(wrapper.find('[data-testid="insignia-titulacion"]').exists()).toBe(false);
  });

  test("con las dos enseña las dos", () => {
    const wrapper = mount(InsigniaVerificado, { props: { titulacion: true, antecedentes: true } });

    expect(wrapper.findAll(".insignia")).toHaveLength(2);
  });
});
