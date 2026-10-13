// Servicios en los que un cuidador puede tener experiencia.
// "codigo" es lo que se guarda en la base de datos y "nombre" lo que se ve en pantalla.
export const SERVICIOS = [
  { codigo: "movilidad", nombre: "Movilidad reducida" },
  { codigo: "cognitivo", nombre: "Deterioro cognitivo" },
  { codigo: "medicacion", nombre: "Medicación" },
  { codigo: "higiene", nombre: "Higiene personal" },
  { codigo: "alimentacion", nombre: "Alimentación" },
  { codigo: "nocturno", nombre: "Acompañamiento nocturno" },
  { codigo: "paliativos", nombre: "Cuidados paliativos" },
];

// Devuelve el nombre que se ve en pantalla a partir del código
export function nombreServicio(codigo) {
  for (const servicio of SERVICIOS) {
    if (servicio.codigo === codigo) {
      return servicio.nombre;
    }
  }
  return codigo;
}