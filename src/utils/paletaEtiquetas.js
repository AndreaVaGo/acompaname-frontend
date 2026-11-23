// Colores fijos de las etiquetas de servicios y titulaciones.
// Cada color tiene tres tonos:
//  - fondo y texto: para las etiquetas normales (fondo suave, letra oscura)
//  - solido: para las titulaciones, que se destacan con el fondo lleno y letra blanca
// Todos cumplen un contraste de al menos 4,5 a 1 (lo comprueba un test), para que se lean bien.
export const PALETA = {
  verde: { fondo: "#DDF0E3", texto: "#1F6B3A", solido: "#2E7D5B" },
  naranja: { fondo: "#FDE9D0", texto: "#8A4B08", solido: "#B45F06" },
  turquesa: { fondo: "#D3EFF1", texto: "#11616B", solido: "#12707B" },
  azul: { fondo: "#DCE8FB", texto: "#1F4F9E", solido: "#2D5FA8" },
  morado: { fondo: "#E8E0F7", texto: "#5B3A9E", solido: "#6B46B5" },
  indigo: { fondo: "#DEE1F6", texto: "#33407F", solido: "#3F4E9C" },
  rosa: { fondo: "#FBE0EA", texto: "#9B2457", solido: "#B02B66" },
  marron: { fondo: "#F1E7DA", texto: "#6B4A1F", solido: "#7D5826" },
  coral: { fondo: "#FBE1DA", texto: "#A33B1F", solido: "#B8472B" },
  oliva: { fondo: "#EDEFCB", texto: "#5C6410", solido: "#6B7414" },
  // Para lo que no está en el catálogo
  neutro: { fondo: "#F0F0F0", texto: "#444444", solido: "#555555" },
};

// Devuelve los tres tonos de un color por su nombre (si no existe, el neutro)
export function coloresDe(nombre) {
  return PALETA[nombre] || PALETA.neutro;
}
