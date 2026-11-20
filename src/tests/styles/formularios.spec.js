import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";

// Diseño de los formularios y de las tarjetas de solicitudes
const base = readFileSync("src/styles/base.css", "utf-8");
const tarjeta = readFileSync("src/components/SolicitudCard.vue", "utf-8");

describe("formularios · diseño", () => {
  test("los campos cambian de borde con suavidad al enfocar y al pasar el ratón", () => {
    expect(base).toContain("border-color var(--dur-fast) var(--ease-out)");
    expect(base).toContain("select:hover");
    expect(base).toContain("border-color: var(--color-text-muted)");
  });

  test("las casillas y los círculos usan el verde de la marca", () => {
    expect(base).toContain("accent-color: var(--color-secondary)");
  });
});

describe("SolicitudCard · diseño", () => {
  test("la entrada, la elevación al pasar el ratón y reducir movimiento vienen de la clase global", () => {
    // La animación, la sombra y el reducir movimiento están en base.css (probados en pantallaCristal.spec.js)
    expect(tarjeta).toContain('class="solicitudes__card tarjeta-cristal"');
    expect(base).toContain("animation: tarjeta-entra");
    expect(base).toContain("box-shadow: var(--shadow-card-hover)");
  });

  test("la tarjeta no usa cosas que romperían la ventana de detalles de dentro", () => {
    expect(tarjeta).toContain("backdrop-filter: none");
    expect(tarjeta).toContain("overflow: visible");
  });

  test("con la ventana abierta la tarjeta no se mueve", () => {
    const bloque = tarjeta.slice(tarjeta.indexOf(".solicitudes__card.solicitudes__card--abierta"));

    expect(bloque.slice(0, 250)).toContain("transform: none");
  });
});

describe("SolicitudCard · botón del chat", () => {
  test("el botón del chat usa el verde de la paleta y cambia al pasar el ratón", () => {
    expect(tarjeta).toContain(".solicitudes__chat-fila");
    expect(tarjeta).toContain("background-color: var(--color-secondary-bg)");
    expect(tarjeta).toContain("& .btn:hover");
  });
});
