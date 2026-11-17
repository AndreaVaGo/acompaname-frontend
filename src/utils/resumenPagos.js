// Reglas de la pantalla "Pagos" de la familia: el orden de la lista y los totales.

// Los pendientes van arriba y, dentro de cada grupo, los más recientes primero.
// Devuelve una lista nueva; la original no se toca.
export function ordenarPagos(pagos) {
  const copia = [...pagos];
  copia.sort((a, b) => {
    const aPendiente = a.estado === "PENDIENTE";
    const bPendiente = b.estado === "PENDIENTE";
    if (aPendiente !== bPendiente) {
      return aPendiente ? -1 : 1;
    }
    // Las fechas llegan como 2026-11-10, así que se pueden comparar como texto
    return (b.fecha || "").localeCompare(a.fecha || "");
  });
  return copia;
}

// Suma los importes de los pagos que están en un estado (PENDIENTE, COMPLETADO...).
// Se suma en céntimos para evitar errores de decimales (0.1 + 0.2 no da 0.3 en JavaScript).
export function sumarImportes(pagos, estado) {
  let centimos = 0;
  for (const pago of pagos) {
    if (pago.estado === estado) {
      centimos += Math.round(Number(pago.importe) * 100);
    }
  }
  return centimos / 100;
}
