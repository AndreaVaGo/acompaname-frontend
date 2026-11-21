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

  // Si la columna fuera 1fr, las pestañas del móvil estirarían la página y se cortaría por la derecha
  test("la columna del contenido no crece más que la pantalla (minmax(0, 1fr))", () => {
    expect(vista).toContain("grid-template-columns: 200px minmax(0, 1fr)");
    expect(vista).toContain("grid-template-columns: minmax(0, 1fr)");
    expect(vista).not.toMatch(/grid-template-columns: 1fr;/);
  });

  test("el menú de pestañas del móvil se puede encoger y hace scroll por dentro", () => {
    const movil = menu.slice(menu.indexOf("@media (max-width: 768px)"));

    expect(movil).toContain("overflow-x: auto");
    expect(movil).toContain("min-width: 0");
  });

  test("la barra de desplazamiento de las pestañas es fina y del color del panel", () => {
    const movil = menu.slice(menu.indexOf("@media (max-width: 768px)"));

    expect(movil).toContain("scrollbar-width: thin");
    expect(movil).toContain("scrollbar-color: var(--color-secondary) transparent");
  });
});

// Las secciones con tabla, listas y gráficas ya no son cajas blancas lisas
const SECCIONES = [
  "AdminSolicitudes",
  "AdminUsuarios",
  "AdminSugerencias",
  "AdminPagosTabla",
  "AdminPagos",
  "AdminPagosMeses",
  "AdminPagosBarras",
  "AdminCuidadores",
  "AdminValoraciones",
  "AdminBarras",
];
const estilosTabla = readFileSync("src/styles/adminTabla.css", "utf-8");

describe("Panel de administración · secciones de cristal", () => {
  test.each(SECCIONES)("%s lleva la clase admin-panel y su color de sección", (nombre) => {
    const codigo = readFileSync(`src/components/admin/${nombre}.vue`, "utf-8");
    const plantilla = codigo.slice(codigo.indexOf("<template>"), codigo.indexOf("</template>"));

    expect(plantilla).toContain("admin-panel");
    expect(codigo).toContain("--admin-color:");
  });

  test.each(SECCIONES)("%s ya no pinta la caja de blanco liso", (nombre) => {
    const codigo = readFileSync(`src/components/admin/${nombre}.vue`, "utf-8");
    const estilo = codigo.slice(codigo.indexOf("<style"));
    const primeraRegla = estilo.slice(estilo.indexOf("{"), estilo.indexOf("}"));

    expect(primeraRegla).not.toContain("--color-white");
    expect(primeraRegla).not.toContain("box-shadow");
  });

  test("admin-panel es de cristal: transparencia, desenfoque y borde de color", () => {
    const bloque = estilosTabla.slice(estilosTabla.indexOf(".admin-panel {"));

    expect(bloque).toContain("backdrop-filter: blur(10px)");
    expect(bloque).toContain("rgba(255, 255, 255, 0.78)");
    expect(bloque).toContain("border-top: 4px solid var(--admin-color");
  });

  test("las tablas del panel tienen cabecera con color y filas que se iluminan", () => {
    expect(estilosTabla).toContain(".admin-panel .admin-tabla th {");
    expect(estilosTabla).toContain(".admin-panel .admin-tabla tbody tr:hover td");
  });

  test("cada fila de las tablas es una tarjeta suelta con hueco entre ellas", () => {
    expect(estilosTabla).toContain("border-spacing: 0 10px");
    expect(estilosTabla).toContain(".admin-panel .admin-tabla td:first-child {");
    expect(estilosTabla).toContain("border-left: 5px solid var(--admin-color");
  });

  test("las tarjetas de sugerencias son de cristal claro", () => {
    const codigo = readFileSync("src/components/admin/AdminSugerencias.vue", "utf-8");

    expect(codigo).toContain("background-color: rgba(255, 255, 255, 0.7)");
  });

  test("si el usuario reduce el movimiento, el panel no se anima", () => {
    expect(estilosTabla).toMatch(/prefers-reduced-motion: reduce\) \{\s+\.admin-panel \{\s+animation: none/);
  });
});
