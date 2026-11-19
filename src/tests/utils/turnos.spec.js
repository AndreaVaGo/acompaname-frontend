import { describe, test, expect } from "vitest";
import {
  TURNOS,
  DIAS_SEMANA,
  LUNES_A_VIERNES,
  TODOS_LOS_DIAS,
  MAXIMO_DIAS_REPETICION,
  diaDeLaSemana,
  esTurnoDeNoche,
  resumenDeRepeticion,
} from "../../utils/turnos";

describe("turnos · datos", () => {
  test("hay tres turnos rápidos: mañana, tarde y noche", () => {
    expect(TURNOS.map((turno) => turno.id)).toEqual(["manana", "tarde", "noche"]);
  });

  test("cada turno tiene horas con formato HH:MM y un motivo", () => {
    for (const turno of TURNOS) {
      expect(turno.horaInicio).toMatch(/^\d{2}:\d{2}$/);
      expect(turno.horaFin).toMatch(/^\d{2}:\d{2}$/);
      expect(turno.motivo.length).toBeGreaterThan(0);
    }
  });

  test("solo el turno de noche acaba al día siguiente", () => {
    const quePasanDeNoche = TURNOS.filter((turno) => esTurnoDeNoche(turno.horaInicio, turno.horaFin));
    expect(quePasanDeNoche.map((turno) => turno.id)).toEqual(["noche"]);
  });

  test("los motivos de los turnos caben en los 100 caracteres que acepta el servidor", () => {
    for (const turno of TURNOS) {
      expect(turno.motivo.length).toBeLessThanOrEqual(100);
    }
  });

  test("la semana tiene siete días y empieza en lunes", () => {
    expect(DIAS_SEMANA).toHaveLength(7);
    expect(DIAS_SEMANA[0].valor).toBe("MONDAY");
    expect(DIAS_SEMANA[6].valor).toBe("SUNDAY");
  });

  test("de lunes a viernes son cinco días y todos los días son siete", () => {
    expect(LUNES_A_VIERNES).toEqual(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]);
    expect(TODOS_LOS_DIAS).toHaveLength(7);
  });

  test("el máximo de repetición es el mismo que acepta el servidor", () => {
    expect(MAXIMO_DIAS_REPETICION).toBe(183);
  });
});

describe("turnos · diaDeLaSemana", () => {
  test("da el día de la semana de una fecha", () => {
    expect(diaDeLaSemana("2026-12-14")).toBe("MONDAY");
    expect(diaDeLaSemana("2026-12-15")).toBe("TUESDAY");
    expect(diaDeLaSemana("2026-12-10")).toBe("THURSDAY");
  });

  test("el domingo es SUNDAY y el sábado SATURDAY", () => {
    expect(diaDeLaSemana("2026-12-20")).toBe("SUNDAY");
    expect(diaDeLaSemana("2026-12-19")).toBe("SATURDAY");
  });

  test("funciona al cambiar de año", () => {
    expect(diaDeLaSemana("2027-01-01")).toBe("FRIDAY");
  });
});

describe("turnos · esTurnoDeNoche", () => {
  test("de 22:00 a 07:00 es de noche", () => {
    expect(esTurnoDeNoche("22:00", "07:00")).toBe(true);
  });

  test("de 07:00 a 15:00 no es de noche", () => {
    expect(esTurnoDeNoche("07:00", "15:00")).toBe(false);
  });

  test("con las mismas horas no es de noche", () => {
    expect(esTurnoDeNoche("08:00", "08:00")).toBe(false);
  });

  test("sin horas no es de noche", () => {
    expect(esTurnoDeNoche("", "07:00")).toBe(false);
    expect(esTurnoDeNoche("22:00", "")).toBe(false);
    expect(esTurnoDeNoche("", "")).toBe(false);
  });
});

describe("turnos · resumenDeRepeticion", () => {
  test("cuenta los ratos añadidos", () => {
    expect(resumenDeRepeticion({ creados: 5, duplicados: 0 })).toBe("Hemos añadido 5 ratos ocupados a tu calendario.");
  });

  test("con un solo rato lo dice en singular", () => {
    expect(resumenDeRepeticion({ creados: 1, duplicados: 0 })).toBe("Hemos añadido 1 rato ocupado a tu calendario.");
  });

  test("avisa de los que ya estaban", () => {
    const texto = resumenDeRepeticion({ creados: 3, duplicados: 2 });
    expect(texto).toContain("Hemos añadido 3 ratos ocupados");
    expect(texto).toContain("2 ya estaban en tu calendario.");
  });

  test("con uno repetido usa el singular", () => {
    expect(resumenDeRepeticion({ creados: 2, duplicados: 1 })).toContain("1 ya estaba en tu calendario.");
  });

  test("si no se añade nada lo dice", () => {
    const texto = resumenDeRepeticion({ creados: 0, duplicados: 4 });
    expect(texto).toContain("No hemos añadido ningún rato nuevo.");
    expect(texto).toContain("4 ya estaban");
  });
});
