// Necesidades de cuidado del paciente (categorías generales, no diagnósticos)
export const NECESIDADES = [
  { codigo: "movilidad", nombre: "Movilidad reducida" },
  { codigo: "cognitivo", nombre: "Deterioro cognitivo" },
  { codigo: "medicacion", nombre: "Medicación" },
  { codigo: "higiene", nombre: "Higiene personal" },
  { codigo: "alimentacion", nombre: "Alimentación" },
  { codigo: "nocturno", nombre: "Acompañamiento nocturno" },
  { codigo: "paliativos", nombre: "Cuidados paliativos" },
];

// Devuelve el nombre de una necesidad a partir de su código
export function nombreNecesidad(codigo) {
  for (const necesidad of NECESIDADES) {
    if (necesidad.codigo === codigo) {
      return necesidad.nombre;
    }
  }
  return codigo;
}
