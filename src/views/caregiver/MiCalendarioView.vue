<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import BloqueOcupadoRepository from "@/repositories/BloqueOcupadoRepository";
import SolicitudRepository from "@/repositories/SolicitudRepository";
import CalendarioMensual from "@/components/CalendarioMensual.vue";
import LineaDelDia from "@/components/LineaDelDia.vue";
import { mensajeDeError } from "@/utils/mensajeDeError";
import { formatearFecha } from "@/utils/formatearFecha";
import { nombresDePersonas } from "@/utils/personasSolicitud";
import { formatearHora, formatearMomento } from "@/utils/formatearHora";
import { resumenDeImportacion } from "@/utils/importacionCalendario";
import { leerTexto } from "@/utils/leerArchivo";
import {
  hoyEnFormatoISO,
  fechasEntre,
  sumarDias,
  minutosDeLaHora,
  fechaEnLetras,
  formatearDuracion,
  MINUTOS_DIA_COMPLETO,
} from "@/utils/calendario";

const bloqueRepository = new BloqueOcupadoRepository();
const solicitudRepository = new SolicitudRepository();

// Lo mismo que acepta el servidor: el motivo puede tener hasta 100 caracteres
const MAXIMO_MOTIVO = 100;

// Tamaño máximo del archivo .ics que se puede importar (el servidor acepta hasta 500000 caracteres)
const MAXIMO_ARCHIVO = 500000;

const hoy = hoyEnFormatoISO();

const bloques = ref([]);
const cargando = ref(true);
const errorCarga = ref("");

// Los servicios que ya ha aceptado (también ocupan su calendario)
const servicios = ref([]);
const errorServicios = ref("");

// El día del calendario que está abierto: abajo se ven sus servicios y sus bloques
const diaSeleccionado = ref(hoy);

const fecha = ref("");
const horaInicio = ref("");
const horaFin = ref("");
const motivo = ref("");
const guardando = ref(false);
const error = ref("");
const aviso = ref("");

// Importar un calendario externo (.ics): tiene sus propios avisos para no mezclarse con los del formulario
const importando = ref(false);
const avisoImportar = ref("");
const errorImportar = ref("");

const MINUTOS_DEL_DIA = 1440;

// De qué hora a qué hora ocupa un servicio un día concreto (en minutos desde las 00:00).
// Un servicio sin horas (antiguo) se cuenta como día entero.
// En uno de varios días: el primer día va desde su hora de inicio hasta medianoche,
// los del medio son enteros y el último va desde medianoche hasta su hora de fin
function tramoDelServicioEnElDia(servicio, dia) {
  if (!servicio.horaInicio || !servicio.horaFin) {
    return { inicio: 0, fin: MINUTOS_DEL_DIA };
  }
  const inicio = minutosDeLaHora(servicio.horaInicio);
  const fin = minutosDeLaHora(servicio.horaFin);
  const ultimoDia = servicio.fechaFin || servicio.fechaCuidado;
  if (ultimoDia === servicio.fechaCuidado) {
    return { inicio: inicio, fin: fin };
  }
  if (dia === servicio.fechaCuidado) {
    return { inicio: inicio, fin: MINUTOS_DEL_DIA };
  }
  if (dia === ultimoDia) {
    return { inicio: 0, fin: fin };
  }
  return { inicio: 0, fin: MINUTOS_DEL_DIA };
}

// Cuántos minutos ocupa un servicio en un día concreto
function minutosDelServicioEnElDia(servicio, dia) {
  const tramo = tramoDelServicioEnElDia(servicio, dia);
  return tramo.fin - tramo.inicio;
}

// Lo que se pinta en el calendario: por cada día, cuántos servicios y bloques tiene
// y cuántos minutos suman (para saber si el día está completo o le quedan horas libres).
// Un servicio de varios días marca todos los días que dura
const marcas = computed(() => {
  const resultado = {};

  function marcar(dia, tipo, minutos) {
    if (!resultado[dia]) {
      resultado[dia] = { servicios: 0, bloques: 0, minutos: 0 };
    }
    resultado[dia][tipo] = resultado[dia][tipo] + 1;
    resultado[dia].minutos = resultado[dia].minutos + minutos;
  }

  for (const bloque of bloques.value) {
    const minutos = minutosDeLaHora(bloque.horaFin) - minutosDeLaHora(bloque.horaInicio);
    marcar(bloque.fecha, "bloques", minutos);
  }
  for (const servicio of servicios.value) {
    const ultimoDia = servicio.fechaFin || servicio.fechaCuidado;
    for (const dia of fechasEntre(servicio.fechaCuidado, ultimoDia)) {
      marcar(dia, "servicios", minutosDelServicioEnElDia(servicio, dia));
    }
  }
  return resultado;
});

