import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";

// Las solicitudes y los pagos usan el fondo y las tarjetas de cristal globales (base.css)
const tarjeta = readFileSync("src/components/SolicitudCard.vue", "utf-8");
const solicitudesFamilia = readFileSync("src/views/family/SolicitudesFamiliaView.vue", "utf-8");
const solicitudesCuidador = readFileSync("src/views/caregiver/SolicitudesCuidadorView.vue", "utf-8");
const pagos = readFileSync("src/views/family/PagosView.vue", "utf-8");

describe("solicitudes · diseño de cristal", () => {
  test("las dos pantallas de solicitudes usan el fondo global", () => {
    expect(solicitudesFamilia).toContain('class="solicitudes pantalla"');
    expect(solicitudesCuidador).toContain('class="solicitudes pantalla"');
  });

  test("las tarjetas de las dos pantallas entran una tras otra y siguen al ratón", () => {
    for (const vista of [solicitudesFamilia, solicitudesCuidador]) {
      expect(vista).toContain(":style=\"{ '--i': Math.min(indice, 8) }\"");
      expect(vista).toContain('@mousemove="moverFoco"');
    }
  });

  test("la tarjeta de solicitud usa la clase global de cristal", () => {
    expect(tarjeta).toContain('class="solicitudes__card tarjeta-cristal"');
  });

  test("el color de la línea de arriba depende del estado", () => {
    expect(tarjeta).toContain("--borde-tarjeta: var(--color-accent)");
    expect(tarjeta).toContain("--borde-tarjeta: var(--color-secondary)");
    expect(tarjeta).toContain("--borde-tarjeta: var(--color-info)");
  });

  test("la ventana de detalles no se rompe: sin backdrop-filter ni overflow oculto", () => {
    expect(tarjeta).toContain("backdrop-filter: none");
    expect(tarjeta).toContain("overflow: visible");
  });

  test("con la ventana abierta la tarjeta no se mueve ni al pasar el ratón", () => {
    const bloque = tarjeta.slice(tarjeta.indexOf(".solicitudes__card.solicitudes__card--abierta"));

    expect(bloque).toContain(".solicitudes__card--abierta:hover");
    expect(bloque.slice(0, 250)).toContain("transform: none");
  });
});

describe("pagos · diseño de cristal", () => {
  test("la pantalla usa el fondo global", () => {
    expect(pagos).toContain('class="pagos pantalla"');
  });

  test("los totales, el aviso de vacío y cada pago son tarjetas de cristal", () => {
    expect(pagos).toContain("pagos__total pagos__total--pendiente tarjeta-cristal");
    expect(pagos).toContain("pagos__total pagos__total--pagado tarjeta-cristal");
    expect(pagos).toContain("pagos__vacio tarjeta-cristal");
    expect(pagos).toContain("pagos__tarjeta tarjeta-cristal");
  });

  test("las tarjetas de pago entran una tras otra y siguen al ratón", () => {
    expect(pagos).toContain(":style=\"{ '--i': Math.min(indice + 2, 8) }\"");
    expect(pagos).toContain('@mousemove="moverFoco"');
  });

  test("la línea de arriba de los pagos pendientes va en coral", () => {
    expect(pagos).toContain("--borde-tarjeta: var(--color-accent)");
  });
});

describe("ventana de detalles de la solicitud · botones de cerrar", () => {
  test("la X de arriba es un círculo coral que gira al pasar el ratón", () => {
    const bloque = tarjeta.slice(tarjeta.indexOf(".solicitudes__cerrar:hover"));

    expect(tarjeta).toContain("border-radius: 50%");
    expect(bloque.slice(0, 150)).toContain("background-color: var(--color-accent)");
    expect(bloque.slice(0, 150)).toContain("rotate(90deg)");
  });

  test("el botón Cerrar de abajo tiene borde coral y se rellena al pasar el ratón", () => {
    const base = tarjeta.slice(tarjeta.indexOf(".solicitudes__cerrar-btn {"));
    const hover = tarjeta.slice(tarjeta.indexOf(".solicitudes__cerrar-btn:hover"));

    expect(base.slice(0, 300)).toContain("border: 2px solid var(--color-accent)");
    expect(hover.slice(0, 150)).toContain("background-color: var(--color-accent)");
  });

  test("la ventana lleva una línea coral arriba y entra suavemente", () => {
    expect(tarjeta).toContain("@keyframes ventana-entra");
    expect(tarjeta).toContain("animation: ventana-entra");
  });
});
