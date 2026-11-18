import { describe, test, expect } from "vitest";
import { textoDesglose } from "../../utils/desglosePago";

describe("textoDesglose", () => {
  test("una hora y una persona va en singular", () => {
    expect(textoDesglose({ horas: 1, personas: 1 })).toBe("1 hora · 1 persona");
  });

  test("varias horas y varias personas indican cuántas llevan recargo", () => {
    expect(textoDesglose({ horas: 4, personas: 3 })).toBe(
      "4 horas · 3 personas (2 con recargo)",
    );
  });

  test("sin personas se cuenta una sola", () => {
    expect(textoDesglose({ horas: 2 })).toBe("2 horas · 1 persona");
  });

  test("sin horas (pago antiguo) no devuelve nada", () => {
    expect(textoDesglose({ importe: 50 })).toBe("");
    expect(textoDesglose(null)).toBe("");
  });
});
