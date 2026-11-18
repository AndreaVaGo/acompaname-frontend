import { describe, test, expect } from "vitest";
import { unirMensajes, ultimoId, fechaDeMensaje } from "../../utils/chat";

describe("unirMensajes", () => {
  test("añade los mensajes nuevos al final", () => {
    const resultado = unirMensajes([{ id: 1 }], [{ id: 2 }, { id: 3 }]);
    expect(resultado.map((m) => m.id)).toEqual([1, 2, 3]);
  });

  test("no repite un mensaje que ya estaba", () => {
    const resultado = unirMensajes([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 3 }]);
    expect(resultado.map((m) => m.id)).toEqual([1, 2, 3]);
  });

  test("ordena por id aunque lleguen desordenados", () => {
    const resultado = unirMensajes([{ id: 5 }], [{ id: 2 }, { id: 9 }]);
    expect(resultado.map((m) => m.id)).toEqual([2, 5, 9]);
  });

  test("con listas vacías devuelve una lista vacía", () => {
    expect(unirMensajes([], [])).toEqual([]);
  });

  test("no modifica la lista original", () => {
    const actuales = [{ id: 1 }];
    unirMensajes(actuales, [{ id: 2 }]);
    expect(actuales).toHaveLength(1);
  });
});

describe("ultimoId", () => {
  test("devuelve null si no hay mensajes", () => {
    expect(ultimoId([])).toBeNull();
  });

  test("devuelve el id mayor", () => {
    expect(ultimoId([{ id: 3 }, { id: 8 }, { id: 5 }])).toBe(8);
  });

  test("con un solo mensaje devuelve su id", () => {
    expect(ultimoId([{ id: 4 }])).toBe(4);
  });
});

describe("fechaDeMensaje", () => {
  test("muestra día-mes-año y la hora sin segundos", () => {
    expect(fechaDeMensaje("2026-11-18T10:05:30")).toBe("18-11-2026 · 10:05");
  });

  test("si no hay fecha devuelve texto vacío", () => {
    expect(fechaDeMensaje(null)).toBe("");
    expect(fechaDeMensaje("")).toBe("");
  });
});
