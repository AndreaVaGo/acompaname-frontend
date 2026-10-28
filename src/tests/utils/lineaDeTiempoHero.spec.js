import { describe, test, expect } from "vitest";
import {
  DURACION,
  limitar,
  tramo,
  suave,
  rebote,
  visible,
  textoEdad,
  calcular,
} from "../../utils/lineaDeTiempoHero";

describe("funciones de ayuda", () => {
  test("limitar mantiene el número entre 0 y 1", () => {
    expect(limitar(-3)).toBe(0);
    expect(limitar(0.4)).toBe(0.4);
    expect(limitar(7)).toBe(1);
  });

  test("tramo da el progreso entre dos segundos", () => {
    expect(tramo(1, 2, 4)).toBe(0);
    expect(tramo(3, 2, 4)).toBe(0.5);
    expect(tramo(9, 2, 4)).toBe(1);
  });

  test("suave empieza en 0 y termina en 1", () => {
    expect(suave(0)).toBe(0);
    expect(suave(1)).toBe(1);
    expect(suave(0.5)).toBeGreaterThan(0.5);
  });

  test("rebote termina en 1 y se pasa un poco por el camino", () => {
    expect(rebote(0)).toBeCloseTo(0, 5);
    expect(rebote(1)).toBe(1);
    expect(rebote(0.7)).toBeGreaterThan(1);
  });

  test("visible aparece, se mantiene y desaparece", () => {
    expect(visible(0, 1, 2, 5, 6)).toBe(0);
    expect(visible(3, 1, 2, 5, 6)).toBe(1);
    expect(visible(7, 1, 2, 5, 6)).toBe(0);
  });
});

describe("textoEdad", () => {
  test.each([
    [0, ""],
    [7.3, "1"],
    [8, "12"],
    [8.6, "1"],
    [8.8, ""],
    [9.0, "8"],
    [10, "85"],
  ])("en el segundo %s se ve '%s'", (t, esperado) => {
    expect(textoEdad(t)).toBe(esperado);
  });
});

describe("calcular", () => {
  test("la animación dura 15 segundos", () => {
    expect(DURACION).toBe(15);
  });

  test("al empezar solo se ve el suelo asomando y nada más", () => {
    const e = calcular(0);
    expect(e.figuras).toHaveLength(5);
    expect(e.figuras.every((f) => f.o === 0)).toBe(true);
    expect(e.movil.o).toBe(0);
    expect(e.cierre).toBe(0);
  });

  test("las cinco siluetas se ven a la vez en la escena A", () => {
    const e = calcular(2);
    expect(e.figuras.every((f) => f.o === 1)).toBe(true);
    expect(e.lineasA.every((l) => l.o === 1)).toBe(true);
  });

  test("las siluetas aparecen una tras otra", () => {
    const e = calcular(0.6);
    expect(e.figuras[0].o).toBeGreaterThan(e.figuras[4].o);
  });

  test("las siluetas ya no se ven cuando entra el buscador", () => {
    const e = calcular(4);
    expect(e.figuras.every((f) => f.o === 0)).toBe(true);
    expect(e.suelo).toBe(0);
  });

  test("escena B: el móvil enseña el buscador y se elige Niños", () => {
    const e = calcular(5.5);
    expect(e.movil.o).toBe(1);
    expect(e.p1).toBe(1);
    expect(e.fichaNinosElegida).toBe(true);
    expect(e.tarjetaAcierto).toBe(false);
  });

  test("escena B: tras elegir Niños se apagan las otras tarjetas", () => {
    const e = calcular(6);
    expect(e.tarjetaAcierto).toBe(true);
    expect(e.tarjetas[0].o).toBe(1);
    expect(e.tarjetas[1].o).toBeLessThan(0.5);
  });

  test("escena C: con 12 años salen los campos de niños", () => {
    const e = calcular(8.4);
    expect(e.p2).toBe(1);
    expect(e.edad).toBe("12");
    expect(e.grupoNinos).toBe(1);
    expect(e.camposNinos.o).toBe(1);
    expect(e.camposMayores.o).toBe(0);
  });

  test("escena C: con 85 años salen los campos de personas mayores", () => {
    const e = calcular(10);
    expect(e.edad).toBe("85");
    expect(e.grupoNinos).toBe(0);
    expect(e.grupoMayores).toBe(1);
    expect(e.camposNinos.o).toBe(0);
    expect(e.camposMayores.o).toBe(1);
  });

  test("escena D: solicitud aceptada con las dos burbujas", () => {
    const e = calcular(12.6);
    expect(e.p3).toBe(1);
    expect(e.checkDibujo).toBe(0);
    expect(e.burbuja1.o).toBe(1);
    expect(e.burbuja2.o).toBe(1);
  });

  test("cierre: se ve el nombre y el lema", () => {
    const e = calcular(14.3);
    expect(e.cierre).toBe(1);
    expect(e.lema).toBeGreaterThan(0.95);
    expect(e.movil.o).toBe(0);
  });

  test("al terminar todo vuelve a estar apagado, para enlazar con el inicio", () => {
    const e = calcular(15);
    expect(e.cierre).toBe(0);
  });

  test("ningún valor de opacidad se sale de 0 a 1 en toda la animación", () => {
    for (let t = 0; t <= DURACION; t += 0.05) {
      const e = calcular(t);
      const opacidades = [
        ...e.figuras.map((f) => f.o),
        ...e.lineasA.map((l) => l.o),
        ...e.tarjetas.map((c) => c.o),
        e.suelo, e.movil.o, e.p1, e.p2, e.p3, e.cierre, e.lema,
        e.capB.o, e.capC.o, e.capD.o,
        e.camposNinos.o, e.camposMayores.o,
        e.burbuja1.o, e.burbuja2.o,
      ];
      for (const o of opacidades) {
        expect(o).toBeGreaterThanOrEqual(0);
        expect(o).toBeLessThanOrEqual(1.0000001);
      }
    }
  });
});