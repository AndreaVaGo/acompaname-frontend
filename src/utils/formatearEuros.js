// Convierte un importe (1260 o 340.5) al formato que se muestra: 1.260,00 € y 340,50 €.
export function formatearEuros(importe) {
  const texto = Number(importe || 0).toFixed(2);
  const partes = texto.split(".");
  let enteros = partes[0];
  let conPuntos = "";

  // Se van separando los miles de tres en tres, de derecha a izquierda
  while (enteros.length > 3) {
    conPuntos = "." + enteros.slice(-3) + conPuntos;
    enteros = enteros.slice(0, -3);
  }

  return enteros + conPuntos + "," + partes[1] + " €";
}