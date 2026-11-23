// Catálogo de cuidados: lo usan tanto los servicios en los que una persona cuidadora
// tiene experiencia como las necesidades de cuidado de la persona cuidada.
// "codigo" es lo que se guarda en la base de datos y "nombre" lo que se ve en pantalla.
// "icono" y "color" (uno de la paleta de paletaEtiquetas.js) son fijos: se ven igual en todas las pantallas.
// Todos están pensados para acompañar a alguien enfermo o dependiente, en el hospital o en casa.
export const CUIDADOS = [
  { codigo: "movilidad", nombre: "Movilidad reducida", icono: "♿", color: "azul" },
  { codigo: "cognitivo", nombre: "Deterioro cognitivo", icono: "🧠", color: "morado" },
  { codigo: "medicacion", nombre: "Medicación", icono: "💊", color: "verde" },
  { codigo: "higiene", nombre: "Higiene personal", icono: "🛁", color: "turquesa" },
  { codigo: "alimentacion", nombre: "Alimentación", icono: "🍽️", color: "naranja" },
  { codigo: "nocturno", nombre: "Acompañamiento nocturno", icono: "🌙", color: "indigo" },
  { codigo: "paliativos", nombre: "Cuidados paliativos", icono: "🕊️", color: "rosa" },
  { codigo: "domicilio", nombre: "Ayuda a domicilio", icono: "🏠", color: "marron" },
  { codigo: "acompanamiento", nombre: "Acompañamiento general", icono: "🤝", color: "coral" },
  { codigo: "traslados", nombre: "Traslados y citas médicas", icono: "🚑", color: "oliva" },
];

// Devuelve el cuidado completo (con su icono y su color) a partir del código, o undefined si no existe
export function buscarCuidado(codigo) {
  return CUIDADOS.find((cuidado) => cuidado.codigo === codigo);
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