import { describe, test, expect } from "vitest";
import { ordenarFilas, siguienteOrden } from "../../utils/ordenarTabla";

const SIN_ORDEN = { clave: "", direccion: "asc" };

describe("siguienteOrden", () => {
  test("una columna nueva empieza de menor a mayor", () => {
    expect(siguienteOrden(SIN_ORDEN, "fecha")).toEqual({ clave: "fecha", direccion: "asc" });
  });

  test("pulsar la misma columna da la vuelta al orden", () => {
    const asc = { clave: "fecha", direccion: "asc" };

    expect(siguienteOrden(asc, "fecha")).toEqual({ clave: "fecha", direccion: "desc" });
    expect(siguienteOrden({ clave: "fecha", direccion: "desc" }, "fecha")).toEqual(asc);
  });

  test("cambiar de columna vuelve a empezar de menor a mayor", () => {
    const orden = { clave: "fecha", direccion: "desc" };

    expect(siguienteOrden(orden, "nombre")).toEqual({ clave: "nombre", direccion: "asc" });
  });

  test("elegir 'sin ordenar' (clave vacía) deja la clave vacía", () => {
    expect(siguienteOrden({ clave: "fecha", direccion: "desc" }, "")).toEqual(SIN_ORDEN);
  });
});

describe("ordenarFilas", () => {
  const FILAS = [
    { id: 1, nombre: "pepe 10", edad: 30, nota: "b" },
    { id: 2, nombre: "Ángel", edad: 5, nota: null },
    { id: 3, nombre: "pepe 2", edad: 100, nota: "a" },
  ];
  const VALORES = {
    nombre: (fila) => fila.nombre,
    edad: (fila) => fila.edad,
    nota: (fila) => fila.nota,
  };

  function ids(filas) {
    return filas.map((fila) => fila.id);
  }

  test("sin clave deja las filas como están", () => {
    expect(ordenarFilas(FILAS, VALORES, SIN_ORDEN)).toBe(FILAS);
  });

  test("una clave que no existe tampoco cambia nada", () => {
    expect(ordenarFilas(FILAS, VALORES, { clave: "otra", direccion: "asc" })).toBe(FILAS);
  });

  test("los números se ordenan como números (5, 30, 100) y no como texto", () => {
    const resultado = ordenarFilas(FILAS, VALORES, { clave: "edad", direccion: "asc" });

    expect(ids(resultado)).toEqual([2, 1, 3]);
  });

  test("el texto se ordena en español sin mirar tildes y con los números dentro bien (pepe 2 antes que pepe 10)", () => {
    const resultado = ordenarFilas(FILAS, VALORES, { clave: "nombre", direccion: "asc" });

    expect(ids(resultado)).toEqual([2, 3, 1]);
  });

  test("desc da la vuelta al orden", () => {
    const resultado = ordenarFilas(FILAS, VALORES, { clave: "edad", direccion: "desc" });

    expect(ids(resultado)).toEqual([3, 1, 2]);
  });

  test("las filas sin valor quedan al final tanto de menor a mayor como al revés", () => {
    expect(ids(ordenarFilas(FILAS, VALORES, { clave: "nota", direccion: "asc" }))).toEqual([3, 1, 2]);
    expect(ids(ordenarFilas(FILAS, VALORES, { clave: "nota", direccion: "desc" }))).toEqual([1, 3, 2]);
  });

  test("no cambia la lista original", () => {
    const copia = [...FILAS];

    ordenarFilas(FILAS, VALORES, { clave: "edad", direccion: "asc" });

    expect(FILAS).toEqual(copia);
  });
});
