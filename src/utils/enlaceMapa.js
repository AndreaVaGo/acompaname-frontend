// Enlace para ver una dirección en el mapa. Usa la dirección web oficial de Google Maps
// para buscar un lugar: no hace falta clave de API ni cuenta, y en el móvil abre la app de mapas.
// Si no hay dirección devuelve texto vacío.
export function enlaceMapa(direccion) {
  if (!direccion || direccion.trim() === "") {
    return "";
  }
  const lugar = encodeURIComponent(direccion.trim());
  return `https://www.google.com/maps/search/?api=1&query=${lugar}`;
}
