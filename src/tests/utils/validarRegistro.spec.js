import { describe, test, expect } from "vitest";
import { validarRegistro, ORDEN_REGISTRO } from "@/utils/validarRegistro";

const VALIDOS = {
  nombre: "Ana López",
  email: "ana@test.com",
  password: "Segura123!",
  passwordRepetida: "Segura123!",
  telefono: "600111222",
};

function con(cambios) {
  return validarRegistro({ ...VALIDOS, ...cambios });
}

describe("validarRegistro", () => {
  test("con datos correctos no hay errores", () => {
    expect(validarRegistro(VALIDOS)).toEqual({});
  });

  test("con todo vacío falla cada campo con su mensaje", () => {
    const errores = validarRegistro({
      nombre: "",
      email: "",
      password: "",
      passwordRepetida: "",
      telefono: "",
    });
    expect(Object.keys(errores)).toEqual(ORDEN_REGISTRO);
    expect(errores.nombre).toBe("Escribe tu nombre completo.");
    expect(errores.email).toBe("Escribe tu email.");
    expect(errores.password).toBe("Escribe una contraseña.");
    expect(errores.passwordRepetida).toBe("Repite la contraseña.");
    expect(errores.telefono).toBe("Escribe tu teléfono.");
  });

  test("un nombre o teléfono de solo espacios cuenta como vacío", () => {
    const errores = con({ nombre: "   ", telefono: "  " });
    expect(errores.nombre).toBeDefined();
    expect(errores.telefono).toBeDefined();
  });

  test("un email sin formato válido se rechaza", () => {
    expect(con({ email: "ana" }).email).toBe(
      "El email no tiene un formato válido.",
    );
    expect(con({ email: "ana@test" }).email).toBe(
      "El email no tiene un formato válido.",
    );
    expect(con({ email: "a na@test.com" }).email).toBe(
      "El email no tiene un formato válido.",
    );
  });

  test("una contraseña débil dice qué le falta", () => {
    const errores = con({ password: "abcdefgh", passwordRepetida: "abcdefgh" });
    expect(errores.password).toContain("una letra mayúscula");
    expect(errores.password).toContain("un número");
    expect(errores.passwordRepetida).toBeUndefined();
  });

  test("si las contraseñas no coinciden, el error va en la repetición", () => {
    const errores = con({ passwordRepetida: "Otra123!x" });
    expect(errores.passwordRepetida).toBe("Las contraseñas no coinciden.");
    expect(errores.password).toBeUndefined();
  });

  test("solo se marcan los campos que fallan", () => {
    expect(Object.keys(con({ telefono: "" }))).toEqual(["telefono"]);
  });
});
