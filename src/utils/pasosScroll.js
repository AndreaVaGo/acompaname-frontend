// Ayudas para la sección "Así de sencillo": mientras se baja la página, la sección se queda fija
// y los pasos se van encendiendo uno a uno.

// Cuánto se ha avanzado dentro del bloque (de 0 a 1).
// "top" es lo que sube el bloque respecto a la parte de arriba de la ventana (negativo al bajar),
// "alturaBloque" es lo que mide el bloque y "alturaVentana" lo que mide la ventana
export function progresoDeScroll(top, alturaBloque, alturaVentana) {
  // El recorrido es lo que se puede bajar mientras la sección está fija
  const recorrido = alturaBloque - alturaVentana;
  if (recorrido <= 0) {
    return 1;
  }

  // Se escribe "0 - top" y no "-top" para que, con top = 0, el resultado sea 0 y no "-0"
  const progreso = (0 - top) / recorrido;
  if (progreso < 0) {
    return 0;
  }
  if (progreso > 1) {
    return 1;
  }
  return progreso;
}

// Qué paso está encendido (0, 1, 2...) según el progreso
export function pasoDeProgreso(progreso, totalPasos) {
  const paso = Math.floor(progreso * totalPasos);
  if (paso > totalPasos - 1) {
    return totalPasos - 1;
  }
  return paso;
}
