// Catálogo de titulaciones y formación que una persona cuidadora puede marcar en su perfil.
// "codigo" es lo que viaja al back (tiene que coincidir con el enum Titulacion),
// "nombre" es lo que se ve en el formulario y en la ficha, y "corto" es el texto
// breve para las tarjetas del buscador. "icono" y "color" son fijos (ver paletaEtiquetas.js).
// Son solo una declaración: la app no comprueba ningún documento que lo acredite.
export const TITULACIONES = [
  {
    codigo: "ENFERMERIA",
    nombre: "Enfermería",
    corto: "Enfermería",
    icono: "🩺",
    color: "verde",
  },
  {
    codigo: "AUXILIAR_ENFERMERIA",
    nombre: "Auxiliar de enfermería (TCAE)",
    corto: "TCAE",
    icono: "💉",
    color: "azul",
  },
  {
    codigo: "ATENCION_DEPENDENCIA",
    nombre: "Técnico en atención a personas en situación de dependencia",
    corto: "Atención a la dependencia",
    icono: "🤲",
    color: "morado",
  },
  {
    codigo: "ATENCION_SOCIOSANITARIA",
    nombre: "Certificado de profesionalidad en atención sociosanitaria",
    corto: "Atención sociosanitaria",
    icono: "🏥",
    color: "turquesa",
  },
  {
    codigo: "PRIMEROS_AUXILIOS",
    nombre: "Primeros auxilios",
    corto: "Primeros auxilios",
    icono: "⛑️",
    color: "coral",
  },
];

// Devuelve la titulación completa a partir del código (o undefined si no existe)
export function buscarTitulacion(codigo) {
  return TITULACIONES.find((titulacion) => titulacion.codigo === codigo);
}

// Devuelve el nombre completo que se ve en pantalla a partir del código
export function nombreTitulacion(codigo) {
  const titulacion = buscarTitulacion(codigo);
  return titulacion ? titulacion.nombre : codigo;
}

// Devuelve el nombre corto (para las tarjetas) a partir del código
export function nombreCortoTitulacion(codigo) {
  const titulacion = buscarTitulacion(codigo);
  return titulacion ? titulacion.corto : codigo;
}
