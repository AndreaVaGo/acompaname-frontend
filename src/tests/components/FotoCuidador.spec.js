import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import FotoCuidador from "../../components/FotoCuidador.vue";

describe("FotoCuidador", () => {
  test("muestra la foto si hay enlace", () => {
    const wrapper = mount(FotoCuidador, {
      props: { foto: "https://ejemplo.com/foto.jpg", nombre: "Ana" },
    });

    const imagen = wrapper.find("img");
    expect(imagen.exists()).toBe(true);
    expect(imagen.attributes("src")).toBe("https://ejemplo.com/foto.jpg");
  });

  test("muestra la inicial si no hay foto", () => {
    const wrapper = mount(FotoCuidador, {
      props: { foto: "", nombre: "ana" },
    });

    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.text()).toBe("A");
  });

  test("muestra la inicial si la foto no carga", async () => {
    const wrapper = mount(FotoCuidador, {
      props: { foto: "https://ejemplo.com/rota.jpg", nombre: "Pepe" },
    });

    await wrapper.find("img").trigger("error");

    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.text()).toBe("P");
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