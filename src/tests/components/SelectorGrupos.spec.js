import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SelectorGrupos from "../../components/SelectorGrupos.vue";

// Monta el selector con lo mínimo y deja cambiar lo que haga falta
function montar(props = {}) {
  return mount(SelectorGrupos, {
    props: { legend: "Grupo de edad", ...props },
  });
}

describe("SelectorGrupos", () => {
  test("enseña el título y una opción por cada grupo de edad", () => {
    const wrapper = montar();

    expect(wrapper.find("legend").text()).toBe("Grupo de edad");
    expect(wrapper.findAll("input")).toHaveLength(6);
    expect(wrapper.text()).toContain("Niñas y niños");
    expect(wrapper.text()).toContain("De 4 a 12 años");
  });

  test("por defecto se elige un solo grupo (botones redondos)", () => {
    const wrapper = montar();

    const tipos = wrapper.findAll("input").map((i) => i.attributes("type"));
    expect(new Set(tipos)).toEqual(new Set(["radio"]));
  });

  test("con multiple se pueden marcar varios (casillas)", () => {
    const wrapper = montar({ multiple: true, modelValue: [] });

    const tipos = wrapper.findAll("input").map((i) => i.attributes("type"));
    expect(new Set(tipos)).toEqual(new Set(["checkbox"]));
  });

  test("elegir un grupo avisa con su código", async () => {
    const wrapper = montar({ modelValue: "" });

    await wrapper.find('input[value="MAYORES"]').setValue(true);

    expect(wrapper.emitted("update:modelValue")[0]).toEqual(["MAYORES"]);
  });

  test("el grupo elegido sale marcado", () => {
    const wrapper = montar({ modelValue: "NINOS" });

    expect(wrapper.find('input[value="NINOS"]').element.checked).toBe(true);
    expect(wrapper.find('input[value="MAYORES"]').element.checked).toBe(false);
    expect(wrapper.find(".grupos__opcion--marcada").text()).toContain(
      "Niñas y niños",
    );
  });

  test("con multiple, marcar un grupo lo añade a los que ya había", async () => {
    const wrapper = montar({ multiple: true, modelValue: ["BEBES"] });

    await wrapper.find('input[value="NINOS"]').setValue(true);

    expect(wrapper.emitted("update:modelValue")[0]).toEqual([
      ["BEBES", "NINOS"],
    ]);
  });

  test("con multiple, volver a marcar un grupo lo quita", async () => {
    const wrapper = montar({ multiple: true, modelValue: ["BEBES", "NINOS"] });

    await wrapper.find('input[value="BEBES"]').setValue(false);

    expect(wrapper.emitted("update:modelValue")[0]).toEqual([["NINOS"]]);
  });

  test("con multiple, los grupos que llegan marcados salen marcados", () => {
    const wrapper = montar({ multiple: true, modelValue: ["BEBES", "ADULTOS"] });

    expect(wrapper.find('input[value="BEBES"]').element.checked).toBe(true);
    expect(wrapper.find('input[value="ADULTOS"]').element.checked).toBe(true);
    expect(wrapper.find('input[value="MAYORES"]').element.checked).toBe(false);
  });

  test("con multiple y sin valor todavía, no falla", () => {
    const wrapper = montar({ multiple: true });

    expect(wrapper.findAll("input")).toHaveLength(6);
  });

  test("sin textoTodos no hay opción para dejarlo vacío", () => {
    const wrapper = montar();

    expect(wrapper.find('input[value=""]').exists()).toBe(false);
  });

  test("con textoTodos aparece una primera opción que deja el valor vacío", async () => {
    const wrapper = montar({ modelValue: "NINOS", textoTodos: "Todos los grupos" });

    const inputs = wrapper.findAll("input");
    expect(inputs).toHaveLength(7);
    expect(wrapper.findAll("label")[0].text()).toBe("Todos los grupos");

    await inputs[0].setValue(true);

    expect(wrapper.emitted("update:modelValue")[0]).toEqual([""]);
  });

  test("con textoTodos, sin nada elegido sale marcada la opción de todos", () => {
    const wrapper = montar({ modelValue: "", textoTodos: "Todos los grupos" });

    expect(wrapper.find('input[value=""]').element.checked).toBe(true);
  });

  test("todas las opciones comparten el nombre que se le da", () => {
    const wrapper = montar({ name: "grupo-solicitud" });

    const nombres = wrapper.findAll("input").map((i) => i.attributes("name"));
    expect(new Set(nombres)).toEqual(new Set(["grupo-solicitud"]));
  });
});