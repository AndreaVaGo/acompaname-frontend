// Convierte el error de una petición en un texto claro para la persona que usa la app.
// contexto es lo que se intentaba hacer (por ejemplo "No se pudo enviar la solicitud.")
// y se le añade el motivo según el código HTTP del error.

// Añade el punto final si el texto del servidor no lo trae
function conPunto(texto) {
  if (texto.endsWith(".")) {
    return texto;
  }
  return texto + ".";
}

function motivoDe(error) {
  const status = error.status;

  if (status === 400) {
    return "Los datos enviados no son correctos.";
  }
  if (status === 401) {
    return "Tu sesión ha caducado. Vuelve a iniciar sesión.";
  }
  if (status === 403) {
    return "No tienes permiso para hacer esto.";
  }
  if (status === 404) {
    return "No se ha encontrado lo que buscas.";
  }
  if (status === 409) {
    // El servidor explica el conflicto (por ejemplo, otro servicio aceptado en esas fechas)
    if (error.detalle) {
      return conPunto(error.detalle);
    }
    return "Esta acción entra en conflicto con otra ya existente.";
  }
  if (status >= 500) {
    return "Ha ocurrido un error en el servidor. Inténtalo más tarde.";
  }
  // Sin código HTTP: fetch falla con un TypeError cuando no llega al servidor
  if (status === undefined && error instanceof TypeError) {
    return "No se pudo conectar con el servidor.";
  }
  return "";
}

export function mensajeDeError(error, contexto) {
  let motivo = "";
  if (error) {
    motivo = motivoDe(error);
  }
  if (!contexto) {
    return motivo;
  }
  if (!motivo) {
    return contexto;
  }
  return `${contexto} ${motivo}`;
}