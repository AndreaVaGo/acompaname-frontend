// El tipo de cuidado llega en minúsculas (hospitalario) y se enseña con la primera en mayúscula.
export function nombreTipo(tipo) {
  if (!tipo) {
    return "";
  }
  return tipo.charAt(0).toUpperCase() + tipo.slice(1);
}

// Color de la píldora del tipo: hospitalario en azul, domicilio en verde y otro en gris.
export function colorTipo(tipo) {
  if (tipo === "hospitalario") {
    return "azul";
  }
  if (tipo === "domicilio") {
    return "verde";
  }
  return "gris";
}