const bloquesDelDia = computed(() => {
  const lista = [];
  for (const bloque of bloques.value) {
    if (bloque.fecha === diaSeleccionado.value) {
      lista.push(bloque);
    }
  }
  return lista;
});

const serviciosDelDia = computed(() => {
  const lista = [];
  for (const servicio of servicios.value) {
    const ultimoDia = servicio.fechaFin || servicio.fechaCuidado;
    if (servicio.fechaCuidado <= diaSeleccionado.value && diaSeleccionado.value <= ultimoDia) {
      lista.push(servicio);
    }
  }
  return lista;
});

const diaVacio = computed(
  () => bloquesDelDia.value.length === 0 && serviciosDelDia.value.length === 0,
);

// Lo que se pinta en la línea de horas del día abierto
const tramosDelDia = computed(() => {
  const tramos = [];
  for (const servicio of serviciosDelDia.value) {
    const tramo = tramoDelServicioEnElDia(servicio, diaSeleccionado.value);
    tramos.push({
      inicio: tramo.inicio,
      fin: tramo.fin,
      texto: "Servicio aceptado · Cuidado de " + nombresDePersonas(servicio),
    });
  }
  for (const bloque of bloquesDelDia.value) {
    tramos.push({
      inicio: minutosDeLaHora(bloque.horaInicio),
      fin: minutosDeLaHora(bloque.horaFin),
      texto: bloque.motivo ? "Rato ocupado · " + bloque.motivo : "Rato ocupado",
    });
  }
  return tramos;
});

// El número grande del panel (el día del mes)
const numeroDelDia = computed(() => Number(diaSeleccionado.value.split("-")[2]));

// Cuántos minutos tiene ocupados el día abierto
const minutosDelDia = computed(() => {
  const marca = marcas.value[diaSeleccionado.value];
  return marca ? marca.minutos : 0;
});

// "libre", "parcial" (quedan horas libres) o "completo"
const estadoDelDia = computed(() => {
  if (diaVacio.value) {
    return "libre";
  }
  if (minutosDelDia.value >= MINUTOS_DIA_COMPLETO) {
    return "completo";
  }
  return "parcial";
});

const textoDelEstado = computed(() => {
  if (estadoDelDia.value === "libre") {
    return "Día libre";
  }
  if (estadoDelDia.value === "completo") {
    return "Día completo · " + formatearDuracion(minutosDelDia.value) + " ocupadas";
  }
  return "Ocupado " + formatearDuracion(minutosDelDia.value) + " · te quedan horas libres";
});

async function cargarBloques() {
  errorCarga.value = "";
  try {
    bloques.value = await bloqueRepository.getMios();
  } catch (err) {
    errorCarga.value = mensajeDeError(err, "No se pudo cargar tu calendario.");
  } finally {
    cargando.value = false;
  }
}

// Carga las solicitudes de la persona y se queda con las aceptadas,
// por orden de fecha y, si es el mismo día, de hora
async function cargarServicios() {
  errorServicios.value = "";
  try {
    const todas = await solicitudRepository.getMisSolicitudes();
    const aceptadas = [];
    for (const solicitud of todas) {
      if (solicitud.estado === "ACEPTADA") {
        aceptadas.push(solicitud);
      }
    }
    aceptadas.sort((a, b) => {
      if (a.fechaCuidado !== b.fechaCuidado) {
        return a.fechaCuidado < b.fechaCuidado ? -1 : 1;
      }
      return (a.horaInicio || "") < (b.horaInicio || "") ? -1 : 1;
    });
    servicios.value = aceptadas;
  } catch (err) {
    errorServicios.value = mensajeDeError(err, "No se pudieron cargar tus servicios aceptados.");
  }
}

