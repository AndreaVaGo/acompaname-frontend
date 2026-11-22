import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CodigoDosPasos from "../../components/CodigoDosPasos.vue";

function montar(props = {}) {
  return mount(CodigoDosPasos, { props });
}

describe("CodigoDosPasos", () => {
  test("muestra seis casillas vacías al empezar", () => {
    const wrapper = montar();

    expect(wrapper.findAll(".codigo__casilla")).toHaveLength(6);
    expect(wrapper.findAll(".codigo__casilla--llena")).toHaveLength(0);
  });

  test("enseña el correo al que se ha mandado el código", () => {
    const wrapper = montar({ correo: "ana@test.com" });

    expect(wrapper.text()).toContain("ana@test.com");
  });

  test("cada cifra escrita llena una casilla", async () => {
    const wrapper = montar();

    await wrapper.find("#codigo").setValue("123");

    const llenas = wrapper.findAll(".codigo__casilla--llena");
    expect(llenas.map((c) => c.text())).toEqual(["1", "2", "3"]);
  });

  test("solo acepta cifras y como mucho seis", async () => {
    const wrapper = montar();

    await wrapper.find("#codigo").setValue("12a3-4 5678");

    expect(wrapper.find("#codigo").element.value).toBe("123456");
  });

  test("el campo pide teclado numérico y permite autocompletar el código del correo", () => {
    const campo = montar().find("#codigo");

    expect(campo.attributes("inputmode")).toBe("numeric");
    expect(campo.attributes("autocomplete")).toBe("one-time-code");
  });

  test("con las seis cifras avisa con el código", async () => {
    const wrapper = montar();
    await wrapper.find("#codigo").setValue("004821");

    await wrapper.find("form").trigger("submit");

    expect(wrapper.emitted("verificar")).toEqual([["004821"]]);
  });

  test("con menos de seis cifras no avisa y pide completarlo", async () => {
    const wrapper = montar();
    await wrapper.find("#codigo").setValue("123");

    await wrapper.find("form").trigger("submit");

    expect(wrapper.emitted("verificar")).toBeUndefined();
    expect(wrapper.find(".codigo__error").text()).toBe("Escribe los 6 números del código.");
  });

  test("el aviso de falta de cifras desaparece al seguir escribiendo", async () => {
    const wrapper = montar();
    await wrapper.find("form").trigger("submit");
    expect(wrapper.find(".codigo__error").exists()).toBe(true);

    await wrapper.find("#codigo").setValue("1");

    expect(wrapper.find(".codigo__error").exists()).toBe(false);
  });

  test("enseña el error que le pasa la vista como alerta", () => {
    const wrapper = montar({ error: "El código no es correcto" });

    const error = wrapper.find(".codigo__error");
    expect(error.text()).toBe("El código no es correcto");
    expect(error.attributes("role")).toBe("alert");
  });

  test("la casilla activa es la siguiente a la última cifra mientras el campo tiene el foco", async () => {
    const wrapper = montar();
    await wrapper.find("#codigo").trigger("focus");
    await wrapper.find("#codigo").setValue("12");

    const casillas = wrapper.findAll(".codigo__casilla");
    expect(casillas[2].classes()).toContain("codigo__casilla--activa");
    expect(casillas[0].classes()).not.toContain("codigo__casilla--activa");

    await wrapper.find("#codigo").trigger("blur");
    expect(wrapper.findAll(".codigo__casilla--activa")).toHaveLength(0);
  });

  test("el botón Volver avisa a la vista", async () => {
    const wrapper = montar();

    await wrapper.find(".codigo__volver").trigger("click");

    expect(wrapper.emitted("volver")).toHaveLength(1);
  });

  test("las casillas están ocultas a los lectores de pantalla (el campo de verdad sí se lee)", () => {
    const wrapper = montar();

    expect(wrapper.find(".codigo__casilla").attributes("aria-hidden")).toBe("true");
    expect(wrapper.find("label[for='codigo']").exists()).toBe(true);
  });
});
