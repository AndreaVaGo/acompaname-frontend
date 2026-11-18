import { describe, test, expect } from "vitest";
import {
  horasDeCuidado,
  estimarImporte,
  recargoAplicable,
  RECARGO_PERSONA_EXTRA,
} from "../../utils/estimacionImporte";

describe("horasDeCuidado", () => {
  test("de 10:00 a 14:00 el mismo día son 4 horas", () => {
    expect(horasDeCuidado("2026-12-15", "10:00", "", "14:00")).toBe(4);
  });

  test("una fracción de hora cuenta como hora entera", () => {
    expect(horasDeCuidado("2026-12-15", "10:00", "", "12:30")).toBe(3);
  });

  test("un cuidado de pocos minutos cuenta como una hora", () => {
    expect(horasDeCuidado("2026-12-15", "10:00", "", "10:20")).toBe(1);
  });

  test("varios días cuentan desde la hora de inicio hasta la hora de fin", () => {
    expect(horasDeCuidado("2026-12-15", "20:00", "2026-12-16", "08:00")).toBe(12);
  });

  test("el cambio de hora de verano no suma ni resta horas", () => {
    // 2027-03-28 es el día del cambio de hora en España: sigue contando 24 horas
    expect(horasDeCuidado("2027-03-28", "00:00", "2027-03-29", "00:00")).toBe(24);
  });

  test("sin fecha o sin horas devuelve 0", () => {
    expect(horasDeCuidado("", "10:00", "", "14:00")).toBe(0);
    expect(horasDeCuidado("2026-12-15", "", "", "14:00")).toBe(0);
    expect(horasDeCuidado("2026-12-15", "10:00", "", "")).toBe(0);
  });

  test("si la hora de fin es anterior a la de inicio devuelve 0", () => {
    expect(horasDeCuidado("2026-12-15", "14:00", "", "10:00")).toBe(0);
  });

  test("si es la misma hora devuelve 0", () => {
    expect(horasDeCuidado("2026-12-15", "10:00", "", "10:00")).toBe(0);
  });
});

describe("estimarImporte", () => {
  test("una persona es horas por tarifa", () => {
    const resultado = estimarImporte(15, 4, 1);

    expect(resultado.total).toBe(60);
    expect(resultado.base).toBe(60);
    expect(resultado.recargo).toBe(0);
    expect(resultado.personasExtra).toBe(0);
  });

  test("cada persona extra suma el recargo", () => {
    const resultado = estimarImporte(15, 4, 3);

    // 4 x 15 = 60 y dos personas extra: 60 x 0,25 x 2 = 30
    expect(resultado.personasExtra).toBe(2);
    expect(resultado.recargo).toBe(30);
    expect(resultado.total).toBe(90);
  });

  test("el recargo coincide con el del servidor (25 %)", () => {
    expect(RECARGO_PERSONA_EXTRA).toBe(0.25);
    expect(estimarImporte(15, 4, 2).recargoPorcentaje).toBe(25);
  });

  test("la tarifa puede llegar como texto", () => {
    expect(estimarImporte("18.00", 4, 1).total).toBe(72);
  });

  test("se redondea a dos decimales", () => {
    expect(estimarImporte(14.555, 3, 1).total).toBe(43.67);
  });

  test("sin tarifa devuelve null", () => {
    expect(estimarImporte(0, 4, 1)).toBeNull();
    expect(estimarImporte(undefined, 4, 1)).toBeNull();
  });

  test("sin horas devuelve null", () => {
    expect(estimarImporte(15, 0, 1)).toBeNull();
  });

  test("con un número de personas raro no baja del precio base", () => {
    expect(estimarImporte(15, 4, 0).total).toBe(60);
  });

describe("recargoAplicable", () => {
  test("sin recargo propio se usa el de por defecto", () => {
    expect(recargoAplicable(null)).toBe(RECARGO_PERSONA_EXTRA);
    expect(recargoAplicable(undefined)).toBe(RECARGO_PERSONA_EXTRA);
    expect(recargoAplicable("")).toBe(RECARGO_PERSONA_EXTRA);
  });

  test("el recargo propio va en porcentaje y se pasa a fracción", () => {
    expect(recargoAplicable(30)).toBe(0.3);
    expect(recargoAplicable(0)).toBe(0);
    expect(recargoAplicable(100)).toBe(1);
  });

  test("un recargo no válido se ignora y se usa el de por defecto", () => {
    expect(recargoAplicable(150)).toBe(RECARGO_PERSONA_EXTRA);
    expect(recargoAplicable(-5)).toBe(RECARGO_PERSONA_EXTRA);
    expect(recargoAplicable("abc")).toBe(RECARGO_PERSONA_EXTRA);
  });

  test("estimarImporte usa el recargo propio cuando se le pasa", () => {
    const desglose = estimarImporte(15, 4, 3, 50);

    expect(desglose.recargoPorcentaje).toBe(50);
    // 4 x 15 x (1 + 0,5 x 2) = 120
    expect(desglose.total).toBe(120);
  });
});
});
