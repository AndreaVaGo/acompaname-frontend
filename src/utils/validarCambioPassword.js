// Validación del formulario "Cambiar contraseña", campo por campo.
// Devuelve un mapa de errores { campo: "mensaje" }: si está vacío, todo está bien.
import { mensajePassword } from "@/utils/validarPassword";

// Orden en el que aparecen los campos en pantalla (sirve para llevar el cursor al primer error)
export const ORDEN_CAMBIO_PASSWORD = [
  "passwordActual",
  "passwordNueva",
  "passwordRepetida",
];

export function validarCambioPassword(datos) {
  const errores = {};

  // La actual NO se comprueba contra las reglas: puede ser una contraseña antigua y débil
  if (!datos.passwordActual) {
    errores.passwordActual = "Escribe tu contraseña actual.";
  }

  if (!datos.passwordNueva) {
    errores.passwordNueva = "Escribe la contraseña nueva.";
  } else {
    const mensaje = mensajePassword(datos.passwordNueva);
    if (mensaje) {
      errores.passwordNueva = mensaje;
    }
  }

  if (!datos.passwordRepetida) {
    errores.passwordRepetida = "Repite la contraseña nueva.";
  } else if (datos.passwordNueva !== datos.passwordRepetida) {
    errores.passwordRepetida = "Las contraseñas nuevas no coinciden.";
  }

  return errores;
}
