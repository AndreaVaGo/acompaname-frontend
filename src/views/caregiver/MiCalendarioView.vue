<script setup>
import { ref, computed, onMounted } from "vue";
import BloqueOcupadoRepository from "@/repositories/BloqueOcupadoRepository";
import SolicitudRepository from "@/repositories/SolicitudRepository";
import CalendarioMensual from "@/components/CalendarioMensual.vue";
import { mensajeDeError } from "@/utils/mensajeDeError";
import { formatearFecha } from "@/utils/formatearFecha";
import { formatearHora, formatearMomento } from "@/utils/formatearHora";
import { hoyEnFormatoISO, fechasEntre, minutosDeLaHora } from "@/utils/calendario";

const bloqueRepository = new BloqueOcupadoRepository();
const solicitudRepository = new SolicitudRepository();

// Lo mismo que acepta el servidor: el motivo puede tener hasta 100 caracteres
const MAXIMO_MOTIVO = 100;

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

const MINUTOS_DEL_DIA = 1440;

// Cuántos minutos ocupa un servicio en un día concreto.
// Un servicio sin horas (antiguo) se cuenta como día entero.
// En uno de varios días: el primer día va desde su hora de inicio hasta medianoche,
// los del medio son enteros y el último va desde medianoche hasta su hora de fin
function minutosDelServicioEnElDia(servicio, dia) {
  if (!servicio.horaInicio || !servicio.horaFin) {
    return MINUTOS_DEL_DIA;
  }
  const inicio = minutosDeLaHora(servicio.horaInicio);
  const fin = minutosDeLaHora(servicio.horaFin);
  const ultimoDia = servicio.fechaFin || servicio.fechaCuidado;
  if (ultimoDia === servicio.fechaCuidado) {
    return fin - inicio;
  }
  if (dia === servicio.fechaCuidado) {
    return MINUTOS_DEL_DIA - inicio;
  }
  if (dia === ultimoDia) {
    return fin;
  }
  return MINUTOS_DEL_DIA;
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
        <h2 class="calendario__titulo-lista">{{ formatearFecha(diaSeleccionado) }}</h2>

        <p v-if="cargando" class="calendario__vacio">Cargando tu calendario...</p>
        <p v-if="errorCarga" class="calendario__error" role="alert">{{ errorCarga }}</p>
        <p v-if="errorServicios" class="calendario__aviso-servicios" role="alert">{{ errorServicios }}</p>
        <p v-if="!cargando && !errorCarga && diaVacio" class="calendario__vacio">
          No tienes nada apuntado este día.
        </p>

        <ul class="calendario__lista">
          <li v-for="servicio in serviciosDelDia" :key="'s' + servicio.id" class="calendario__servicio">
            <span class="calendario__bloque-fecha">{{ cuandoEs(servicio) }}</span>
            <span class="calendario__bloque-motivo">
              Cuidado de {{ servicio.nombrePaciente }} · Familia {{ servicio.familiaNombre }}
            </span>
          </li>
          <li v-for="bloque in bloquesDelDia" :key="'b' + bloque.id" class="calendario__bloque">
            <div class="calendario__bloque-datos">
              <span class="calendario__bloque-fecha">Rato ocupado</span>
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

.calendario__titulo-lista {
  font-size: 1.25rem;
  margin: 28px 0 12px;
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

/* Los servicios aceptados llevan la franja en verde, para distinguirlos de los ratos ocupados */
.calendario__servicio {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  border-left: 4px solid var(--color-secondary);
  box-shadow: var(--shadow-card);
  padding: 14px 18px;
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

  .calendario__horas {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
