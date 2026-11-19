// Ayudas para apuntar turnos en Mi calendario: turnos rápidos, días de la semana y repetir.

// Turnos de ocho horas que se pueden poner con un botón (después se pueden cambiar las horas)
export const TURNOS = [
  { id: "manana", nombre: "Mañana", horaInicio: "07:00", horaFin: "15:00", motivo: "Turno de mañana" },
  { id: "tarde", nombre: "Tarde", horaInicio: "15:00", horaFin: "23:00", motivo: "Turno de tarde" },
  { id: "noche", nombre: "Noche", horaInicio: "23:00", horaFin: "07:00", motivo: "Turno de noche" },
];

// Los días de la semana como los entiende el servidor (en inglés), empezando por el lunes
export const DIAS_SEMANA = [
  { valor: "MONDAY", corto: "L", nombre: "Lunes" },
  { valor: "TUESDAY", corto: "M", nombre: "Martes" },
  { valor: "WEDNESDAY", corto: "X", nombre: "Miércoles" },
  { valor: "THURSDAY", corto: "J", nombre: "Jueves" },
  { valor: "FRIDAY", corto: "V", nombre: "Viernes" },
  { valor: "SATURDAY", corto: "S", nombre: "Sábado" },
  { valor: "SUNDAY", corto: "D", nombre: "Domingo" },
];

export const LUNES_A_VIERNES = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

export const TODOS_LOS_DIAS = DIAS_SEMANA.map((dia) => dia.valor);

// Lo máximo que se puede repetir un rato: unos seis meses (lo mismo que acepta el servidor)
export const MAXIMO_DIAS_REPETICION = 183;

// Los nombres de Date.getDay(): 0 es el domingo
const NOMBRES_GET_DAY = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

// El día de la semana de una fecha como 2026-12-10, en el formato del servidor ("THURSDAY")
export function diaDeLaSemana(fecha) {
  const partes = fecha.split("-").map(Number);
  return NOMBRES_GET_DAY[new Date(partes[0], partes[1] - 1, partes[2]).getDay()];
}

// Un turno de noche es el que acaba a una hora anterior a la de inicio (de 23:00 a 07:00).
// Las horas tienen el formato 08:00, así que se pueden comparar como texto
export function esTurnoDeNoche(horaInicio, horaFin) {
  return Boolean(horaInicio) && Boolean(horaFin) && horaFin < horaInicio;
}

// Frase para contar lo que ha pasado al repetir un rato. resumen viene del servidor: { creados, duplicados }
export function resumenDeRepeticion(resumen) {
  const partes = [];

  if (resumen.creados > 0) {
    const rato = resumen.creados === 1 ? "rato ocupado" : "ratos ocupados";
    partes.push("Hemos añadido " + resumen.creados + " " + rato + " a tu calendario.");
  } else {
    partes.push("No hemos añadido ningún rato nuevo.");
  }

  if (resumen.duplicados > 0) {
    const verbo = resumen.duplicados === 1 ? "ya estaba" : "ya estaban";
    partes.push(resumen.duplicados + " " + verbo + " en tu calendario.");
  }

  return partes.join(" ");
}
