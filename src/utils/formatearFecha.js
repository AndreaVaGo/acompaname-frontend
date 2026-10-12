// Convierte una fecha del back (2026-10-21) al formato que se muestra (21-10-2026).
export function formatearFecha(fecha) {
  if (!fecha) {
    return "";
  }
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}-${mes}-${anio}`;
}