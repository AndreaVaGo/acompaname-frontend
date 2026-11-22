// Lo que la persona cuidadora puede demostrar y cómo se explica en pantalla
export const TIPOS_VERIFICACION = [
  {
    codigo: "TITULACION",
    nombre: "Titulación",
    etiqueta: "Número de colegiado, o centro y año del título",
    placeholder: "Por ejemplo: colegiado 33/12345",
    ayuda:
      "Escribe el número de colegiado (por ejemplo, de enfermería) o el centro y el año en que sacaste el título. El administrador lo comprobará. No subimos ningún documento.",
  },
  {
    codigo: "ANTECEDENTES",
    nombre: "Certificado de antecedentes (para cuidar menores)",
    etiqueta: "Código seguro de verificación (CSV)",
    placeholder: "Por ejemplo: SD:ABC123...",
    ayuda:
      "Para cuidar a menores se pide el certificado de delitos de naturaleza sexual. Pídelo en la sede electrónica del Ministerio de Justicia y escribe aquí su código seguro de verificación (empieza por SD:). No subimos el documento.",
  },
];

const ESTADOS = {
  PENDIENTE: "En revisión",
  VERIFICADO: "Verificado",
  RECHAZADO: "Rechazado",
};

// «Titulación» a partir de «TITULACION» (si no se conoce, se devuelve el mismo código)
export function nombreTipoVerificacion(codigo) {
  const tipo = TIPOS_VERIFICACION.find((t) => t.codigo === codigo);
  return tipo ? tipo.nombre : codigo;
}

// «En revisión» a partir de «PENDIENTE»
export function nombreEstadoVerificacion(estado) {
  return ESTADOS[estado] || estado;
}
