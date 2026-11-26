import { describe, test, expect } from "vitest";
import {
  validarCambioPassword,
  ORDEN_CAMBIO_PASSWORD,
} from "@/utils/validarCambioPassword";

const VALIDOS = {
  passwordActual: "1234",
  passwordNueva: "Nueva12345!",
  passwordRepetida: "Nueva12345!",
};

describe("validarCambioPassword", () => {
  test("con datos correctos no hay errores (la actual puede ser débil)", () => {
    expect(validarCambioPassword(VALIDOS)).toEqual({});
  });

  test("con todo vacío falla cada campo", () => {
    const errores = validarCambioPassword({
      passwordActual: "",
      passwordNueva: "",
      passwordRepetida: "",
    });
    expect(Object.keys(errores)).toEqual(ORDEN_CAMBIO_PASSWORD);
    expect(errores.passwordActual).toBe("Escribe tu contraseña actual.");
    expect(errores.passwordNueva).toBe("Escribe la contraseña nueva.");
    expect(errores.passwordRepetida).toBe("Repite la contraseña nueva.");
  });

  test("una contraseña nueva débil dice qué le falta", () => {
    const errores = validarCambioPassword({
      ...VALIDOS,
      passwordNueva: "nueva12345",
      passwordRepetida: "nueva12345",
    });
    expect(errores.passwordNueva).toContain("una letra mayúscula");
    expect(errores.passwordNueva).toContain("un carácter especial");
    expect(errores.passwordRepetida).toBeUndefined();
  });

  test("si no coinciden, el error va en la repetición", () => {
    const errores = validarCambioPassword({
      ...VALIDOS,
      passwordRepetida: "Otra123456!",
    });
    expect(errores.passwordRepetida).toBe(
      "Las contraseñas nuevas no coinciden.",
    );
    expect(Object.keys(errores)).toEqual(["passwordRepetida"]);
  });
});
