import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";

// Diseño de cristal en la pantalla Mi calendario
const calendario = readFileSync("src/views/caregiver/MiCalendarioView.vue", "utf-8");

describe("MiCalendarioView · diseño", () => {
  test("usa el fondo animado global y no pone fondo propio en el contenedor", () => {
    const bloque = calendario.slice(
      calendario.indexOf(".calendario {"),
      calendario.indexOf(".calendario__wrapper"),
    );

    expect(calendario).toContain('class="calendario pantalla"');
    expect(bloque).not.toContain("background-color");
  });

  test("el calendario, el día abierto y los formularios son tarjetas de cristal", () => {
    expect(calendario).toContain('class="calendario__box tarjeta-cristal"');
    expect(calendario).toContain('class="calendario__detalle tarjeta-cristal"');
    expect(calendario.match(/calendario__box calendario__box--formulario tarjeta-cristal/g).length).toBe(2);
  });

  test("las tarjetas con formulario no se levantan al pasar el ratón", () => {
    const bloque = calendario.slice(calendario.indexOf(".calendario__box--formulario:hover"));

    expect(bloque.slice(0, 100)).toContain("transform: none");
  });

  test("los servicios aceptados van en verde y los ratos ocupados en azul", () => {
    const servicio = calendario.slice(calendario.indexOf(".calendario__servicio {"));

    expect(servicio.slice(0, 250)).toContain("border-left: 4px solid var(--color-secondary)");
    expect(calendario).toContain('content: "✔ "');
    expect(calendario).toContain('content: "⏸ "');
  });
});
