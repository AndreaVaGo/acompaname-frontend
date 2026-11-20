import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";

// Diseño de cristal en el panel de administración
const vista = readFileSync("src/views/admin/AdminView.vue", "utf-8");
const menu = readFileSync("src/components/admin/AdminMenu.vue", "utf-8");
const tarjetas = readFileSync("src/components/admin/AdminTarjetas.vue", "utf-8");
const pagos = readFileSync("src/components/admin/AdminPagosTarjetas.vue", "utf-8");

describe("Panel de administración · diseño de cristal", () => {
  test("la vista usa el fondo animado y no pone fondo propio", () => {
    const bloque = vista.slice(vista.indexOf(".admin {"), vista.indexOf(".admin h1"));

    expect(vista).toContain('class="admin pantalla"');
    expect(bloque).not.toContain("background-color");
  });

  test("las tarjetas de resumen son de cristal y cada color tiene su velo", () => {
    expect(tarjetas).toContain("admin-tarjetas__tarjeta tarjeta-cristal");
    expect(tarjetas.match(/--tinte-tarjeta:/g).length).toBe(3);
    expect(pagos).toContain("admin-pagos-tarjetas__tarjeta tarjeta-cristal");
    expect(pagos.match(/--tinte-tarjeta:/g).length).toBe(3);
  });

  test("el menú lateral tiene fondo de cristal", () => {
    expect(menu).toContain("backdrop-filter: blur(10px)");
    expect(menu).toContain("rgba(255, 255, 255, 0.8)");
  });
});
