// Validación del formulario de registro, campo por campo.
// Devuelve un mapa de errores { campo: "mensaje" }: si está vacío, todo está bien.
// El back vuelve a comprobar todo; esto solo evita una petición y dice qué campo falla.
import { mensajePassword } from "@/utils/validarPassword";

// Orden en el que aparecen los campos en pantalla (sirve para llevar el cursor al primer error)
export const ORDEN_REGISTRO = [
  "nombre",
  "email",
  "password",
  "passwordRepetida",
  "telefono",
];

// Algo, una @, algo, un punto y algo; sin espacios. El back hace la comprobación definitiva
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Los tres datos de contacto, que también se editan en "Editar mis datos"
export function validarContacto(datos) {
  const errores = {};

  if (!datos.nombre.trim()) {
    errores.nombre = "Escribe tu nombre completo.";
  }

  const email = datos.email.trim();
  if (!email) {
    errores.email = "Escribe tu email.";
  } else if (!FORMATO_EMAIL.test(email)) {
    errores.email = "El email no tiene un formato válido.";
  }

  if (!datos.telefono.trim()) {
    errores.telefono = "Escribe tu teléfono.";
  }

  return errores;
}

export function validarRegistro(datos) {
  const errores = validarContacto(datos);

  if (!datos.password) {
    errores.password = "Escribe una contraseña.";
  } else {
    const mensaje = mensajePassword(datos.password);
    if (mensaje) {
      errores.password = mensaje;
    }
  }

  if (!datos.passwordRepetida) {
    errores.passwordRepetida = "Repite la contraseña.";
  } else if (datos.password !== datos.passwordRepetida) {
    errores.passwordRepetida = "Las contraseñas no coinciden.";
  }

  // Mismo orden que en pantalla: nombre, email, contraseñas y teléfono
  const ordenados = {};
  for (const campo of ORDEN_REGISTRO) {
    if (errores[campo]) {
      ordenados[campo] = errores[campo];
    }
  }
  return ordenados;
}
