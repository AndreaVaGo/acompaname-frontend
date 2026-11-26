// Validación del formulario "Solicitar servicio" antes de enviarlo.
// Devuelve un mapa de errores { campo: "mensaje" } (vacío = todo correcto), con las mismas
// reglas que aplica el back, para avisar de cada fallo en su campo sin esperar a un 400.
//
// Nombres de los campos: grupoEdad, tipoCuidado, hospital, ubicacionHospital, direccion,
// fechaInicio, fechaFin, horaInicio, horaFin, notas y, por cada persona (empezando en 0),
// "personas.0.nombre", "personas.0.edad" y "personas.0.grupoEdad".

import { buscarGrupo, edadValidaParaGrupo } from "@/utils/catalogoGrupos";

const MAX_NOTAS = 1000;

function dosCifras(numero) {
  if (numero < 10) {
    return "0" + numero;
  }
  return String(numero);
}

// Fecha de hoy como AAAA-MM-DD, con la hora del ordenador (toISOString usa la hora UTC
// y cerca de la medianoche daría el día equivocado)
export function fechaDeHoy(ahora = new Date()) {
  const mes = dosCifras(ahora.getMonth() + 1);
  const dia = dosCifras(ahora.getDate());
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

// Orden en que salen los campos en pantalla (sirve para llevar el cursor al primero con error)
export function ordenDeCampos(numeroDePersonas) {
  const orden = ["grupoEdad", "tipoCuidado", "hospital", "ubicacionHospital", "direccion"];
  orden.push("fechaInicio", "fechaFin", "horaInicio", "horaFin");
  for (let i = 0; i < numeroDePersonas; i++) {
    orden.push(`personas.${i}.nombre`, `personas.${i}.edad`, `personas.${i}.grupoEdad`);
  }
  orden.push("necesidades", "notas");
  return orden;
}

// Pasa del nombre de un campo del back al del formulario.
// El back dice "fechaCuidado" donde el formulario dice "fechaInicio", y "personas[0].nombre"
// donde el formulario dice "personas.0.nombre"
export function campoDeSolicitud(campoDelServidor) {
  if (campoDelServidor === "fechaCuidado") {
    return "fechaInicio";
  }
  return campoDelServidor.replace("[", ".").replace("]", "");
}

function faltaTexto(texto) {
  return !texto || !texto.trim();
}

function faltaEdad(edad) {
  return edad === "" || edad === null || edad === undefined;
}

// La edad 0 es válida (un bebé), por eso no se puede comprobar con "!edad"
function errorDeEdad(persona, codigoDeGrupo) {
  if (faltaEdad(persona.edad)) {
    return "Escribe la edad de la persona.";
  }
  const edad = Number(persona.edad);
  if (!Number.isInteger(edad)) {
    return "La edad tiene que ser un número entero.";
  }
  if (!edadValidaParaGrupo(codigoDeGrupo, edad)) {
    const grupo = buscarGrupo(codigoDeGrupo);
    return `Para "${grupo.nombre}" la edad tiene que estar entre ${grupo.edadMin} y ${grupo.edadMax} años.`;
  }
  return "";
}

function validarLugar(datos, errores) {
  if (datos.tipoCuidado === "hospitalario") {
    if (faltaTexto(datos.hospital)) {
      errores.hospital = "Escribe el nombre del hospital.";
    }
    if (faltaTexto(datos.ubicacionHospital)) {
      errores.ubicacionHospital = "Indica la planta, el área y la habitación.";
    }
  } else if (datos.tipoCuidado === "domicilio" && faltaTexto(datos.direccion)) {
    errores.direccion = "Escribe la dirección del domicilio.";
  }
}

function validarFechas(datos, errores, hoy) {
  // Las fechas tienen formato AAAA-MM-DD, así que se pueden comparar como texto
  if (!datos.fechaInicio) {
    errores.fechaInicio = "Elige la fecha de inicio.";
  } else if (datos.fechaInicio < hoy) {
    errores.fechaInicio = "La fecha de inicio no puede estar en el pasado.";
  }

  if (datos.fechaFin) {
    if (datos.fechaInicio && datos.fechaFin < datos.fechaInicio) {
      errores.fechaFin = "La fecha de fin no puede ser anterior a la de inicio.";
    } else if (datos.fechaFin < hoy) {
      errores.fechaFin = "La fecha de fin no puede estar en el pasado.";
    }
  }
}

function validarHoras(datos, errores) {
  if (!datos.horaInicio) {
    errores.horaInicio = "Elige la hora de inicio.";
  }
  if (!datos.horaFin) {
    errores.horaFin = "Elige la hora de fin.";
  }
  if (!datos.horaInicio || !datos.horaFin) {
    return;
  }
  // Si el cuidado dura un solo día, la hora de fin tiene que ser posterior a la de inicio
  // (las horas tienen formato HH:mm, así que también se pueden comparar como texto)
  const variosDias = datos.fechaFin && datos.fechaFin > datos.fechaInicio;
  if (!variosDias && datos.horaFin <= datos.horaInicio) {
    errores.horaFin = "La hora de fin tiene que ser posterior a la de inicio.";
  }
}

function validarPersonas(datos, errores) {
  for (let i = 0; i < datos.personas.length; i++) {
    const persona = datos.personas[i];
    // El grupo de la primera persona es el que se elige arriba; las demás tienen el suyo
    let codigoDeGrupo = persona.grupoEdad;
    if (i === 0) {
      codigoDeGrupo = datos.grupoEdad;
    }

    if (faltaTexto(persona.nombre)) {
      errores[`personas.${i}.nombre`] = "Escribe el nombre de la persona.";
    }
    if (i > 0 && !codigoDeGrupo) {
      errores[`personas.${i}.grupoEdad`] = "Elige el grupo de edad de esta persona.";
    }
    // La edad solo se comprueba contra el grupo si el grupo está elegido
    const errorEdad = errorDeEdad(persona, codigoDeGrupo);
    if (errorEdad) {
      errores[`personas.${i}.edad`] = errorEdad;
    }
  }
}

// datos: { grupoEdad, tipoCuidado, hospital, ubicacionHospital, direccion, fechaInicio,
//          fechaFin, horaInicio, horaFin, personas: [{ nombre, edad, grupoEdad }], notas }
// hoy: la fecha de hoy como AAAA-MM-DD (se puede pasar otra para los tests)
export function validarSolicitud(datos, hoy = fechaDeHoy()) {
  const errores = {};

  if (!datos.grupoEdad) {
    errores.grupoEdad = "Elige quién necesita cuidados.";
  }
  if (!datos.tipoCuidado) {
    errores.tipoCuidado = "Elige el tipo de cuidado.";
  }
  validarLugar(datos, errores);
  validarFechas(datos, errores, hoy);
  validarHoras(datos, errores);
  validarPersonas(datos, errores);

  if (datos.notas && datos.notas.length > MAX_NOTAS) {
    errores.notas = `La información no puede superar ${MAX_NOTAS} caracteres.`;
  }
  return errores;
}
