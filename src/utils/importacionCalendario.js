// Frases para contar cómo ha ido la importación de un calendario (.ics).
// resumen viene del servidor: { importados, duplicados, omitidos }
export function resumenDeImportacion(resumen) {
  const partes = [];

  if (resumen.importados > 0) {
    const rato = resumen.importados === 1 ? "rato ocupado" : "ratos ocupados";
    partes.push("Hemos añadido " + resumen.importados + " " + rato + " a tu calendario.");
  } else {
    partes.push("No hemos añadido ningún rato nuevo.");
  }

  if (resumen.duplicados > 0) {
    const verbo = resumen.duplicados === 1 ? "ya estaba" : "ya estaban";
    partes.push(resumen.duplicados + " " + verbo + " en tu calendario.");
  }

  if (resumen.omitidos > 0) {
    partes.push(
      "Hemos dejado fuera " +
        resumen.omitidos +
        " (eventos repetidos, cancelados, marcados como libres o ya pasados).",
    );
  }

  return partes.join(" ");
}
