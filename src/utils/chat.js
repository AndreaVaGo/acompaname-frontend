import { formatearMomento } from "./formatearHora";

// Une los mensajes que ya se tienen con los nuevos, sin repetir ninguno y en orden de llegada (por id)
export function unirMensajes(actuales, nuevos) {
  const resultado = [...actuales];

  for (const nuevo of nuevos) {
    let yaEsta = false;
    for (const existente of resultado) {
      if (existente.id === nuevo.id) {
        yaEsta = true;
      }
    }
    if (!yaEsta) {
      resultado.push(nuevo);
    }
  }

  resultado.sort((a, b) => a.id - b.id);
  return resultado;
}

// Id del último mensaje, para pedir solo los nuevos. Si no hay mensajes devuelve null
export function ultimoId(mensajes) {
  if (mensajes.length === 0) {
    return null;
  }
  let mayor = mensajes[0].id;
  for (const mensaje of mensajes) {
    if (mensaje.id > mayor) {
      mayor = mensaje.id;
    }
  }
  return mayor;
}

// La fecha del back llega como 2026-11-18T10:05:30: se muestra 18-11-2026 · 10:05
export function fechaDeMensaje(fecha) {
  if (!fecha) {
    return "";
  }
  return formatearMomento(fecha.slice(0, 10), fecha.slice(11, 16));
}
