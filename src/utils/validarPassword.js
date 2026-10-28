// Reglas de contraseña segura. Son las mismas que valida el back con @PasswordSegura:
// entre 8 y 72 caracteres, con mayúscula, minúscula, número y carácter especial.
// Si se cambia una regla aquí, hay que cambiarla también en el back.

const LONGITUD_MINIMA = 8;
const LONGITUD_MAXIMA = 72;

// Devuelve la lista de requisitos que NO cumple la contraseña.
// Si la lista está vacía, la contraseña es válida.
export function requisitosQueFaltan(password) {
  const faltan = [];

  if (password.length < LONGITUD_MINIMA) {
    faltan.push("al menos 8 caracteres");
  }
  if (password.length > LONGITUD_MAXIMA) {
    faltan.push("como máximo 72 caracteres");
  }
  // .test() devuelve true si el texto contiene lo que busca la expresión regular:
  // [A-Z] una mayúscula, [a-z] una minúscula, [0-9] un número
  // y [^A-Za-z0-9] cualquier cosa que no sea letra ni número (carácter especial)
  if (!/[A-Z]/.test(password)) {
    faltan.push("una letra mayúscula");
  }
  if (!/[a-z]/.test(password)) {
    faltan.push("una letra minúscula");
  }
  if (!/[0-9]/.test(password)) {
    faltan.push("un número");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    faltan.push("un carácter especial (por ejemplo ! @ # $ %)");
  }

  return faltan;
}

// Devuelve el texto de error para enseñar a la persona, o "" si la contraseña es válida.
export function mensajePassword(password) {
  const faltan = requisitosQueFaltan(password);
  if (faltan.length === 0) {
    return "";
  }
  return "La contraseña debe tener: " + faltan.join(", ") + ".";
}