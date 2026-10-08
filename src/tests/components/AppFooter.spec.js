import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AppFooter from "../../components/AppFooter.vue";

describe("AppFooter", () => {
  test("muestra el nombre de la aplicación", () => {
    const wrapper = mount(AppFooter);

    expect(wrapper.find(".footer__logo-text").text()).toBe("Acompáñame");
  });

  test("muestra el texto de copyright", () => {
    const wrapper = mount(AppFooter);

    expect(wrapper.find(".footer__text").text()).toContain("© 2026 Acompáñame");
  });
});