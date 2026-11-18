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

function botonFiltro(wrapper, nombre) {
  return wrapper.findAll(".admin-filtros__boton").find((boton) => boton.text().startsWith(nombre));
}

describe("AdminSugerencias", () => {
  test("muestra una tarjeta por sugerencia con persona, email y texto", () => {
    const wrapper = montar(SUGERENCIAS);
    const tarjetas = wrapper.findAll(".admin-sugerencias__tarjeta");

    expect(tarjetas).toHaveLength(2);
    expect(tarjetas[0].text()).toContain("Ana");
    expect(tarjetas[0].text()).toContain("ana@test.com");
    expect(tarjetas[0].text()).toContain("Más colores");
    expect(tarjetas[1].text()).toContain("Un chat");
  });

  test("el círculo de la tarjeta lleva la inicial del nombre", () => {
    const wrapper = montar(SUGERENCIAS);
    const iniciales = wrapper.findAll(".admin-sugerencias__avatar").map((a) => a.text());

    expect(iniciales).toEqual(["A", "P"]);
  });

  test("la fecha se muestra como día-mes-año y hora", () => {
    const wrapper = montar(SUGERENCIAS);
    const fechas = wrapper.findAll(".admin-sugerencias__fecha").map((f) => f.text());

    expect(fechas).toEqual(["17-11-2026 · 22:15", "10-11-2026 · 09:05"]);
  });

  test("el rol sale en una píldora y la tarjeta lleva su color: familia verde y cuidadora naranja", () => {
    const wrapper = montar(SUGERENCIAS);
    const tarjetas = wrapper.findAll(".admin-sugerencias__tarjeta");

    expect(wrapper.find(".admin-pildora--verde").text()).toBe("Familia");
    expect(wrapper.find(".admin-pildora--naranja").text()).toBe("Persona cuidadora");
    expect(tarjetas[0].classes()).toContain("admin-sugerencias__tarjeta--verde");
    expect(tarjetas[1].classes()).toContain("admin-sugerencias__tarjeta--naranja");
  });

  test("los botones del filtro llevan el contador de cada grupo", () => {
    const wrapper = montar(SUGERENCIAS);

    expect(botonFiltro(wrapper, "Todas").text()).toContain("2");
    expect(botonFiltro(wrapper, "Familias").text()).toContain("1");
    expect(botonFiltro(wrapper, "Personas cuidadoras").text()).toContain("1");
  });

  test("filtrar por Familias deja solo las sugerencias de familias", async () => {
    const wrapper = montar(SUGERENCIAS);

    await botonFiltro(wrapper, "Familias").trigger("click");

    const tarjetas = wrapper.findAll(".admin-sugerencias__tarjeta");
    expect(tarjetas).toHaveLength(1);
    expect(tarjetas[0].text()).toContain("Ana");
    expect(wrapper.find(".admin-sugerencias__pie").text()).toBe("1 sugerencia");
  });

  test("el buscador filtra por nombre, por email y por texto sin mirar mayúsculas", async () => {
    const wrapper = montar(SUGERENCIAS);
    const buscador = wrapper.find(".admin-sugerencias__buscador");

    await buscador.setValue("PEPE");
    expect(wrapper.findAll(".admin-sugerencias__tarjeta")).toHaveLength(1);

    await buscador.setValue("ana@test");
    expect(wrapper.findAll(".admin-sugerencias__tarjeta")).toHaveLength(1);
    expect(wrapper.find(".admin-sugerencias__tarjeta").text()).toContain("Ana");

    await buscador.setValue("un chat");
    expect(wrapper.find(".admin-sugerencias__tarjeta").text()).toContain("Pepe");
  });

  test("si nada coincide con la búsqueda lo avisa", async () => {
    const wrapper = montar(SUGERENCIAS);

    await wrapper.find(".admin-sugerencias__buscador").setValue("zzz");

    expect(wrapper.text()).toContain("Ninguna sugerencia coincide con la búsqueda.");
    expect(wrapper.findAll(".admin-sugerencias__tarjeta")).toHaveLength(0);
  });

  test("el pie cuenta las sugerencias, en singular y en plural", () => {
    expect(montar(SUGERENCIAS).find(".admin-sugerencias__pie").text()).toBe("2 sugerencias");
    expect(montar([SUGERENCIAS[0]]).find(".admin-sugerencias__pie").text()).toBe("1 sugerencia");
  });

  test("sin sugerencias avisa y no pinta tarjetas", () => {
    const wrapper = montar([]);

    expect(wrapper.text()).toContain("Todavía no hay sugerencias.");
    expect(wrapper.findAll(".admin-sugerencias__tarjeta")).toHaveLength(0);
  });
});
