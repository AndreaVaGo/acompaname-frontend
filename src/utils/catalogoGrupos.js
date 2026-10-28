// Catálogo de grupos de edad de la persona que recibe el cuidado.
// Lo usan el perfil de la persona cuidadora, el buscador y el formulario de solicitud,
// así que está escrito UNA sola vez aquí.
// "codigo" es lo que viaja al back (tiene que coincidir con el enum GrupoEdad),
// "nombre" es lo que se ve en pantalla y "edades" explica el rango.
// "edadMin" y "edadMax" son los límites que acepta el formulario de solicitud, y los
// "ejemplo..." son los textos de ayuda que se ven en cada campo según el grupo elegido.
export const GRUPOS = [
  {
    codigo: "BEBES",
    nombre: "Bebés",
    edades: "De 0 a 3 años",
    edadMin: 0,
    edadMax: 3,
    ejemploNombre: "Lucía",
    ejemploEdad: "1",
    ejemploNotas:
      "Pediatra de referencia, alergias o intolerancias, horarios de comida y de sueño, vacunas, rutinas que la calman...",
  },
  {
    codigo: "NINOS",
    nombre: "Niñas y niños",
    edades: "De 4 a 12 años",
    edadMin: 4,
    edadMax: 12,
    ejemploNombre: "Mateo",
    ejemploEdad: "8",
    ejemploNotas:
      "Pediatra de referencia, alergias, medicación, horarios de comida, rutinas que le tranquilizan...",
  },
  {
    codigo: "ADOLESCENTES",
    nombre: "Adolescentes",
    edades: "De 13 a 17 años",
    edadMin: 13,
    edadMax: 17,
    ejemploNombre: "Daniel",
    ejemploEdad: "15",
    ejemploNotas:
      "Médico de referencia, alergias, medicación, horarios de descanso, cómo prefiere que le acompañen...",
  },
  {
    codigo: "ADULTOS",
    nombre: "Personas adultas",
    edades: "De 18 a 64 años",
    edadMin: 18,
    edadMax: 64,
    ejemploNombre: "Marta Gómez",
    ejemploEdad: "45",
    ejemploNotas:
      "Horario de medicación, alergias, movilidad, rutinas diarias, cualquier detalle que la persona cuidadora deba conocer...",
  },
  {
    codigo: "MAYORES",
    nombre: "Personas mayores",
    edades: "65 años o más",
    edadMin: 65,
    edadMax: 120,
    ejemploNombre: "Antonio Serrano",
    ejemploEdad: "81",
    ejemploNotas:
      "Horario de medicación, alergias, rutinas diarias, movilidad, cualquier detalle que la persona cuidadora deba conocer...",
  },
  {
    codigo: "DISCAPACIDAD_DEPENDENCIA",
    nombre: "Discapacidad o dependencia",
    edades: "A cualquier edad",
    edadMin: 0,
    edadMax: 120,
    ejemploNombre: "Carmen Ruiz",
    ejemploEdad: "34",
    ejemploNotas:
      "Apoyos que necesita, medicación, alergias, movilidad, cómo se comunica, rutinas diarias...",
  },
];

// Devuelve el grupo completo a partir del código (o undefined si no existe)
export function buscarGrupo(codigo) {
  return GRUPOS.find((grupo) => grupo.codigo === codigo);
}

// Devuelve el nombre que se ve en pantalla a partir del código
export function nombreGrupo(codigo) {
  const grupo = buscarGrupo(codigo);
  return grupo ? grupo.nombre : codigo;
}

// Comprueba que una edad cabe en el grupo elegido (con un grupo desconocido vale cualquiera)
export function edadValidaParaGrupo(codigo, edad) {
  const grupo = buscarGrupo(codigo);
  if (!grupo) {
    return true;
  }
  return edad >= grupo.edadMin && edad <= grupo.edadMax;
}