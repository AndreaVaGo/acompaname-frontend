import { describe, test, expect } from "vitest";
import { readFileSync } from "node:fs";

// Diseño de cristal en la pantalla Mi calendario
const calendario = readFileSync("src/views/caregiver/MiCalendarioView.vue", "utf-8");
const mensual = readFileSync("src/components/CalendarioMensual.vue", "utf-8");

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

describe("CalendarioMensual · diseño", () => {
  test("hoy lleva el número en un círculo coral", () => {
    expect(mensual).toContain(".calendario-mensual__dia--hoy .calendario-mensual__numero");
    expect(mensual).toContain("border-radius: 50%");
  });

  test("los días se levantan al pasar el ratón, solo con ratón", () => {
    expect(mensual).toContain("@media (hover: hover)");
    expect(mensual).toContain("transform: translateY(-2px)");
  });

  test("las flechas y el botón Hoy se rellenan de coral al pasar el ratón", () => {
    const flecha = mensual.slice(mensual.indexOf(".calendario-mensual__flecha:hover"));
    const hoy = mensual.slice(mensual.indexOf(".calendario-mensual__hoy:hover"));

    expect(flecha.slice(0, 120)).toContain("background-color: var(--color-accent)");
    expect(hoy.slice(0, 120)).toContain("background-color: var(--color-accent)");
  });

  test("el día abierto conserva su aro aunque se pase el ratón", () => {
    expect(mensual).toContain(".calendario-mensual__dia--seleccionado:hover");
  });
});
