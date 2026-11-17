import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AdminSugerencias from "../../../components/admin/AdminSugerencias.vue";

const SUGERENCIAS = [
  {
    id: 2,
    texto: "Más colores\nen la web",
    fecha: "2026-11-17T22:15:30",
    nombreUsuario: "Ana",
    emailUsuario: "ana@test.com",
    rol: "FAMILIA",
  },
  {
    id: 1,
    texto: "Un chat",
    fecha: "2026-11-10T09:05:00",
    nombreUsuario: "Pepe",
    emailUsuario: "pepe@test.com",
    rol: "CUIDADOR",
  },
];

function montar(sugerencias) {
  return mount(AdminSugerencias, { props: { sugerencias } });
}

describe("AdminSugerencias", () => {
  test("muestra una fila por sugerencia con persona, email y texto", () => {
    const wrapper = montar(SUGERENCIAS);
    const filas = wrapper.findAll("tbody tr");

    expect(filas).toHaveLength(2);
    expect(filas[0].text()).toContain("Ana");
    expect(filas[0].text()).toContain("ana@test.com");
    expect(filas[0].text()).toContain("Más colores");
    expect(filas[1].text()).toContain("Un chat");
  });

  test("la fecha se muestra como día-mes-año y hora", () => {
    const wrapper = montar(SUGERENCIAS);
    const filas = wrapper.findAll("tbody tr");

    expect(filas[0].find("td").text()).toBe("17-11-2026 22:15");
    expect(filas[1].find("td").text()).toBe("10-11-2026 09:05");
  });

  test("el rol sale en una píldora: familia en verde y cuidadora en naranja", () => {
    const wrapper = montar(SUGERENCIAS);

    expect(wrapper.find(".admin-pildora--verde").text()).toBe("Familia");
    expect(wrapper.find(".admin-pildora--naranja").text()).toBe("Persona cuidadora");
  });

  test("el pie cuenta las sugerencias, en singular y en plural", () => {
    expect(montar(SUGERENCIAS).find(".admin-sugerencias__pie").text()).toBe("2 sugerencias");
    expect(montar([SUGERENCIAS[0]]).find(".admin-sugerencias__pie").text()).toBe("1 sugerencia");
  });

  test("sin sugerencias avisa y no pinta la tabla", () => {
    const wrapper = montar([]);

    expect(wrapper.text()).toContain("Todavía no hay sugerencias.");
    expect(wrapper.find("table").exists()).toBe(false);
  });
});
