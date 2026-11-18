// Texto corto que explica de dónde sale el importe de un pago: "4 horas · 3 personas (2 con recargo)".
// Si el back no manda las horas (pagos antiguos) no se enseña nada.
export function textoDesglose(pago) {
  if (!pago || !pago.horas) {
    return "";
  }

  let texto = pago.horas === 1 ? "1 hora" : pago.horas + " horas";

  const personas = pago.personas || 1;
  if (personas === 1) {
    texto = texto + " · 1 persona";
  } else {
    const conRecargo = personas - 1;
    texto = texto + " · " + personas + " personas (" + conRecargo + " con recargo)";
  }

  return texto;
}
