// El tipo de cuidado llega en minúsculas (hospitalario) y se enseña con la primera en mayúscula.
export function nombreTipo(tipo) {
  if (!tipo) {
    return "";
  }
  return tipo.charAt(0).toUpperCase() + tipo.slice(1);
}
