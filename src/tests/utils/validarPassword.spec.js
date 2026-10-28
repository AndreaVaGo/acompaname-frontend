import { describe, test, expect } from "vitest";
import {
  requisitosQueFaltan,
  mensajePassword,
} from "../../utils/validarPassword";

describe("requisitosQueFaltan", () => {
  test("una contraseña que cumple todo no tiene requisitos pendientes", () => {
    expect(requisitosQueFaltan("Segura123!")).toEqual([]);
  });

  test("acepta justo 8 caracteres", () => {
    expect(requisitosQueFaltan("Abcdef1!")).toEqual([]);
  });

  test("acepta justo 72 caracteres", () => {
    const password = "Aa1!" + "a".repeat(68);

    expect(password.length).toBe(72);
    expect(requisitosQueFaltan(password)).toEqual([]);
  });

  test("avisa si tiene menos de 8 caracteres", () => {
    expect(requisitosQueFaltan("Ab1!")).toEqual(["al menos 8 caracteres"]);
  });

  test("avisa si tiene más de 72 caracteres", () => {
    const password = "Aa1!" + "a".repeat(69);

    expect(requisitosQueFaltan(password)).toEqual(["como máximo 72 caracteres"]);
  });

  test("avisa si falta la mayúscula", () => {
    expect(requisitosQueFaltan("abcdefg1!")).toEqual(["una letra mayúscula"]);
  });

  test("avisa si falta la minúscula", () => {
    expect(requisitosQueFaltan("ABCDEFG1!")).toEqual(["una letra minúscula"]);
  });

  test("avisa si falta el número", () => {
    expect(requisitosQueFaltan("Abcdefgh!")).toEqual(["un número"]);
  });

  test("avisa si falta el carácter especial", () => {
    expect(requisitosQueFaltan("Abcdefg12")).toEqual([
      "un carácter especial (por ejemplo ! @ # $ %)",
    ]);
  });

  test("avisa de todos los requisitos que faltan a la vez", () => {
    // "abc" tiene solo minúsculas: faltan longitud, mayúscula, número y carácter especial
    expect(requisitosQueFaltan("abc")).toEqual([
      "al menos 8 caracteres",
      "una letra mayúscula",
      "un número",
      "un carácter especial (por ejemplo ! @ # $ %)",
    ]);
  });

  test("una contraseña vacía incumple todos los requisitos menos el máximo", () => {
    expect(requisitosQueFaltan("")).toHaveLength(5);
  });
});

describe("mensajePassword", () => {
  test("devuelve texto vacío si la contraseña es válida", () => {
    expect(mensajePassword("Segura123!")).toBe("");
  });

  test("lista los requisitos que faltan", () => {
    expect(mensajePassword("abcdefgh")).toBe(
      "La contraseña debe tener: una letra mayúscula, un número, un carácter especial (por ejemplo ! @ # $ %).",
    );
  });
});