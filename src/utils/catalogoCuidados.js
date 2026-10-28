import { GRUPOS } from "./catalogoGrupos";

// Catálogo de cuidados: lo usan tanto los servicios en los que un cuidador
// tiene experiencia como las necesidades de cuidado de la persona cuidada.
// "codigo" es lo que se guarda en la base de datos y "nombre" lo que se ve en pantalla.
// "grupos" dice para qué grupos de edad tiene sentido ese cuidado (códigos de catalogoGrupos).
// Para cambiar qué cuidados salen en cada grupo, solo hay que tocar esta tabla.

// Hay cuidados que sirven para todos los grupos
const TODOS = GRUPOS.map((grupo) => grupo.codigo);

export const CUIDADOS = [
  {
    codigo: "movilidad",
    nombre: "Movilidad reducida",
    grupos: ["NINOS", "ADOLESCENTES", "ADULTOS", "MAYORES", "DISCAPACIDAD_DEPENDENCIA"],
  },
  {
    codigo: "cognitivo",
    nombre: "Deterioro cognitivo",
    grupos: ["ADULTOS", "MAYORES", "DISCAPACIDAD_DEPENDENCIA"],
  },
  { codigo: "medicacion", nombre: "Medicación", grupos: TODOS },
  { codigo: "higiene", nombre: "Higiene personal", grupos: TODOS },
  { codigo: "alimentacion", nombre: "Alimentación", grupos: TODOS },
  { codigo: "nocturno", nombre: "Acompañamiento nocturno", grupos: TODOS },
  // También existen cuidados paliativos pediátricos, por eso sale en todos los grupos
  { codigo: "paliativos", nombre: "Cuidados paliativos", grupos: TODOS },
  { codigo: "lactancia", nombre: "Lactancia y biberones", grupos: ["BEBES"] },
  { codigo: "sueno", nombre: "Rutina de sueño", grupos: ["BEBES", "NINOS"] },
  {
    codigo: "juego",
    nombre: "Juego y actividades",
    grupos: ["BEBES", "NINOS", "ADOLESCENTES"],
  },
  { codigo: "escolar", nombre: "Apoyo escolar", grupos: ["NINOS", "ADOLESCENTES"] },
  {
    codigo: "compania",
    nombre: "Compañía y conversación",
    grupos: ["NINOS", "ADOLESCENTES", "ADULTOS", "MAYORES", "DISCAPACIDAD_DEPENDENCIA"],
  },
  {
    codigo: "comunicacion",
    nombre: "Apoyo en la comunicación",
    grupos: ["DISCAPACIDAD_DEPENDENCIA"],
  },
  {
    codigo: "traslados",
    nombre: "Traslados y citas médicas",
    grupos: ["ADULTOS", "MAYORES", "DISCAPACIDAD_DEPENDENCIA"],
  },
];

// Devuelve los cuidados que tienen sentido para un grupo de edad.
// Sin grupo (o con uno que no se conoce) devuelve todos.
export function cuidadosParaGrupo(codigoGrupo) {
  if (!TODOS.includes(codigoGrupo)) {
    return CUIDADOS;
  }
  return CUIDADOS.filter((cuidado) => cuidado.grupos.includes(codigoGrupo));
}

// Devuelve el nombre que se ve en pantalla a partir del código
export function nombreCuidado(codigo) {
  for (const cuidado of CUIDADOS) {
    if (cuidado.codigo === codigo) {
      return cuidado.nombre;
    }
  }
  return codigo;
}