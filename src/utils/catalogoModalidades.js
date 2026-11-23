// Etiquetas que no son servicios ni titulaciones pero también llevan icono y color fijos:
//  - MODALIDADES: dónde cuida la persona (en el hospital, a domicilio o en los dos sitios)
//  - EXTRAS: datos sueltos de su ficha (disponible ahora, vehículo propio)
// "codigo" de las modalidades es lo que viaja al back (tipoCuidado); los colores salen de paletaEtiquetas.js
export const MODALIDADES = [
  { codigo: "hospitalario", nombre: "Hospitalario", icono: "🏥", color: "azul" },
  { codigo: "domicilio", nombre: "A domicilio", icono: "🏠", color: "marron" },
  { codigo: "ambos", nombre: "Hospital y domicilio", icono: "🏥🏠", color: "turquesa" },
];

export const EXTRAS = [
  { codigo: "disponible", nombre: "Disponible ahora", icono: "🟢", color: "verde" },
  { codigo: "vehiculo", nombre: "Vehículo propio", icono: "🚗", color: "naranja" },
];

// Devuelve la modalidad completa a partir del código (o undefined si no existe)
export function buscarModalidad(codigo) {
  return MODALIDADES.find((modalidad) => modalidad.codigo === codigo);
}

// Un cuidador sin tipo indicado, o con uno desconocido, cuida en los dos sitios
export function codigoModalidad(tipoCuidado) {
  return buscarModalidad(tipoCuidado) ? tipoCuidado : "ambos";
}

// Devuelve el dato suelto completo a partir del código (o undefined si no existe)
export function buscarExtra(codigo) {
  return EXTRAS.find((extra) => extra.codigo === codigo);
}
