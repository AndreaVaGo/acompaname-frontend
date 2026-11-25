import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import FotoCuidador from "../../components/FotoCuidador.vue";
import { API_URL } from "../../repositories/Repository";

describe("FotoCuidador", () => {
  test("muestra la foto si hay enlace", () => {
    const wrapper = mount(FotoCuidador, {
      props: { foto: "https://ejemplo.com/foto.jpg", nombre: "Ana" },
    });

    const imagen = wrapper.find("img");
    expect(imagen.exists()).toBe(true);
    expect(imagen.attributes("src")).toBe("https://ejemplo.com/foto.jpg");
  });

  test("una foto que es una dirección de la API se completa con la dirección del servidor", () => {
    const wrapper = mount(FotoCuidador, {
      props: { foto: "/cuidadores/5/foto?v=1a2b", nombre: "Ana" },
    });

    expect(wrapper.find("img").attributes("src")).toBe(`${API_URL}/cuidadores/5/foto?v=1a2b`);
  });

  test("una foto en Base64 se deja tal cual", () => {
    const base64 = "data:image/png;base64,AAAA";
    const wrapper = mount(FotoCuidador, { props: { foto: base64, nombre: "Ana" } });

    expect(wrapper.find("img").attributes("src")).toBe(base64);
  });

  test("sin foto muestra la inicial del nombre en mayúscula", () => {
    const wrapper = mount(FotoCuidador, {
      props: { foto: "", nombre: "ana" },
    });

    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.find(".foto-cuidador--sin-foto").exists()).toBe(true);
    expect(wrapper.find(".foto-cuidador__inicial").text()).toBe("A");
    expect(wrapper.find("svg").exists()).toBe(false);
  });

  test("la inicial ignora los espacios del principio y respeta los acentos", () => {
    const wrapper = mount(FotoCuidador, {
      props: { foto: "", nombre: "  álvaro" },
    });

    expect(wrapper.find(".foto-cuidador__inicial").text()).toBe("Á");
  });

  test("sin foto y sin nombre se queda el monigote", () => {
    const sinNombre = mount(FotoCuidador, { props: { foto: "", nombre: "" } });
    const soloEspacios = mount(FotoCuidador, { props: { foto: "", nombre: "   " } });

    expect(sinNombre.find("svg").exists()).toBe(true);
    expect(sinNombre.find(".foto-cuidador__inicial").exists()).toBe(false);
    expect(soloEspacios.find("svg").exists()).toBe(true);
    expect(soloEspacios.find(".foto-cuidador__inicial").exists()).toBe(false);
  });

  test("la letra se adapta al tamaño del círculo", () => {
    const pequeno = mount(FotoCuidador, { props: { foto: "", nombre: "Ana", tamano: 40 } });
    const grande = mount(FotoCuidador, { props: { foto: "", nombre: "Ana", tamano: 100 } });

    expect(pequeno.find(".foto-cuidador__inicial").attributes("style")).toContain("font-size: 18px");
    expect(grande.find(".foto-cuidador__inicial").attributes("style")).toContain("font-size: 45px");
  });

  test("sin foto lleva un texto para lectores de pantalla", () => {
    const conNombre = mount(FotoCuidador, { props: { foto: "", nombre: "Ana" } });
    const sinNombre = mount(FotoCuidador, { props: { foto: "", nombre: "" } });

    expect(conNombre.find(".foto-cuidador--sin-foto").attributes("aria-label")).toBe("Sin foto de Ana");
    expect(sinNombre.find(".foto-cuidador--sin-foto").attributes("aria-label")).toBe("Sin foto");
  });

  test("muestra la inicial si la foto no carga", async () => {
    const wrapper = mount(FotoCuidador, {
      props: { foto: "https://ejemplo.com/rota.jpg", nombre: "Pepe" },
    });

    await wrapper.find("img").trigger("error");

    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.find(".foto-cuidador--sin-foto").exists()).toBe(true);
    expect(wrapper.find(".foto-cuidador__inicial").text()).toBe("P");
  });

  test("vuelve a probar con la foto nueva después de un fallo", async () => {
    const wrapper = mount(FotoCuidador, {
      props: { foto: "https://ejemplo.com/rota.jpg", nombre: "Pepe" },
    });
    await wrapper.find("img").trigger("error");

    await wrapper.setProps({ foto: "https://ejemplo.com/buena.jpg" });

    expect(wrapper.find("img").exists()).toBe(true);
    expect(wrapper.find("img").attributes("src")).toBe(
      "https://ejemplo.com/buena.jpg",
    );
  });
});