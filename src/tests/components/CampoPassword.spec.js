import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CampoPassword from "../../components/CampoPassword.vue";

function montar(props = {}) {
  return mount(CampoPassword, {
    props: { id: "password", ...props },
  });
}

describe("CampoPassword", () => {
  test("empieza con la contraseña oculta", () => {
    const wrapper = montar();

    const boton = wrapper.find("button");
    expect(wrapper.find("input").attributes("type")).toBe("password");
    expect(boton.attributes("aria-label")).toBe("Mostrar contraseña");
    expect(boton.attributes("aria-pressed")).toBe("false");
  });

  test("al pulsar el ojo se ve la contraseña", async () => {
    const wrapper = montar();

    await wrapper.find("button").trigger("click");

    const boton = wrapper.find("button");
    expect(wrapper.find("input").attributes("type")).toBe("text");
    expect(boton.attributes("aria-label")).toBe("Ocultar contraseña");
    expect(boton.attributes("aria-pressed")).toBe("true");
  });

  test("al pulsar el ojo dos veces vuelve a ocultarse", async () => {
    const wrapper = montar();

    await wrapper.find("button").trigger("click");
    await wrapper.find("button").trigger("click");

    expect(wrapper.find("input").attributes("type")).toBe("password");
    expect(wrapper.find("button").attributes("aria-label")).toBe(
      "Mostrar contraseña",
    );
  });

  test("el ojo es de tipo button para no enviar el formulario", () => {
    const wrapper = montar();

    expect(wrapper.find("button").attributes("type")).toBe("button");
  });

  test("cambia el dibujo del ojo según se vea o no la contraseña", async () => {
    const wrapper = montar();
    // Con el ojo abierto no hay línea; con el ojo tachado sí
    expect(wrapper.find("svg line").exists()).toBe(false);

    await wrapper.find("button").trigger("click");

    expect(wrapper.find("svg line").exists()).toBe(true);
  });

  test("usa el id y el texto de ejemplo que recibe", () => {
    const wrapper = montar({ id: "password-nueva", placeholder: "Mínimo 8" });

    const campo = wrapper.find("input");
    expect(campo.attributes("id")).toBe("password-nueva");
    expect(campo.attributes("placeholder")).toBe("Mínimo 8");
  });

  test("muestra el valor que recibe", () => {
    const wrapper = montar({ modelValue: "Secreta123!" });

    expect(wrapper.find("input").element.value).toBe("Secreta123!");
  });

  test("al escribir avisa con el valor nuevo", async () => {
    const wrapper = montar();

    await wrapper.find("input").setValue("Hola1234!");

    expect(wrapper.emitted("update:modelValue")[0]).toEqual(["Hola1234!"]);
  });

  test("al ver la contraseña no se pierde lo escrito", async () => {
    const wrapper = montar({ modelValue: "Secreta123!" });

    await wrapper.find("button").trigger("click");

    expect(wrapper.find("input").element.value).toBe("Secreta123!");
  });
});
