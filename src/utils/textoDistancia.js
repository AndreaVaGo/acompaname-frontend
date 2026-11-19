// Texto para enseñar a qué distancia está una persona cuidadora.
// La distancia se mide de ciudad a ciudad, así que se dice "unos" y nunca se promete precisión.
export function textoDistancia(km) {
  if (km === undefined || km === null) {
    return "";
  }
  // Menos de 1 km: la misma ciudad o zona
  if (km < 1) {
    return "En tu zona";
  }
  // Hasta 10 km se enseña un decimal ("a unos 4,5 km"); a partir de ahí, kilómetros enteros
  if (km < 10) {
    return `A unos ${km.toFixed(1).replace(".", ",")} km`;
  }
  return `A unos ${Math.round(km)} km`;
}
