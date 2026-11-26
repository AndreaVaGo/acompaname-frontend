import { describe, test, expect } from "vitest";
import {
  validarSolicitud,
  fechaDeHoy,
  ordenDeCampos,
  campoDeSolicitud,
} from "../../utils/validarSolicitud";

const HOY = "2026-11-26";

// Una solicitud correcta; cada test cambia solo lo que quiere probar
function solicitudCorrecta(cambios = {}) {
  return {
    grupoEdad: "BEBES",
    tipoCuidado: "domicilio",
    hospital: "",
    ubicacionHospital: "",
    direccion: "Calle Uría 10, Oviedo",
    fechaInicio: "2026-12-01",
    fechaFin: "",
    horaInicio: "09:00",
    horaFin: "13:00",
    personas: [{ nombre: "Lucía", edad: "1" }],
    notas: "",
    ...cambios,
  };
}

describe("validarSolicitud", () => {
  test("una solicitud correcta no tiene errores", () => {
    expect(validarSolicitud(solicitudCorrecta(), HOY)).toEqual({});
  });

  test("avisa de cada campo obligatorio que falta", () => {
    const errores = validarSolicitud(
      solicitudCorrecta({
        grupoEdad: "",
        tipoCuidado: "",
        fechaInicio: "",
        horaInicio: "",
        horaFin: "",
        personas: [{ nombre: "", edad: "" }],
      }),
      HOY,
    );

    expect(Object.keys(errores).sort()).toEqual(
      [
        "fechaInicio",
        "grupoEdad",
        "horaFin",
        "horaInicio",
        "personas.0.edad",
        "personas.0.nombre",
        "tipoCuidado",
      ].sort(),
    );
  });

  test("la fecha de inicio no puede estar en el pasado", () => {
    const errores = validarSolicitud(solicitudCorrecta({ fechaInicio: "2026-11-25" }), HOY);

    expect(errores.fechaInicio).toBe("La fecha de inicio no puede estar en el pasado.");
  });

  test("la fecha de inicio de hoy es válida", () => {
    expect(validarSolicitud(solicitudCorrecta({ fechaInicio: HOY }), HOY)).toEqual({});
  });

  test("la fecha de fin no puede ser anterior a la de inicio", () => {
    const errores = validarSolicitud(solicitudCorrecta({ fechaFin: "2026-11-30" }), HOY);

    expect(errores.fechaFin).toBe("La fecha de fin no puede ser anterior a la de inicio.");
  });

  test("la fecha de fin no puede estar en el pasado", () => {
    const errores = validarSolicitud(
      solicitudCorrecta({ fechaInicio: "", fechaFin: "2026-11-20" }),
      HOY,
    );

    expect(errores.fechaFin).toBe("La fecha de fin no puede estar en el pasado.");
  });

  test("un solo día: la hora de fin tiene que ser posterior a la de inicio", () => {
    const errores = validarSolicitud(
      solicitudCorrecta({ horaInicio: "13:00", horaFin: "09:00" }),
      HOY,
    );

    expect(errores.horaFin).toBe("La hora de fin tiene que ser posterior a la de inicio.");
  });

  test("varios días: la hora de fin puede ser anterior a la de inicio", () => {
    const errores = validarSolicitud(
      solicitudCorrecta({ fechaFin: "2026-12-03", horaInicio: "20:00", horaFin: "08:00" }),
      HOY,
    );

    expect(errores).toEqual({});
  });

  test("hospital: pide el nombre y la ubicación, no la dirección", () => {
    const errores = validarSolicitud(
      solicitudCorrecta({ tipoCuidado: "hospitalario", direccion: "" }),
      HOY,
    );

    expect(Object.keys(errores).sort()).toEqual(["hospital", "ubicacionHospital"]);
  });

  test("domicilio: pide la dirección, no el hospital", () => {
    const errores = validarSolicitud(solicitudCorrecta({ direccion: "   " }), HOY);

    expect(Object.keys(errores)).toEqual(["direccion"]);
  });

  test("la edad tiene que encajar con el grupo de edad", () => {
    const errores = validarSolicitud(
      solicitudCorrecta({ personas: [{ nombre: "Lucía", edad: "40" }] }),
      HOY,
    );

    expect(errores["personas.0.edad"]).toBe(
      'Para "Bebés" la edad tiene que estar entre 0 y 3 años.',
    );
  });

  test("la edad 0 es válida", () => {
    const errores = validarSolicitud(
      solicitudCorrecta({ personas: [{ nombre: "Lucía", edad: "0" }] }),
      HOY,
    );

    expect(errores).toEqual({});
  });

  test("la edad tiene que ser un número entero", () => {
    const errores = validarSolicitud(
      solicitudCorrecta({ personas: [{ nombre: "Lucía", edad: "1.5" }] }),
      HOY,
    );

    expect(errores["personas.0.edad"]).toBe("La edad tiene que ser un número entero.");
  });

  test("la segunda persona necesita su propio grupo de edad", () => {
    const errores = validarSolicitud(
      solicitudCorrecta({
        personas: [
          { nombre: "Lucía", edad: "1" },
          { nombre: "Leo", edad: "2", grupoEdad: "" },
        ],
      }),
      HOY,
    );

    expect(errores["personas.1.grupoEdad"]).toBe("Elige el grupo de edad de esta persona.");
    expect(errores["personas.1.edad"]).toBeUndefined();
  });

  test("cada persona se valida con su grupo, no con el de la primera", () => {
    const errores = validarSolicitud(
      solicitudCorrecta({
        personas: [
          { nombre: "Lucía", edad: "1" },
          { nombre: "Leo", edad: "30", grupoEdad: "BEBES" },
        ],
      }),
      HOY,
    );

    expect(errores["personas.1.edad"]).toBeDefined();
    expect(errores["personas.0.edad"]).toBeUndefined();
  });

  test("las notas no pueden superar 1000 caracteres", () => {
    const errores = validarSolicitud(solicitudCorrecta({ notas: "a".repeat(1001) }), HOY);

    expect(errores.notas).toBe("La información no puede superar 1000 caracteres.");
  });
});

describe("fechaDeHoy", () => {
  test("da la fecha como AAAA-MM-DD con ceros", () => {
    expect(fechaDeHoy(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
    expect(fechaDeHoy(new Date(2026, 10, 26, 0, 1))).toBe("2026-11-26");
  });
});

describe("ordenDeCampos", () => {
  test("incluye los campos de cada persona en su sitio", () => {
    const orden = ordenDeCampos(2);

    expect(orden.indexOf("fechaInicio")).toBeLessThan(orden.indexOf("personas.0.nombre"));
    expect(orden.indexOf("personas.0.edad")).toBeLessThan(orden.indexOf("personas.1.nombre"));
    expect(orden[orden.length - 1]).toBe("notas");
  });
});

describe("campoDeSolicitud", () => {
  test("traduce los nombres que usa el back", () => {
    expect(campoDeSolicitud("fechaCuidado")).toBe("fechaInicio");
    expect(campoDeSolicitud("personas[1].nombre")).toBe("personas.1.nombre");
    expect(campoDeSolicitud("horaFin")).toBe("horaFin");
  });
});
