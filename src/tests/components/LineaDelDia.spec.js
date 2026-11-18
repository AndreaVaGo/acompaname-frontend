import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import LineaDelDia from "../../components/LineaDelDia.vue";

function montar(tramos) {
  return mount(LineaDelDia, { props: { tramos: tramos } });
}

describe("LineaDelDia", () => {
  test("sin tramos dice que el día está libre y no pinta ningún tramo", () => {
    const wrapper = montar([]);

    expect(wrapper.findAll(".linea-dia__tramo").length).toBe(0);
    expect(wrapper.find(".linea-dia__libres").text()).toBe("Libre todo el día.");
  });

  test("enseña las marcas de las horas debajo de la línea", () => {
    const wrapper = montar([]);

    const horas = wrapper.findAll(".linea-dia__horas span").map((s) => s.text());
    expect(horas).toEqual(["0 h", "6 h", "12 h", "18 h", "24 h"]);
  });

  test("pinta cada tramo en su sitio y con su ancho según el día de 24 horas", () => {
    // De 06:00 a 12:00: empieza al 25 % y mide un 25 %
    const wrapper = montar([{ inicio: 360, fin: 720, texto: "Turno" }]);

    const estilo = wrapper.find(".linea-dia__tramo").attributes("style");
    expect(estilo).toContain("left: 25%");
    expect(estilo).toContain("width: 25%");
  });

  test("al pasar el ratón por un tramo dice las horas y de qué es", () => {
    const wrapper = montar([{ inicio: 480, fin: 900, texto: "Rato ocupado · Turno" }]);

    expect(wrapper.find(".linea-dia__tramo").attributes("title")).toBe("08:00 – 15:00 · Rato ocupado · Turno");
  });

  test("un tramo largo lleva sus horas escritas dentro y uno corto no", () => {
    const wrapper = montar([
      { inicio: 480, fin: 900, texto: "Largo" },
      { inicio: 1000, fin: 1100, texto: "Corto" },
    ]);

    const tramos = wrapper.findAll(".linea-dia__tramo");
    expect(tramos[0].find(".linea-dia__texto").text()).toBe("08:00 – 15:00");
    expect(tramos[1].find(".linea-dia__texto").exists()).toBe(false);
  });

  test("dice qué horas quedan libres", () => {
    const wrapper = montar([{ inicio: 480, fin: 900, texto: "Turno" }]);

    expect(wrapper.find(".linea-dia__libres").text()).toBe("Horas libres: 00:00 – 08:00 · 15:00 – 24:00");
  });

  test("si el día está completo dice que no queda ninguna hora libre", () => {
    const wrapper = montar([{ inicio: 0, fin: 1440, texto: "Todo el día" }]);

    expect(wrapper.find(".linea-dia__libres").text()).toBe("No te queda ninguna hora libre este día.");
  });

  test("la línea lleva un texto para lectores de pantalla con las horas libres", () => {
    const wrapper = montar([{ inicio: 480, fin: 900, texto: "Turno" }]);

    expect(wrapper.find(".linea-dia__pista").attributes("aria-label")).toContain("Horas libres");
  });

  test("tiene leyenda de libre y ocupado", () => {
    const wrapper = montar([]);

    const leyenda = wrapper.find(".linea-dia__leyenda").text();
    expect(leyenda).toContain("Libre");
    expect(leyenda).toContain("Ocupado");
  });

  test("pinta una rayita por cada hora, de las 0 a las 24", () => {
    const wrapper = montar([]);

    expect(wrapper.findAll(".linea-dia__rayita").length).toBe(25);
  });

  test("las rayitas de las 0, 6, 12, 18 y 24 son grandes y las de las 3, 9, 15 y 21 medianas", () => {
    const wrapper = montar([]);

    expect(wrapper.findAll(".linea-dia__rayita--grande").length).toBe(5);
    expect(wrapper.findAll(".linea-dia__rayita--mediana").length).toBe(4);
  });

  test("cada rayita está en su sitio según la hora", () => {
    const wrapper = montar([]);

    const rayitas = wrapper.findAll(".linea-dia__rayita");
    expect(rayitas[0].attributes("style")).toContain("left: 0%");
    expect(rayitas[12].attributes("style")).toContain("left: 50%");
    expect(rayitas[24].attributes("style")).toContain("left: 100%");
  });

  test("los números van bajo sus rayitas y el primero y el último quedan dentro de la línea", () => {
    const wrapper = montar([]);

    const numeros = wrapper.findAll(".linea-dia__horas span");
    expect(numeros[0].classes()).toContain("linea-dia__hora--inicio");
    expect(numeros[2].attributes("style")).toContain("left: 50%");
    expect(numeros[4].classes()).toContain("linea-dia__hora--fin");
  });
});
