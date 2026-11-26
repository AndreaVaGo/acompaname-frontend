// Errores por campo de un formulario.
// Un "mapa de errores" es un objeto { campo: "mensaje" }. Si está vacío, no hay errores.

// Cuando el back rechaza un formulario con un 400, explica qué campo falla con un JSON como
// {"fechaCuidado":"La fecha del cuidado no puede estar en el pasado"}.
// Esta función lo convierte en un mapa de errores. Si el error no es de ese tipo, devuelve {}.
// traducirCampo (opcional) pasa del nombre que usa el back al nombre del campo del formulario
export function erroresDelServidor(error, traducirCampo) {
  if (!error || error.status !== 400 || !error.detalle) {
    return {};
  }

  let datos;
  try {
    datos = JSON.parse(error.detalle);
  } catch {
    // El texto no es un JSON (por ejemplo "El cuerpo de la petición no es válido")
    return {};
  }
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    return {};
  }

  const errores = {};
  for (const campoDelServidor of Object.keys(datos)) {
    const mensaje = datos[campoDelServidor];
    if (typeof mensaje !== "string" || !mensaje) {
      continue;
    }
    let campo = campoDelServidor;
    if (traducirCampo) {
      campo = traducirCampo(campoDelServidor);
    }
    // Si dos campos del back acaban en el mismo del formulario, se queda el primero
    if (!errores[campo]) {
      errores[campo] = mensaje;
    }
  }
  return errores;
}

// Devuelve el primero de los campos (en el orden en que aparecen en pantalla) que tiene error,
// o un texto vacío si ninguno. Sirve para llevar el cursor a ese campo
export function primerCampoConError(errores, ordenDeCampos) {
  for (const campo of ordenDeCampos) {
    if (errores[campo]) {
      return campo;
    }
  }
  return "";
}

// Dice si hay algún error en el mapa
export function hayErrores(errores) {
  return Object.keys(errores).length > 0;
}
