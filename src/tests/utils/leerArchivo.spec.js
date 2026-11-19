import { describe, test, expect } from "vitest";
import { leerTexto } from "../../utils/leerArchivo";

describe("leerTexto", () => {
  test("usa archivo.text() cuando existe", async () => {
    const archivo = { text: async () => "BEGIN:VCALENDAR" };

    expect(await leerTexto(archivo)).toBe("BEGIN:VCALENDAR");
  });

  test("si el archivo no tiene text(), lo lee con FileReader", async () => {
    const archivo = new Blob(["hola calendario"]);
    Object.defineProperty(archivo, "text", { value: undefined });

    expect(await leerTexto(archivo)).toBe("hola calendario");
  });
});
