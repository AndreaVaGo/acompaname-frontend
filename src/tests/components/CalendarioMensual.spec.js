import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import CalendarioMensual from "../../components/CalendarioMensual.vue";

// Hoy es el 10 de diciembre de 2026 (martes)
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 11, 10, 12, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

function montar(propiedades = {}) {
  return mount(CalendarioMensual, { props: propiedades });
}

function titulo(wrapper) {
  return wrapper.find(".calendario-mensual__titulo").text();
}

function dia(wrapper, numero) {
  return wrapper.findAll(".calendario-mensual__dia")[numero - 1];
}

describe("CalendarioMensual", () => {
  test("al empezar enseña el mes de hoy", () => {
    const wrapper = montar();

    expect(titulo(wrapper)).toBe("Diciembre 2026");
  });

  test("con mesInicial enseña ese mes", () => {
    const wrapper = montar({ mesInicial: "2027-03-15" });

    expect(titulo(wrapper)).toBe("Marzo 2027");
  });

  test("enseña los siete días de la semana empezando en lunes", () => {
    const wrapper = montar();

    const nombres = wrapper.findAll(".calendario-mensual__semana span").map((s) => s.text());
    expect(nombres).toEqual(["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]);
  });

  test("diciembre de 2026 tiene 31 días y un hueco antes del día 1 (empieza en martes)", () => {
    const wrapper = montar();

    expect(wrapper.findAll(".calendario-mensual__dia").length).toBe(31);
    expect(wrapper.findAll(".calendario-mensual__hueco").length).toBe(1);
  });

  test("la flecha siguiente pasa al mes siguiente y salta al año siguiente desde diciembre", async () => {
    const wrapper = montar();

    await wrapper.find("#mes-siguiente").trigger("click");

    expect(titulo(wrapper)).toBe("Enero 2027");
  });

  test("la flecha anterior pasa al mes anterior y vuelve al año anterior desde enero", async () => {
    const wrapper = montar({ mesInicial: "2027-01-10" });

    await wrapper.find("#mes-anterior").trigger("click");

    expect(titulo(wrapper)).toBe("Diciembre 2026");
  });

  test("se puede avanzar y retroceder varios meses", async () => {
    const wrapper = montar();

    await wrapper.find("#mes-siguiente").trigger("click");
    await wrapper.find("#mes-siguiente").trigger("click");
    expect(titulo(wrapper)).toBe("Febrero 2027");
    expect(wrapper.findAll(".calendario-mensual__dia").length).toBe(28);

    await wrapper.find("#mes-anterior").trigger("click");
    await wrapper.find("#mes-anterior").trigger("click");
    await wrapper.find("#mes-anterior").trigger("click");
    expect(titulo(wrapper)).toBe("Noviembre 2026");
    expect(wrapper.findAll(".calendario-mensual__dia").length).toBe(30);
  });

  test("al pulsar un día avisa con su fecha", async () => {
    const wrapper = montar();

    await dia(wrapper, 15).trigger("click");

    expect(wrapper.emitted("seleccionar")[0]).toEqual(["2026-12-15"]);
  });

  test("al pulsar un día de otro mes avisa con la fecha de ese mes", async () => {
    const wrapper = montar();
    await wrapper.find("#mes-siguiente").trigger("click");

    await dia(wrapper, 3).trigger("click");

    expect(wrapper.emitted("seleccionar")[0]).toEqual(["2027-01-03"]);
  });

  test("el botón Hoy vuelve al mes de hoy y avisa con la fecha de hoy", async () => {
    const wrapper = montar({ mesInicial: "2027-05-01" });

    await wrapper.find(".calendario-mensual__hoy").trigger("click");

    expect(titulo(wrapper)).toBe("Diciembre 2026");
    expect(wrapper.emitted("seleccionar")[0]).toEqual(["2026-12-10"]);
  });

  test("marca el día de hoy, el día seleccionado y los días pasados", () => {
    const wrapper = montar({ seleccionado: "2026-12-20" });

    expect(dia(wrapper, 10).classes()).toContain("calendario-mensual__dia--hoy");
    expect(dia(wrapper, 20).classes()).toContain("calendario-mensual__dia--seleccionado");
    expect(dia(wrapper, 20).attributes("aria-pressed")).toBe("true");
    expect(dia(wrapper, 9).classes()).toContain("calendario-mensual__dia--pasado");
    expect(dia(wrapper, 10).classes()).not.toContain("calendario-mensual__dia--pasado");
    expect(dia(wrapper, 11).classes()).not.toContain("calendario-mensual__dia--pasado");
  });

  test("los días con un servicio o con un rato ocupado salen marcados como ocupados", () => {
    const wrapper = montar({
      marcas: {
        "2026-12-15": { servicios: 1, bloques: 0 },
        "2026-12-16": { servicios: 0, bloques: 2 },
        "2026-12-17": { servicios: 1, bloques: 1 },
      },
    });

    expect(dia(wrapper, 15).classes()).toContain("calendario-mensual__dia--ocupado");
    expect(dia(wrapper, 16).classes()).toContain("calendario-mensual__dia--ocupado");
    expect(dia(wrapper, 17).classes()).toContain("calendario-mensual__dia--ocupado");
    expect(dia(wrapper, 18).classes()).not.toContain("calendario-mensual__dia--ocupado");
  });

  test("el texto para lectores de pantalla dice qué hay en el día", () => {
    const wrapper = montar({
      marcas: {
        "2026-12-15": { servicios: 1, bloques: 0 },
        "2026-12-16": { servicios: 0, bloques: 1 },
      },
    });

    expect(dia(wrapper, 15).attributes("aria-label")).toBe("15 de Diciembre, con servicio aceptado, con horas libres");
    expect(dia(wrapper, 16).attributes("aria-label")).toBe("16 de Diciembre, con rato ocupado, con horas libres");
    expect(dia(wrapper, 17).attributes("aria-label")).toBe("17 de Diciembre");
  });

  test("la leyenda explica los tres estados de un día", () => {
    const wrapper = montar();

    const leyenda = wrapper.find(".calendario-mensual__leyenda").text();
    expect(leyenda).toContain("Día libre");
    expect(leyenda).toContain("Con algo apuntado");
    expect(leyenda).toContain("Día completo");
  });
});

describe("CalendarioMensual: colores de los días", () => {
  test("un día sin nada no lleva color ni barra", () => {
    const wrapper = montar();

    expect(dia(wrapper, 15).classes()).toContain("calendario-mensual__dia--libre");
    expect(dia(wrapper, 15).find(".calendario-mensual__barra").exists()).toBe(false);
  });

  test("un día con poco apuntado lleva color suave y la barra a medias", () => {
    const wrapper = montar({
      marcas: {
        "2026-12-15": { servicios: 1, bloques: 0, minutos: 180 },
        "2026-12-16": { servicios: 0, bloques: 1, minutos: 120 },
        "2026-12-17": { servicios: 1, bloques: 1, minutos: 300 },
      },
    });

    expect(dia(wrapper, 15).classes()).toContain("calendario-mensual__dia--ocupado");
    expect(dia(wrapper, 16).classes()).toContain("calendario-mensual__dia--ocupado");
    expect(dia(wrapper, 17).classes()).toContain("calendario-mensual__dia--ocupado");
    expect(dia(wrapper, 15).classes()).not.toContain("calendario-mensual__dia--completo");
    // 180 minutos de 480 = 38 %
    expect(dia(wrapper, 15).find(".calendario-mensual__barra-relleno").attributes("style")).toContain("width: 38%");
    expect(dia(wrapper, 15).attributes("aria-label")).toContain("con horas libres");
  });

  test("un día con 8 horas o más apuntadas es un día completo", () => {
    const wrapper = montar({
      marcas: {
        "2026-12-15": { servicios: 0, bloques: 1, minutos: 480 },
        "2026-12-16": { servicios: 1, bloques: 0, minutos: 1440 },
        "2026-12-17": { servicios: 0, bloques: 1, minutos: 479 },
      },
    });

    expect(dia(wrapper, 15).classes()).toContain("calendario-mensual__dia--completo");
    expect(dia(wrapper, 15).find(".calendario-mensual__barra-relleno").attributes("style")).toContain("width: 100%");
    expect(dia(wrapper, 15).attributes("aria-label")).toContain("día completo");
    expect(dia(wrapper, 16).classes()).toContain("calendario-mensual__dia--completo");
    expect(dia(wrapper, 17).classes()).not.toContain("calendario-mensual__dia--completo");
  });

  test("la barra nunca pasa del 100 % aunque haya más de 8 horas", () => {
    const wrapper = montar({ marcas: { "2026-12-15": { servicios: 1, bloques: 0, minutos: 1440 } } });

    expect(dia(wrapper, 15).find(".calendario-mensual__barra-relleno").attributes("style")).toContain("width: 100%");
  });

  test("si la marca no trae minutos, el día cuenta como parcial y la barra va a la mitad", () => {
    const wrapper = montar({ marcas: { "2026-12-15": { servicios: 1, bloques: 0 } } });

    expect(dia(wrapper, 15).classes()).not.toContain("calendario-mensual__dia--completo");
    expect(dia(wrapper, 15).find(".calendario-mensual__barra-relleno").attributes("style")).toContain("width: 50%");
  });

});

describe("CalendarioMensual: leyenda", () => {
  test("cada estado de la leyenda lleva su cuadradito y los de con algo apuntado y completo llevan su barrita", () => {
    const wrapper = montar();

    expect(wrapper.findAll(".calendario-mensual__leyenda-item").length).toBe(3);
    expect(wrapper.find(".calendario-mensual__muestra--libre").exists()).toBe(true);
    expect(wrapper.find(".calendario-mensual__muestra--libre .calendario-mensual__muestra-barra").exists()).toBe(false);
    expect(wrapper.find(".calendario-mensual__muestra--ocupado .calendario-mensual__muestra-barra--media").exists()).toBe(true);
    expect(wrapper.find(".calendario-mensual__muestra--completo .calendario-mensual__muestra-barra--llena").exists()).toBe(true);
  });
});
