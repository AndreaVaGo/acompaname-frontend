import { describe, test, expect } from "vitest";
import { formatearFecha } from "../../utils/formatearFecha";

describe("formatearFecha", () => {
  test("pone la fecha en formato día-mes-año", () => {
    expect(formatearFecha("2026-10-21")).toBe("21-10-2026");
  });

  test("mantiene los ceros de los días y meses de una cifra", () => {
    expect(formatearFecha("2026-08-05")).toBe("05-08-2026");
  });

  test("devuelve texto vacío si no hay fecha", () => {
    expect(formatearFecha(null)).toBe("");
    expect(formatearFecha(undefined)).toBe("");
    expect(formatearFecha("")).toBe("");
  });
});