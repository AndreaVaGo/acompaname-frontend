import { describe, test, expect, vi, afterEach } from "vitest";
import {
  NOMBRES_MESES,
  NOMBRES_DIAS,
  fechaISO,
  hoyEnFormatoISO,
  diasEnElMes,
  celdasDelMes,
  fechasEntre,
} from "../../utils/calendario";

afterEach(() => {
  vi.useRealTimers();
});

describe("nombres", () => {
  test("hay 12 meses y 7 días, y la semana empieza en lunes", () => {
    expect(NOMBRES_MESES.length).toBe(12);
    expect(NOMBRES_MESES[0]).toBe("Enero");
    expect(NOMBRES_MESES[11]).toBe("Diciembre");
    expect(NOMBRES_DIAS.length).toBe(7);
    expect(NOMBRES_DIAS[0]).toBe("Lun");
    expect(NOMBRES_DIAS[6]).toBe("Dom");
  });
});

describe("fechaISO", () => {
  test("une año, mes (de 0 a 11) y día con ceros delante", () => {
    expect(fechaISO(2026, 0, 5)).toBe("2026-01-05");
    expect(fechaISO(2026, 11, 31)).toBe("2026-12-31");
  });
});

describe("hoyEnFormatoISO", () => {
  test("devuelve el día de hoy con la hora de aquí", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 0, 5, 23, 30));

    expect(hoyEnFormatoISO()).toBe("2026-01-05");
  });
});

describe("diasEnElMes", () => {
  test("cuenta los días de cada mes", () => {
    expect(diasEnElMes(2026, 0)).toBe(31);
    expect(diasEnElMes(2026, 3)).toBe(30);
    expect(diasEnElMes(2026, 11)).toBe(31);
  });

  test("febrero tiene 28 días y 29 en año bisiesto", () => {
    expect(diasEnElMes(2027, 1)).toBe(28);
    expect(diasEnElMes(2028, 1)).toBe(29);
  });
});

describe("celdasDelMes", () => {
  test("diciembre de 2026 empieza en martes: un hueco y 31 días", () => {
    const celdas = celdasDelMes(2026, 11);

    expect(celdas.length).toBe(32);
    expect(celdas[0]).toBe(null);
    expect(celdas[1]).toEqual({ dia: 1, fecha: "2026-12-01" });
    expect(celdas[31]).toEqual({ dia: 31, fecha: "2026-12-31" });
  });

  test("junio de 2026 empieza en lunes: ningún hueco", () => {
    const celdas = celdasDelMes(2026, 5);

    expect(celdas[0]).toEqual({ dia: 1, fecha: "2026-06-01" });
    expect(celdas.length).toBe(30);
  });

  test("febrero de 2026 empieza en domingo: seis huecos", () => {
    const celdas = celdasDelMes(2026, 1);

    expect(celdas.filter((celda) => celda === null).length).toBe(6);
    expect(celdas.length).toBe(34);
  });

  test("mayo de 2026 empieza en viernes: cuatro huecos", () => {
    const celdas = celdasDelMes(2026, 4);

    expect(celdas.filter((celda) => celda === null).length).toBe(4);
  });
});

describe("fechasEntre", () => {
  test("un solo día devuelve ese día", () => {
    expect(fechasEntre("2026-12-10", "2026-12-10")).toEqual(["2026-12-10"]);
  });

  test("devuelve todos los días con los dos extremos incluidos", () => {
    expect(fechasEntre("2026-12-10", "2026-12-12")).toEqual(["2026-12-10", "2026-12-11", "2026-12-12"]);
  });

  test("cruza el cambio de mes y de año", () => {
    expect(fechasEntre("2026-12-30", "2027-01-02")).toEqual([
      "2026-12-30",
      "2026-12-31",
      "2027-01-01",
      "2027-01-02",
    ]);
  });

  test("cruza el cambio de hora de marzo sin saltarse ni repetir días", () => {
    expect(fechasEntre("2026-03-28", "2026-03-30")).toEqual(["2026-03-28", "2026-03-29", "2026-03-30"]);
  });

  test("si el final es anterior al principio devuelve una lista vacía", () => {
    expect(fechasEntre("2026-12-10", "2026-12-05")).toEqual([]);
  });
});
