import { describe, test, expect } from "vitest";
import { formatearHora, formatearMomento } from "../../utils/formatearHora";

describe("formatearHora", () => {
  test("quita los segundos de la hora que manda el back", () => {
    expect(formatearHora("09:00:00")).toBe("09:00");
    expect(formatearHora("18:30:00")).toBe("18:30");
  });

  test("deja igual una hora que ya viene sin segundos", () => {
    expect(formatearHora("09:00")).toBe("09:00");
  });

  test("sin hora devuelve un texto vacío", () => {
    expect(formatearHora(null)).toBe("");
    expect(formatearHora(undefined)).toBe("");
    expect(formatearHora("")).toBe("");
  });
});

describe("formatearMomento", () => {
  test("junta la fecha y la hora", () => {
    expect(formatearMomento("2026-10-21", "09:00:00")).toBe("21-10-2026 · 09:00");
  });

  test("sin hora enseña solo la fecha", () => {
    expect(formatearMomento("2026-10-21", null)).toBe("21-10-2026");
  });
});
