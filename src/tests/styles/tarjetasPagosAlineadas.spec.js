import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";

// Las cinco tarjetas de Pagos alinean el nombre, el número y el detalle aunque los títulos ocupen distintas líneas
describe("AdminPagosTarjetas · alineación", () => {
  const fuente = readFileSync("src/components/admin/AdminPagosTarjetas.vue", "utf-8");

  test("las tarjetas comparten las filas de la rejilla con subgrid", () => {
    const inicio = fuente.indexOf("@supports (grid-template-rows: subgrid)");

    expect(inicio).toBeGreaterThan(-1);
    const bloque = fuente.slice(inicio);
    expect(bloque).toContain("grid-row: span 3");
    expect(bloque).toContain("grid-template-rows: subgrid");
  });

  test("sin subgrid el nombre ocupa el hueco y el número queda abajo", () => {
    const inicio = fuente.indexOf(".admin-pagos-tarjetas__nombre {");

    expect(fuente.slice(inicio, fuente.indexOf("}", inicio))).toContain("flex: 1");
    expect(fuente).toContain("flex-direction: column");
  });
});
