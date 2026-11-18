// Efecto de foco: guarda dónde está el ratón dentro de la tarjeta (en píxeles)
// para que el CSS pueda pintar un resplandor suave justo debajo del puntero.
export function moverFoco(evento) {
  const tarjeta = evento.currentTarget;
  if (!tarjeta || !tarjeta.getBoundingClientRect) {
    return;
  }

  const caja = tarjeta.getBoundingClientRect();
  tarjeta.style.setProperty("--x", evento.clientX - caja.left + "px");
  tarjeta.style.setProperty("--y", evento.clientY - caja.top + "px");
}
