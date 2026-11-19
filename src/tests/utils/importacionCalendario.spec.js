import { describe, test, expect } from "vitest";
import { resumenDeImportacion } from "../../utils/importacionCalendario";

describe("resumenDeImportacion", () => {
  test("cuenta los ratos que se han añadido", () => {
    const texto = resumenDeImportacion({ importados: 3, duplicados: 0, omitidos: 0 });

    expect(texto).toBe("Hemos añadido 3 ratos ocupados a tu calendario.");
  });

  test("con un solo rato habla en singular", () => {
    const texto = resumenDeImportacion({ importados: 1, duplicados: 0, omitidos: 0 });

    expect(texto).toBe("Hemos añadido 1 rato ocupado a tu calendario.");
  });

  test("si no se ha añadido nada lo dice", () => {
    const texto = resumenDeImportacion({ importados: 0, duplicados: 0, omitidos: 0 });

    expect(texto).toBe("No hemos añadido ningún rato nuevo.");
  });

  test("avisa de los que ya estaban, en singular y en plural", () => {
    expect(resumenDeImportacion({ importados: 0, duplicados: 1, omitidos: 0 })).toContain(
      "1 ya estaba en tu calendario.",
    );
    expect(resumenDeImportacion({ importados: 0, duplicados: 4, omitidos: 0 })).toContain(
      "4 ya estaban en tu calendario.",
    );
  });

  test("avisa de los eventos que se han dejado fuera y por qué", () => {
    const texto = resumenDeImportacion({ importados: 2, duplicados: 0, omitidos: 5 });

    expect(texto).toContain("Hemos dejado fuera 5");
    expect(texto).toContain("repetidos");
    expect(texto).toContain("cancelados");
  });

  test("junta todas las frases cuando hay de todo", () => {
    const texto = resumenDeImportacion({ importados: 2, duplicados: 1, omitidos: 3 });

    expect(texto).toBe(
      "Hemos añadido 2 ratos ocupados a tu calendario. 1 ya estaba en tu calendario. " +
        "Hemos dejado fuera 3 (eventos repetidos, cancelados, marcados como libres o ya pasados).",
    );
  });
});
