import { formatearFecha } from "./formatearFecha";

// Convierte una hora del back (09:00:00) al formato que se muestra (09:00).
export function formatearHora(hora) {
  if (!hora) {
    return "";
  }
  return hora.slice(0, 5);
}

// Une la fecha y la hora para enseñarlas juntas: 21-10-2026 · 09:00.
// Si no hay hora (solicitudes antiguas) se muestra solo la fecha.
export function formatearMomento(fecha, hora) {
  if (!hora) {
    return formatearFecha(fecha);
  }
  return formatearFecha(fecha) + " · " + formatearHora(hora);
}

// Saca la hora de un momento del back (2026-11-24T09:05:12.123456) para enseñarla: 09:05.
export function horaDeMomento(momento) {
  if (!momento || momento.length < 16) {
    return "";
  }
  return momento.slice(11, 16);
}
