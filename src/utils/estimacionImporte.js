// Estimación del precio de una solicitud. Usa la misma fórmula que el servidor:
//   horas x tarifa por hora x (1 + recargo x personas extra)
// La primera persona se cobra a tarifa completa y cada persona extra suma un recargo.
// Es solo una estimación: el importe final lo calcula el servidor al completarse el servicio.

// Recargo por cada persona extra (0.25 = 25 %). Es el mismo valor por defecto que el servidor
export const RECARGO_PERSONA_EXTRA = 0.25;

// Horas que dura el cuidado, de la hora de inicio del primer día a la hora de fin del último.
// Una fracción de hora cuenta como hora entera. Si faltan datos o el rango no es válido, devuelve 0
export function horasDeCuidado(fechaInicio, horaInicio, fechaFin, horaFin) {
  if (!fechaInicio || !horaInicio || !horaFin) {
    return 0;
  }

  const ultimoDia = fechaFin || fechaInicio;
  // Se calcula en UTC para que los cambios de hora de verano no sumen ni resten una hora
  const inicio = new Date(fechaInicio + "T" + horaInicio + ":00Z");
  const fin = new Date(ultimoDia + "T" + horaFin + ":00Z");
  const minutos = (fin - inicio) / 60000;

  if (!(minutos > 0)) {
    return 0;
  }

  let horas = Math.floor(minutos / 60);
  if (minutos % 60 > 0) {
    horas = horas + 1;
  }
  return horas;
}

// Devuelve el desglose del precio, o null si todavía no se puede calcular
export function estimarImporte(tarifaHora, horas, numeroDePersonas) {
  const tarifa = Number(tarifaHora);
  if (!tarifa || tarifa <= 0 || !horas || horas <= 0) {
    return null;
  }

  let personasExtra = numeroDePersonas - 1;
  if (!(personasExtra > 0)) {
    personasExtra = 0;
  }

  const base = redondear(tarifa * horas);
  const total = redondear(tarifa * horas * (1 + RECARGO_PERSONA_EXTRA * personasExtra));

  return {
    tarifaHora: tarifa,
    horas: horas,
    personasExtra: personasExtra,
    recargoPorcentaje: Math.round(RECARGO_PERSONA_EXTRA * 100),
    base: base,
    recargo: redondear(total - base),
    total: total,
  };
}

// Redondea a dos decimales
function redondear(numero) {
  return Math.round(numero * 100) / 100;
}