// Cuándo es el servicio: un solo día ("10-09-2026 · 09:00 - 12:00") o varios días ("10-09-2026 · 22:00 → 12-09-2026 · 08:00")
function cuandoEs(servicio) {
  if (servicio.fechaFin && servicio.fechaFin !== servicio.fechaCuidado) {
    return (
      formatearMomento(servicio.fechaCuidado, servicio.horaInicio) +
      " → " +
      formatearMomento(servicio.fechaFin, servicio.horaFin)
    );
  }
  if (!servicio.horaInicio) {
    return formatearFecha(servicio.fechaCuidado);
  }
  return (
    formatearFecha(servicio.fechaCuidado) +
    " · " +
    formatearHora(servicio.horaInicio) +
    " - " +
    formatearHora(servicio.horaFin)
  );
}

// Al pulsar un día se abre y, si no es pasado, se deja puesto en el formulario para añadir un bloque
function seleccionarDia(dia) {
  diaSeleccionado.value = dia;
  if (dia >= hoy) {
    fecha.value = dia;
  }
}

// Pasa al día siguiente (1) o al anterior (-1)
function moverDia(cuantos) {
  seleccionarDia(sumarDias(diaSeleccionado.value, cuantos));
}

// Deja el día abierto puesto en el formulario y lleva el cursor a la hora de inicio
async function irAlFormulario() {
  fecha.value = diaSeleccionado.value;
  await nextTick();
  const campo = document.getElementById("bloque-hora-inicio");
  if (campo) {
    if (campo.scrollIntoView) {
      campo.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    campo.focus();
  }
}

// Devuelve el texto del primer fallo que encuentre, o "" si todo está bien
function comprobarFormulario() {
  if (!fecha.value || !horaInicio.value || !horaFin.value) {
    return "Rellena la fecha y las horas de inicio y de fin.";
  }
  if (fecha.value < hoy) {
    return "La fecha no puede estar en el pasado.";
  }
  // Las horas tienen el formato 08:00, así que se pueden comparar como texto
  if (horaFin.value <= horaInicio.value) {
    return "La hora de fin tiene que ser posterior a la de inicio.";
  }
  return "";
}

async function guardarBloque() {
  error.value = "";
  aviso.value = "";
  const fallo = comprobarFormulario();
  if (fallo) {
    error.value = fallo;
    return;
  }
  guardando.value = true;
  try {
    await bloqueRepository.create({
      fecha: fecha.value,
      horaInicio: horaInicio.value,
      horaFin: horaFin.value,
      motivo: motivo.value.trim(),
    });
    // Se abre el día que se acaba de apuntar, para ver el bloque nuevo
    diaSeleccionado.value = fecha.value;
    fecha.value = "";
    horaInicio.value = "";
    horaFin.value = "";
    motivo.value = "";
    aviso.value = "Listo, hemos añadido ese rato a tu calendario.";
    await cargarBloques();
  } catch (err) {
    error.value = mensajeDeError(err, "No se pudo guardar el bloque.");
  } finally {
    guardando.value = false;
  }
}

// Si el servidor explica por qué el archivo no vale ("no parece un calendario", "demasiados eventos"),
// se enseña esa explicación. Si no, el mensaje de siempre según el código del error
function textoDelErrorDeImportar(err) {
  const detalle = err && err.detalle ? err.detalle.trim() : "";
  const esTexto = detalle !== "" && !detalle.startsWith("{") && !detalle.startsWith("[");
  if (err && err.status === 400 && esTexto) {
    return detalle;
  }
  return mensajeDeError(err, "No se pudo importar el calendario.");
}

// Al elegir un archivo .ics se lee y se manda al servidor, que crea los ratos ocupados
async function importarCalendario(evento) {
  avisoImportar.value = "";
  errorImportar.value = "";
  const entrada = evento.target;
  const archivo = entrada.files && entrada.files[0];
  if (!archivo) {
    return;
  }
  if (!archivo.name.toLowerCase().endsWith(".ics")) {
    errorImportar.value = "Elige un archivo con la extensión .ics.";
    entrada.value = "";
    return;
  }
  if (archivo.size > MAXIMO_ARCHIVO) {
    errorImportar.value = "El archivo es demasiado grande (máximo 500 KB). Exporta solo los próximos meses.";
    entrada.value = "";
    return;
  }
  importando.value = true;
  try {
    const contenido = await leerTexto(archivo);
    if (contenido.trim() === "") {
      errorImportar.value = "El archivo está vacío.";
      return;
    }
    const resumen = await bloqueRepository.importar(contenido);
    avisoImportar.value = resumenDeImportacion(resumen);
    await cargarBloques();
  } catch (err) {
    errorImportar.value = textoDelErrorDeImportar(err);
  } finally {
    importando.value = false;
    entrada.value = "";
  }
}

async function quitarBloque(bloque) {
  error.value = "";
  aviso.value = "";
  try {
    await bloqueRepository.remove(bloque.id);
    const quedan = [];
    for (const otro of bloques.value) {
      if (otro.id !== bloque.id) {
        quedan.push(otro);
      }
    }
    bloques.value = quedan;
  } catch (err) {
    error.value = mensajeDeError(err, "No se pudo quitar el bloque.");
  }
}

onMounted(() => {
  cargarBloques();
  cargarServicios();
});
</script>

<template>
  <div class="calendario">
    <div class="calendario__wrapper">
      <h1>Mi calendario</h1>
      <p class="calendario__subtitle">
        Aquí ves tus servicios aceptados y los ratos en los que no puedes trabajar (tu turno en el hospital,
        una cita...). Las familias no verán que estás disponible en esas horas y no podrás aceptar servicios
        que coincidan.
      </p>

      <div class="calendario__box">
        <CalendarioMensual
          :marcas="marcas"
          :seleccionado="diaSeleccionado"
          @seleccionar="seleccionarDia"
        />
      </div>

      <section class="calendario__detalle" aria-live="polite">
        <header class="calendario__cabecera-dia">
          <button
            type="button"
            id="dia-anterior"
            class="calendario__flecha-dia"
            aria-label="Día anterior"
            @click="moverDia(-1)"
          >
            ‹
          </button>
          <span class="calendario__numero-dia" aria-hidden="true">{{ numeroDelDia }}</span>
          <div class="calendario__cabecera-texto">
            <h2 class="calendario__titulo-lista">{{ fechaEnLetras(diaSeleccionado) }}</h2>
            <div class="calendario__etiquetas">
              <span v-if="diaSeleccionado === hoy" class="calendario__etiqueta calendario__etiqueta--hoy">Hoy</span>
              <span
                v-if="!cargando && !errorCarga"
                class="calendario__etiqueta"
                :class="'calendario__etiqueta--' + estadoDelDia"
              >
                {{ textoDelEstado }}
              </span>
            </div>
          </div>
          <button
            type="button"
            id="dia-siguiente"
            class="calendario__flecha-dia"
            aria-label="Día siguiente"
            @click="moverDia(1)"
          >
            ›
          </button>
        </header>

        <LineaDelDia v-if="!cargando && !errorCarga" :tramos="tramosDelDia" />

        <p v-if="cargando" class="calendario__vacio">Cargando tu calendario...</p>
        <p v-if="errorCarga" class="calendario__error" role="alert">{{ errorCarga }}</p>
        <p v-if="errorServicios" class="calendario__aviso-servicios" role="alert">{{ errorServicios }}</p>
        <div v-if="!cargando && !errorCarga && diaVacio" class="calendario__vacio-caja">
          <span class="calendario__vacio-icono" aria-hidden="true">🌿</span>
          <p class="calendario__vacio">No tienes nada apuntado este día.</p>
        </div>

        <ul class="calendario__lista">
          <li v-for="servicio in serviciosDelDia" :key="'s' + servicio.id" class="calendario__servicio">
            <span class="calendario__tipo">Servicio aceptado</span>
            <span class="calendario__bloque-fecha">{{ cuandoEs(servicio) }}</span>
            <span class="calendario__bloque-motivo">
              Cuidado de {{ nombresDePersonas(servicio) }} · Familia {{ servicio.familiaNombre }}
            </span>
          </li>
          <li v-for="bloque in bloquesDelDia" :key="'b' + bloque.id" class="calendario__bloque">
            <div class="calendario__bloque-datos">
              <span class="calendario__tipo">Rato ocupado</span>
              <span class="calendario__bloque-horas">
                {{ formatearHora(bloque.horaInicio) }} - {{ formatearHora(bloque.horaFin) }}
              </span>
              <span v-if="bloque.motivo" class="calendario__bloque-motivo">{{ bloque.motivo }}</span>
            </div>
            <button
              type="button"
              class="calendario__quitar"
              :aria-label="'Quitar el bloque del ' + formatearFecha(bloque.fecha)"
              @click="quitarBloque(bloque)"
            >
              Quitar
            </button>
          </li>
        </ul>

        <button
          v-if="diaSeleccionado >= hoy"
          type="button"
          class="btn btn--primary calendario__apuntar"
          @click="irAlFormulario"
        >
          Añadir un rato ocupado este día
        </button>
      </section>

      <div class="calendario__box calendario__box--formulario">
        <form class="formulario calendario__form" @submit.prevent="guardarBloque">
          <h2 class="titulo-seccion" data-icono="📅">Añadir un rato ocupado</h2>

          <label for="bloque-fecha">Día</label>
          <input id="bloque-fecha" v-model="fecha" type="date" :min="hoy" />

          <div class="calendario__horas">
            <div>
              <label for="bloque-hora-inicio">Desde las</label>
              <input id="bloque-hora-inicio" v-model="horaInicio" type="time" />
            </div>
            <div>
              <label for="bloque-hora-fin">Hasta las</label>
              <input id="bloque-hora-fin" v-model="horaFin" type="time" />
            </div>
          </div>

          <label for="bloque-motivo">Motivo (opcional)</label>
          <input
            id="bloque-motivo"
            v-model="motivo"
            type="text"
            :maxlength="MAXIMO_MOTIVO"
            placeholder="Por ejemplo: Turno en el hospital"
          />

          <p v-if="aviso" class="calendario__ok" role="status">{{ aviso }}</p>
          <p v-if="error" class="calendario__error" role="alert">{{ error }}</p>

          <button type="submit" class="btn btn--primary" :disabled="guardando">
            Añadir a mi calendario
          </button>
        </form>
      </div>

      <div class="calendario__box calendario__box--formulario">
        <section class="formulario calendario__importar">
          <h2 class="titulo-seccion" data-icono="📥">Importar desde otro calendario</h2>
          <p class="calendario__ayuda">
            Si ya apuntas tus turnos y citas en Google Calendar, Outlook o el calendario del móvil, exporta tu
            calendario como archivo .ics y súbelo aquí: se añadirán como ratos ocupados.
          </p>
          <ul class="calendario__ayuda-lista">
            <li>Solo se guardan las fechas y las horas. El título y los detalles de tus citas no se leen ni se guardan.</li>
            <li>Si importas el mismo archivo otra vez, no se duplica nada.</li>
            <li>Los eventos que se repiten (por ejemplo, un turno cada semana) todavía no se importan: añádelos a mano.</li>
          </ul>

          <label for="calendario-archivo">Archivo de calendario (.ics)</label>
          <input
            id="calendario-archivo"
            type="file"
            accept=".ics,text/calendar"
            :disabled="importando"
            @change="importarCalendario"
          />

          <p v-if="importando" class="calendario__ayuda" role="status">Importando tu calendario...</p>
          <p v-if="avisoImportar" class="calendario__ok" role="status">{{ avisoImportar }}</p>
          <p v-if="errorImportar" class="calendario__error" role="alert">{{ errorImportar }}</p>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendario {
  min-height: 100vh;
  background-color: var(--color-bg);
  font-family: var(--font-base);
  color: var(--color-text);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 24px 20px 32px;
}

.calendario__wrapper {
  max-width: 620px;
  width: 100%;
}

.calendario h1 {
  font-size: 1.8rem;
  margin: 0 0 6px;
}

.calendario__subtitle {
  font-size: 1.05rem;
  margin: 0 0 24px;
}

.calendario__box {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  border-top: 4px solid var(--color-accent);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.calendario__box--formulario {
  margin-top: 32px;
}

/* Etiquetas, campos y títulos de sección vienen de base.css (clases "formulario" y "titulo-seccion") */
.calendario__form {
  padding: 28px 32px 32px;

  & .titulo-seccion:first-child {
    margin-top: 0;
  }

  & .btn {
    padding: 14px;
  }

  & .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.calendario__horas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.calendario__importar {
  padding: 28px 32px 32px;

  & .titulo-seccion:first-child {
    margin-top: 0;
  }
}

.calendario__ayuda {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin: 0 0 12px;
}

.calendario__ayuda-lista {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin: 0 0 16px;
  padding-left: 20px;
}

.calendario__ok {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
  font-size: 0.9rem;
  font-weight: bold;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: 16px 0;
}

.calendario__error {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: 16px 0;
}

/* Panel del día abierto: una tarjeta con el día en grande, su estado y lo que hay apuntado */
.calendario__detalle {
  margin-top: 20px;
  padding: 20px 24px 24px;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  border-top: 4px solid var(--color-accent);
  box-shadow: var(--shadow-card);
}

.calendario__cabecera-dia {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

/* Las flechas para pasar de día, como las del calendario de arriba */
.calendario__flecha-dia {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--color-accent);
  background-color: var(--color-white);
  color: var(--color-accent);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.calendario__flecha-dia:hover {
  background-color: var(--color-accent-bg);
}

.calendario__cabecera-texto {
  flex: 1;
  min-width: 0;
}

.calendario__numero-dia {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: var(--radius-input);
  background-color: var(--color-accent);
  color: var(--color-white);
  font-size: 1.8rem;
  font-weight: bold;
}

.calendario__titulo-lista {
  font-size: 1.2rem;
  margin: 0;
}

.calendario__etiquetas {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}

.calendario__etiqueta {
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: bold;
}

.calendario__etiqueta--hoy {
  background-color: var(--color-accent-bg);
  color: var(--color-accent-dark);
}

.calendario__etiqueta--libre {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
}

.calendario__etiqueta--parcial {
  background-color: var(--color-info-bg);
  color: var(--color-info);
}

.calendario__etiqueta--completo {
  background-color: var(--color-info);
  color: var(--color-white);
}

.calendario__vacio-caja {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 0;
  text-align: center;
}

.calendario__vacio-icono {
  font-size: 2rem;
}

.calendario__vacio-caja .calendario__vacio {
  margin: 0;
}

.calendario__apuntar {
  width: 100%;
  margin-top: 16px;
  padding: 12px;
}

.calendario__vacio {
  color: var(--color-text-muted);
}

.calendario__lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.calendario__bloque {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  border-left: 4px solid var(--color-info);
  box-shadow: var(--shadow-card);
  padding: 14px 18px;
}

/* Los servicios aceptados y los ratos ocupados llevan la misma franja; los distingue su etiqueta */
.calendario__servicio {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  border-left: 4px solid var(--color-info);
  box-shadow: var(--shadow-card);
  padding: 14px 18px;
}

/* Etiqueta que dice qué es cada tarjeta: servicio aceptado o rato ocupado */
.calendario__tipo {
  align-self: flex-start;
  padding: 2px 10px;
  border-radius: 999px;
  background-color: var(--color-info-bg);
  color: var(--color-info);
  font-size: 0.75rem;
  font-weight: bold;
}

.calendario__aviso-servicios {
  color: var(--color-error);
  font-size: 0.9rem;
}

.calendario__bloque-datos {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.calendario__bloque-fecha {
  font-weight: bold;
}

.calendario__bloque-motivo {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.calendario__quitar {
  background: none;
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  border-radius: var(--radius-input);
  padding: 8px 14px;
  cursor: pointer;
  font-family: inherit;
}

.calendario__quitar:hover {
  background-color: var(--color-error-bg);
}

@media (max-width: 768px) {
  .calendario {
    padding: 16px 16px 24px;
  }

  .calendario__form {
    padding: 24px 20px 28px;
  }

  .calendario__detalle {
    padding: 16px 14px 20px;
  }

  /* En el móvil no cabe el número grande: la fecha en letras ya dice el día.
     Queda la fecha en el centro, entre las dos flechas, con las etiquetas debajo */
  .calendario__cabecera-dia {
    gap: 8px;
  }

  .calendario__numero-dia {
    display: none;
  }

  .calendario__cabecera-texto {
    text-align: center;
  }

  .calendario__titulo-lista {
    font-size: 1.05rem;
  }

  .calendario__etiquetas {
    justify-content: center;
  }

  .calendario__etiqueta {
    font-size: 0.75rem;
  }

  .calendario__horas {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
