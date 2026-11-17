// Título y descripción de cada página (los pone el router al cambiar de ruta)
export const NOMBRE_WEB = "Acompáñame";
export const DESCRIPCION_POR_DEFECTO =
  "Encuentra personas cuidadoras de confianza para acompañar a tu familiar en el hospital o en casa. Nunca sola, nunca solo.";

// "Aviso legal · Acompáñame". Sin título, solo el nombre de la web
export function tituloDePagina(titulo) {
  if (!titulo) {
    return NOMBRE_WEB;
  }
  return titulo + " · " + NOMBRE_WEB;
}

export function aplicarMeta(meta) {
  document.title = tituloDePagina(meta.titulo);

  const etiqueta = document.querySelector('meta[name="description"]');
  if (etiqueta) {
    etiqueta.setAttribute("content", meta.descripcion || DESCRIPCION_POR_DEFECTO);
  }
}
