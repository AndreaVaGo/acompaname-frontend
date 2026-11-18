import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import CintaDeCuidados from "../../components/animation/CintaDeCuidados.vue";
import { GRUPOS } from "../../utils/catalogoGrupos";

const archivo = readFileSync("src/components/animation/CintaDeCuidados.vue", "utf-8");

describe("CintaDeCuidados", () => {
  test("enseña dónde se cuida y todos los grupos de edad", () => {
    const texto = mount(CintaDeCuidados).text();

    expect(texto).toContain("En el hospital");
    expect(texto).toContain("En casa");
    for (const grupo of GRUPOS) {
      expect(texto).toContain(grupo.nombre);
    }
  });

  test("tiene dos listas iguales para que el bucle no se note", () => {
    const listas = mount(CintaDeCuidados).findAll("ul");

    expect(listas.length).toBe(2);
    expect(listas[0].findAll("li").length).toBe(listas[1].findAll("li").length);
  });

  test("la segunda copia no la leen los lectores de pantalla", () => {
    const listas = mount(CintaDeCuidados).findAll("ul");

    expect(listas[0].attributes("aria-hidden")).toBeUndefined();
    expect(listas[1].attributes("aria-hidden")).toBe("true");
  });

  test("la sección tiene una etiqueta que la describe", () => {
    const seccion = mount(CintaDeCuidados).find("section");

    expect(seccion.attributes("aria-label")).toContain("hospital");
  });

  test("se para al pasar el ratón", () => {
    expect(archivo).toContain(".cinta:hover .cinta__pista");
    expect(archivo).toContain("animation-play-state: paused");
  });

  test("con reducir movimiento no se mueve y se oculta la copia", () => {
    const bloque = archivo.slice(archivo.indexOf("@media (prefers-reduced-motion: reduce)"));

    expect(bloque).toContain("animation: none");
    expect(bloque).toContain('.cinta__lista[aria-hidden="true"]');
  });
});
