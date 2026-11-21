// Funciones para ordenar las tablas del panel de administración.
// orden es un objeto { clave, direccion }: clave dice por qué columna se ordena ("" = sin ordenar)
// y direccion es "asc" (de menor a mayor, de la A a la Z) o "desc" (al revés).

// Qué orden toca al pulsar una columna:
// - si ya estaba ordenada por ella, se da la vuelta (asc pasa a desc y desc a asc)
// - si es otra columna, se empieza por asc
export function siguienteOrden(actual, clave) {
  if (clave !== "" && actual.clave === clave) {
    if (actual.direccion === "asc") {
      return { clave: clave, direccion: "desc" };
    }
    return { clave: clave, direccion: "asc" };
  }
  return { clave: clave, direccion: "asc" };
}

// Compara dos valores: los números como números y lo demás como texto en español
// (sin mirar mayúsculas ni tildes, y con "pepe 2" antes que "pepe 10")
function comparar(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  return String(a).localeCompare(String(b), "es", { numeric: true, sensitivity: "base" });
}

// Devuelve una copia de las filas ordenada (la lista original no se toca).
// valorDe es un objeto que dice, para cada clave, cómo sacar el valor de una fila:
// { nombre: (fila) => fila.nombre, ... }
// Las filas sin valor (null o vacío) quedan siempre al final, ordenes como ordenes.
export function ordenarFilas(filas, valorDe, orden) {
  const sacarValor = valorDe[orden.clave];
  if (!sacarValor) {
    return filas;
  }
  const sentido = orden.direccion === "desc" ? -1 : 1;

  return [...filas].sort((filaA, filaB) => {
    const a = sacarValor(filaA);
    const b = sacarValor(filaB);
    const aVacio = a === null || a === undefined || a === "";
    const bVacio = b === null || b === undefined || b === "";

    if (aVacio && bVacio) {
      return 0;
    }
    if (aVacio) {
      return 1;
    }
    if (bVacio) {
      return -1;
    }
    return comparar(a, b) * sentido;
  });
}
