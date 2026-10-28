import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AvataresPersonas from "../../../components/animation/AvataresPersonas.vue";

describe("AvataresPersonas", () => {
  test("dibuja tres personas", () => {
    const wrapper = mount(AvataresPersonas);

    // Cada persona es un grupo con su círculo de fondo, su silueta y su borde
    expect(wrapper.findAll("svg > g")).toHaveLength(3);
  });

  test("es solo decoración y los lectores de pantalla lo ignoran", () => {
    const wrapper = mount(AvataresPersonas);

    expect(wrapper.find("svg").attributes("aria-hidden")).toBe("true");
  });

  test("no necesita texto: el significado lo da el enlace que lo rodea", () => {
    const wrapper = mount(AvataresPersonas);

    expect(wrapper.text()).toBe("");
  });
});