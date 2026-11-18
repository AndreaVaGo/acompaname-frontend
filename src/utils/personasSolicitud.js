// Ayudas para mostrar las personas que reciben el cuidado en una solicitud.
// Una solicitud nueva trae la lista "personas" (nombre y edad de cada una).
// Una solicitud antigua solo trae nombrePaciente y edadPaciente: cuenta como una sola persona.

import { nombreGrupo } from "@/utils/catalogoGrupos";

// Devuelve siempre una lista de { nombre, edad, grupoEdad }
export function listaDePersonas(solicitud) {
  if (!solicitud) {
    return [];
  }
  if (Array.isArray(solicitud.personas) && solicitud.personas.length > 0) {
    return solicitud.personas;
  }
  if (solicitud.nombrePaciente) {
    return [{ nombre: solicitud.nombrePaciente, edad: solicitud.edadPaciente }];
  }
  return [];
}

// "Carmen", "Carmen y Antonio" o "Zoe, Ada y Leo"
export function nombresDePersonas(solicitud) {
  const nombres = [];
  for (const persona of listaDePersonas(solicitud)) {
    nombres.push(persona.nombre);
  }
  if (nombres.length <= 1) {
    return nombres.join("");
  }
  const ultimo = nombres.pop();
  return nombres.join(", ") + " y " + ultimo;
}

// "Carmen (82), Antonio (85)". Si no se sabe la edad, solo el nombre
export function resumenDePersonas(solicitud) {
  const partes = [];
  for (const persona of listaDePersonas(solicitud)) {
    if (persona.edad === undefined || persona.edad === null) {
      partes.push(persona.nombre);
    } else {
      partes.push(persona.nombre + " (" + persona.edad + ")");
    }
  }
  return partes.join(", ");
}

// Una persona: "Carmen, 82 años". Varias: "Carmen (82 años), Antonio (85 años)"
export function detalleDePersonas(solicitud) {
  const personas = listaDePersonas(solicitud);
  const partes = [];
  for (const persona of personas) {
    const tieneEdad = persona.edad !== undefined && persona.edad !== null;
    if (!tieneEdad) {
      partes.push(persona.nombre);
    } else if (personas.length === 1) {
      partes.push(persona.nombre + ", " + persona.edad + " años");
    } else {
      partes.push(persona.nombre + " (" + persona.edad + " años)");
    }
  }
  return partes.join(", ");
}

export function hayVariasPersonas(solicitud) {
  return listaDePersonas(solicitud).length > 1;
}

// Códigos de los grupos de edad distintos de la solicitud, sin repetir y en orden.
// Una persona sin grupo (solicitud antigua) usa el grupo de la solicitud
export function gruposDePersonas(solicitud) {
  const grupos = [];
  for (const persona of listaDePersonas(solicitud)) {
    const codigo = persona.grupoEdad || (solicitud ? solicitud.grupoEdad : null);
    if (codigo && !grupos.includes(codigo)) {
      grupos.push(codigo);
    }
  }
  // Una solicitud sin personas pero con grupo también lo enseña
  if (grupos.length === 0 && solicitud && solicitud.grupoEdad) {
    grupos.push(solicitud.grupoEdad);
  }
  return grupos;
}

// "Niñas y niños, Personas mayores" (o un texto vacío si no hay grupos)
export function textoGrupos(solicitud) {
  const nombres = [];
  for (const codigo of gruposDePersonas(solicitud)) {
    nombres.push(nombreGrupo(codigo));
  }
  return nombres.join(", ");
}

export function hayVariosGrupos(solicitud) {
  return gruposDePersonas(solicitud).length > 1;
}
