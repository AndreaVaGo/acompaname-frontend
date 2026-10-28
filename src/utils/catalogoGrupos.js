// Catálogo de grupos de edad de la persona que recibe el cuidado.
// Lo usan el perfil de la persona cuidadora, el buscador y el formulario de solicitud,
// así que está escrito UNA sola vez aquí.
// "codigo" es lo que viaja al back (tiene que coincidir con el enum GrupoEdad),
// "nombre" es lo que se ve en pantalla y "edades" explica el rango.
export const GRUPOS = [
  { codigo: "BEBES", nombre: "Bebés", edades: "De 0 a 3 años" },
  { codigo: "NINOS", nombre: "Niñas y niños", edades: "De 4 a 12 años" },
  { codigo: "ADOLESCENTES", nombre: "Adolescentes", edades: "De 13 a 17 años" },
  { codigo: "ADULTOS", nombre: "Personas adultas", edades: "De 18 a 64 años" },
  { codigo: "MAYORES", nombre: "Personas mayores", edades: "65 años o más" },
  {
    codigo: "DISCAPACIDAD_DEPENDENCIA",
    nombre: "Discapacidad o dependencia",
    edades: "A cualquier edad",
  },
];

// Devuelve el nombre que se ve en pantalla a partir del código
export function nombreGrupo(codigo) {
  for (const grupo of GRUPOS) {
    if (grupo.codigo === codigo) {
      return grupo.nombre;
    }
  }
  return codigo;
}