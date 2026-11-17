import { describe, test, expect } from "vitest";
import { ordenarPagos, sumarImportes } from "../../utils/resumenPagos";

function crearPago(id, estado, fecha, importe) {
  return { id: id, estado: estado, fecha: fecha, importe: importe };
}

describe("ordenarPagos", () => {
  test("pone los pendientes arriba aunque sean más antiguos", () => {
    const pagos = [
      crearPago(1, "COMPLETADO", "2026-11-10", 18),
      crearPago(2, "PENDIENTE", "2026-09-01", 36),
    ];

    const ordenados = ordenarPagos(pagos);

    expect(ordenados[0].id).toBe(2);
    expect(ordenados[1].id).toBe(1);
  });

  test("dentro de cada grupo van primero los más recientes", () => {
    const pagos = [
      crearPago(1, "COMPLETADO", "2026-08-01", 18),
      crearPago(2, "COMPLETADO", "2026-10-01", 18),
      crearPago(3, "PENDIENTE", "2026-09-01", 18),
      crearPago(4, "PENDIENTE", "2026-11-01", 18),
    ];

    const ordenados = ordenarPagos(pagos);

    expect(ordenados.map((pago) => pago.id)).toEqual([4, 3, 2, 1]);
  });

  test("los cancelados quedan con los pagados, por fecha", () => {
    const pagos = [
      crearPago(1, "CANCELADO", "2026-10-01", 18),
      crearPago(2, "COMPLETADO", "2026-11-01", 18),
      crearPago(3, "PENDIENTE", "2026-08-01", 18),
    ];

    const ordenados = ordenarPagos(pagos);

    expect(ordenados.map((pago) => pago.id)).toEqual([3, 2, 1]);
  });

  test("no cambia la lista original", () => {
    const pagos = [
      crearPago(1, "COMPLETADO", "2026-11-10", 18),
      crearPago(2, "PENDIENTE", "2026-09-01", 36),
    ];

    ordenarPagos(pagos);

    expect(pagos[0].id).toBe(1);
    expect(pagos[1].id).toBe(2);
  });

  test("con una lista vacía devuelve una lista vacía", () => {
    expect(ordenarPagos([])).toEqual([]);
  });
});

describe("sumarImportes", () => {
  test("suma solo los pagos del estado pedido", () => {
    const pagos = [
      crearPago(1, "COMPLETADO", "2026-11-10", 90),
      crearPago(2, "COMPLETADO", "2026-11-11", 10.5),
      crearPago(3, "PENDIENTE", "2026-11-12", 36),
      crearPago(4, "CANCELADO", "2026-11-13", 50),
    ];

    expect(sumarImportes(pagos, "COMPLETADO")).toBe(100.5);
    expect(sumarImportes(pagos, "PENDIENTE")).toBe(36);
  });

  test("con una lista vacía devuelve 0", () => {
    expect(sumarImportes([], "COMPLETADO")).toBe(0);
  });

  test("si ningún pago está en ese estado devuelve 0", () => {
    const pagos = [crearPago(1, "PENDIENTE", "2026-11-10", 18)];

    expect(sumarImportes(pagos, "COMPLETADO")).toBe(0);
  });

  test("no arrastra errores de decimales", () => {
    const pagos = [
      crearPago(1, "COMPLETADO", "2026-11-10", 0.1),
      crearPago(2, "COMPLETADO", "2026-11-11", 0.2),
    ];

    expect(sumarImportes(pagos, "COMPLETADO")).toBe(0.3);
  });
});
