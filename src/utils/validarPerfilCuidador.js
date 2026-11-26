// Validación del formulario "Mi perfil profesional" (persona cuidadora), campo por campo.
// Devuelve un mapa de errores { campo: "mensaje" }: si está vacío, todo está bien.
// El back vuelve a comprobar todo; esto solo evita una petición y dice qué campo falla.

// Orden en el que aparecen los campos en pantalla (sirve para llevar el cursor al primer error)
export const ORDEN_PERFIL = [
  "especialidad",
  "anosExperiencia",
  "tarifaHora",
  "recargoPersonaExtra",
  "bio",
];

export function validarPerfilCuidador(datos) {
  const errores = {};

  if (!datos.especialidad.trim()) {
    errores.especialidad = "Escribe tu especialidad.";
  }

  if (Number(datos.anosExperiencia) < 0) {
    errores.anosExperiencia = "Los años de experiencia no pueden ser negativos.";
  }

  if (!(Number(datos.tarifaHora) > 0)) {
    errores.tarifaHora = "La tarifa por hora debe ser mayor que 0.";
  }

  // El recargo es opcional, pero si se pone tiene que ser un número entero entre 0 y 100
  const recargoVacio =
    datos.recargoPersonaExtra === "" || datos.recargoPersonaExtra === null;
  if (!recargoVacio) {
    const recargo = Number(datos.recargoPersonaExtra);
    if (!Number.isInteger(recargo) || recargo < 0 || recargo > 100) {
      errores.recargoPersonaExtra =
        "El recargo por persona extra debe ser un número entero entre 0 y 100.";
    }
  }

  if (!datos.bio.trim()) {
    errores.bio = "Cuéntales algo sobre ti.";
  }

  return errores;
}
