// Funciones para dibujar un calendario mensual. Los meses van de 0 (enero) a 11 (diciembre),
// como en Date de JavaScript, y las fechas se escriben como las usa el back: 2026-12-01.

export const NOMBRES_MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// La semana empieza en lunes
export const NOMBRES_DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function dosDigitos(numero) {
  return String(numero).padStart(2, "0");
}

// Une año, mes (0-11) y día en una fecha como 2026-12-01
export function fechaISO(anio, mes, dia) {
  return `${anio}-${dosDigitos(mes + 1)}-${dosDigitos(dia)}`;
}

// La fecha de hoy con la hora de aquí (no la UTC)
export function hoyEnFormatoISO() {
  const ahora = new Date();
  return fechaISO(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
}

// Cuántos días tiene un mes (el día 0 del mes siguiente es el último de este)
export function diasEnElMes(anio, mes) {
  return new Date(anio, mes + 1, 0).getDate();
}

// Las casillas de un mes: primero tantos null como huecos haya hasta el primer día
// (para que caiga en su día de la semana) y luego un objeto { dia, fecha } por cada día
export function celdasDelMes(anio, mes) {
  const celdas = [];
  // getDay() da 0 para el domingo; así el lunes es 0 y el domingo es 6
  const huecos = (new Date(anio, mes, 1).getDay() + 6) % 7;
  for (let i = 0; i < huecos; i++) {
    celdas.push(null);
  }
  const total = diasEnElMes(anio, mes);
  for (let dia = 1; dia <= total; dia++) {
    celdas.push({ dia: dia, fecha: fechaISO(anio, mes, dia) });
  }
  return celdas;
}

// Todas las fechas entre dos (las dos incluidas). Si la de fin es anterior, devuelve una lista vacía
export function fechasEntre(inicio, fin) {
  const lista = [];
  const [anioInicio, mesInicio, diaInicio] = inicio.split("-").map(Number);
  const [anioFin, mesFin, diaFin] = fin.split("-").map(Number);
  const ultimo = new Date(anioFin, mesFin - 1, diaFin);
  let actual = new Date(anioInicio, mesInicio - 1, diaInicio);
  while (actual <= ultimo) {
    lista.push(fechaISO(actual.getFullYear(), actual.getMonth(), actual.getDate()));
    actual = new Date(actual.getFullYear(), actual.getMonth(), actual.getDate() + 1);
  }
  return lista;
}

// Pasa una hora ("09:30" o "09:30:00") a minutos desde las 00:00 (570). Si no hay hora, devuelve 0
export function minutosDeLaHora(hora) {
  if (!hora) {
    return 0;
  }
  const partes = hora.split(":");
  return Number(partes[0]) * 60 + Number(partes[1]);
}

// A partir de 8 horas apuntadas en un día se considera un día completo
export const MINUTOS_DIA_COMPLETO = 480;

// Los días de la semana tal como los da getDay(): el 0 es domingo
const NOMBRES_DIAS_LARGOS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// "2026-12-15" -> "Martes 15 de diciembre de 2026"
export function fechaEnLetras(fecha) {
  const partes = fecha.split("-").map(Number);
  const dia = new Date(partes[0], partes[1] - 1, partes[2]);
  const nombreDelMes = NOMBRES_MESES[partes[1] - 1].toLowerCase();
  return NOMBRES_DIAS_LARGOS[dia.getDay()] + " " + partes[2] + " de " + nombreDelMes + " de " + partes[0];
}

// 45 -> "45 min", 180 -> "3 h", 210 -> "3 h 30 min"
export function formatearDuracion(minutos) {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) {
    return resto + " min";
  }
  if (resto === 0) {
    return horas + " h";
  }
  return horas + " h " + resto + " min";
}
