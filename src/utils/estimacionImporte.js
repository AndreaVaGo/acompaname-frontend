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

// Recargo que se aplica: el propio de la persona cuidadora (en porcentaje, 0 a 100) si lo ha puesto,
// y si no, el de por defecto. Devuelve una fracción (30 -> 0.3)
export function recargoAplicable(recargoPropioPorcentaje) {
  if (recargoPropioPorcentaje === null || recargoPropioPorcentaje === undefined || recargoPropioPorcentaje === "") {
    return RECARGO_PERSONA_EXTRA;
  }
  const porcentaje = Number(recargoPropioPorcentaje);
  if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
    return RECARGO_PERSONA_EXTRA;
  }
  return porcentaje / 100;
}

// Devuelve el desglose del precio, o null si todavía no se puede calcular.
// El recargo propio de la persona cuidadora es opcional (en porcentaje)
export function estimarImporte(tarifaHora, horas, numeroDePersonas, recargoPropioPorcentaje = null) {
  const tarifa = Number(tarifaHora);
  if (!tarifa || tarifa <= 0 || !horas || horas <= 0) {
    return null;
  }

  let personasExtra = numeroDePersonas - 1;
  if (!(personasExtra > 0)) {
    personasExtra = 0;
  }

  const recargoPersonaExtra = recargoAplicable(recargoPropioPorcentaje);
  const base = redondear(tarifa * horas);
  const total = redondear(tarifa * horas * (1 + recargoPersonaExtra * personasExtra));

  return {
    tarifaHora: tarifa,
    horas: horas,
    personasExtra: personasExtra,
    recargoPorcentaje: Math.round(recargoPersonaExtra * 100),
    base: base,
    recargo: redondear(total - base),
    total: total,
  };
}

// Redondea a dos decimales
function redondear(numero) {
  return Math.round(numero * 100) / 100;
}
