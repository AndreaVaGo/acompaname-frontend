import { describe, test, expect, vi, afterEach } from "vitest";
import {
  NOMBRES_MESES,
  NOMBRES_DIAS,
  fechaISO,
  hoyEnFormatoISO,
  diasEnElMes,
  celdasDelMes,
  fechasEntre,
  minutosDeLaHora,
  fechaEnLetras,
  formatearDuracion,
  MINUTOS_DIA_COMPLETO,
  minutosAHora,
  huecosLibres,
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

describe("minutosDeLaHora", () => {
  test("pasa una hora a minutos desde medianoche", () => {
    expect(minutosDeLaHora("00:00")).toBe(0);
    expect(minutosDeLaHora("09:30")).toBe(570);
    expect(minutosDeLaHora("23:59:00")).toBe(1439);
  });

  test("sin hora devuelve 0", () => {
    expect(minutosDeLaHora(null)).toBe(0);
    expect(minutosDeLaHora("")).toBe(0);
  });
});

describe("fechaEnLetras", () => {
  test("escribe el día de la semana, el día y el mes en letras", () => {
    expect(fechaEnLetras("2026-12-15")).toBe("Martes 15 de diciembre de 2026");
    expect(fechaEnLetras("2026-11-18")).toBe("Miércoles 18 de noviembre de 2026");
  });

  test("acierta con el domingo y con el lunes", () => {
    expect(fechaEnLetras("2026-12-20")).toBe("Domingo 20 de diciembre de 2026");
    expect(fechaEnLetras("2026-06-01")).toBe("Lunes 1 de junio de 2026");
  });
});

describe("formatearDuracion", () => {
  test("solo minutos si no llega a una hora", () => {
    expect(formatearDuracion(45)).toBe("45 min");
  });

  test("solo horas si son exactas", () => {
    expect(formatearDuracion(180)).toBe("3 h");
  });

  test("horas y minutos si hay de las dos", () => {
    expect(formatearDuracion(210)).toBe("3 h 30 min");
  });
});

describe("MINUTOS_DIA_COMPLETO", () => {
  test("un día completo son 8 horas", () => {
    expect(MINUTOS_DIA_COMPLETO).toBe(480);
  });
});

describe("minutosAHora", () => {
  test("pasa minutos a una hora con dos cifras", () => {
    expect(minutosAHora(0)).toBe("00:00");
    expect(minutosAHora(480)).toBe("08:00");
    expect(minutosAHora(570)).toBe("09:30");
    expect(minutosAHora(1440)).toBe("24:00");
  });
});

describe("huecosLibres", () => {
  test("sin nada ocupado, todo el día está libre", () => {
    expect(huecosLibres([])).toEqual([{ inicio: 0, fin: 1440 }]);
  });

  test("un tramo en medio deja un hueco antes y otro después", () => {
    expect(huecosLibres([{ inicio: 480, fin: 900 }])).toEqual([
      { inicio: 0, fin: 480 },
      { inicio: 900, fin: 1440 },
    ]);
  });

  test("un tramo que empieza a las 00:00 no deja hueco antes", () => {
    expect(huecosLibres([{ inicio: 0, fin: 480 }])).toEqual([{ inicio: 480, fin: 1440 }]);
  });

  test("un tramo que llega a las 24:00 no deja hueco después", () => {
    expect(huecosLibres([{ inicio: 1200, fin: 1440 }])).toEqual([{ inicio: 0, fin: 1200 }]);
  });

  test("si el día está entero ocupado no hay huecos", () => {
    expect(huecosLibres([{ inicio: 0, fin: 1440 }])).toEqual([]);
  });

  test("ordena los tramos y junta los que se solapan", () => {
    const ocupados = [
      { inicio: 840, fin: 1000 },
      { inicio: 480, fin: 900 },
    ];

    expect(huecosLibres(ocupados)).toEqual([
      { inicio: 0, fin: 480 },
      { inicio: 1000, fin: 1440 },
    ]);
  });

  test("dos tramos pegados no dejan hueco entre ellos", () => {
    const ocupados = [
      { inicio: 480, fin: 720 },
      { inicio: 720, fin: 900 },
    ];

    expect(huecosLibres(ocupados)).toEqual([
      { inicio: 0, fin: 480 },
      { inicio: 900, fin: 1440 },
    ]);
  });

  test("no cambia la lista que recibe", () => {
    const ocupados = [
      { inicio: 840, fin: 1000 },
      { inicio: 480, fin: 900 },
    ];

    huecosLibres(ocupados);

    expect(ocupados[0].inicio).toBe(840);
  });
});
