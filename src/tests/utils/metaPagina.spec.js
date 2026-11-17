import { describe, test, expect, beforeEach } from "vitest";
import {
  NOMBRE_WEB,
  DESCRIPCION_POR_DEFECTO,
  tituloDePagina,
  aplicarMeta,
} from "../../utils/metaPagina";

describe("tituloDePagina", () => {
  test("une el título de la página con el nombre de la web", () => {
    expect(tituloDePagina("Aviso legal")).toBe("Aviso legal · Acompáñame");
  });

  test("sin título deja solo el nombre de la web", () => {
    expect(tituloDePagina(undefined)).toBe(NOMBRE_WEB);
  });
});

describe("aplicarMeta", () => {
  beforeEach(() => {
    document.head.innerHTML = '<meta name="description" content="antigua" />';
    document.title = "";
  });

  test("pone el título y la descripción de la página", () => {
    aplicarMeta({ titulo: "Términos y condiciones", descripcion: "Texto nuevo" });

    expect(document.title).toBe("Términos y condiciones · Acompáñame");
    expect(
      document.querySelector('meta[name="description"]').getAttribute("content"),
    ).toBe("Texto nuevo");
  });

  test("sin descripción usa la de por defecto", () => {
    aplicarMeta({ titulo: "Mis pagos" });

    expect(
      document.querySelector('meta[name="description"]').getAttribute("content"),
    ).toBe(DESCRIPCION_POR_DEFECTO);
  });

  test("si la página no tiene la etiqueta de descripción no falla", () => {
    document.head.innerHTML = "";

    aplicarMeta({ titulo: "Mis pagos" });

    expect(document.title).toBe("Mis pagos · Acompáñame");
  });
});
