// Catálogo de cuidados: lo usan tanto los servicios en los que un cuidador
// tiene experiencia como las necesidades de cuidado del paciente.
// "codigo" es lo que se guarda en la base de datos y "nombre" lo que se ve en pantalla.
export const CUIDADOS = [
  { codigo: "movilidad", nombre: "Movilidad reducida" },
  { codigo: "cognitivo", nombre: "Deterioro cognitivo" },
  { codigo: "medicacion", nombre: "Medicación" },
  { codigo: "higiene", nombre: "Higiene personal" },
  { codigo: "alimentacion", nombre: "Alimentación" },
  { codigo: "nocturno", nombre: "Acompañamiento nocturno" },
  { codigo: "paliativos", nombre: "Cuidados paliativos" },
];

// Devuelve el nombre que se ve en pantalla a partir del código
export function nombreCuidado(codigo) {
  for (const cuidado of CUIDADOS) {
    if (cuidado.codigo === codigo) {
      return cuidado.nombre;
    }
  }
  return codigo;
}