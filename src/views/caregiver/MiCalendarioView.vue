<script setup>
import { ref, computed, onMounted } from "vue";
import BloqueOcupadoRepository from "@/repositories/BloqueOcupadoRepository";
import { mensajeDeError } from "@/utils/mensajeDeError";
import { formatearFecha } from "@/utils/formatearFecha";
import { formatearHora } from "@/utils/formatearHora";

const bloqueRepository = new BloqueOcupadoRepository();

// Lo mismo que acepta el servidor: el motivo puede tener hasta 100 caracteres
const MAXIMO_MOTIVO = 100;

// La fecha de hoy con el formato de los campos de fecha (2026-11-18), con la hora de aquí, no la UTC
function hoyEnFormatoISO() {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

const hoy = hoyEnFormatoISO();

const bloques = ref([]);
const cargando = ref(true);
const errorCarga = ref("");

const fecha = ref("");
const horaInicio = ref("");
const horaFin = ref("");
const motivo = ref("");
const guardando = ref(false);
const error = ref("");
const aviso = ref("");

// Solo se enseñan los bloques de hoy en adelante: los de días pasados ya no sirven
const proximos = computed(() => {
  const lista = [];
  for (const bloque of bloques.value) {
    if (bloque.fecha >= hoy) {
      lista.push(bloque);
    }
  }
  return lista;
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

onMounted(cargarBloques);
</script>

<template>
  <div class="calendario">
    <div class="calendario__wrapper">
      <h1>Mi calendario</h1>
      <p class="calendario__subtitle">
        Apunta los ratos en los que no puedes trabajar (tu turno en el hospital, una cita...). Las familias
        no verán que estás disponible en esas horas y no podrás aceptar servicios que coincidan.
      </p>

      <div class="calendario__box">
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

      <h2 class="calendario__titulo-lista">Próximos ratos ocupados</h2>

      <p v-if="cargando" class="calendario__vacio">Cargando tu calendario...</p>
      <p v-else-if="errorCarga" class="calendario__error" role="alert">{{ errorCarga }}</p>
      <p v-else-if="proximos.length === 0" class="calendario__vacio">
        No tienes ningún rato ocupado apuntado.
      </p>
      <ul v-else class="calendario__lista">
        <li v-for="bloque in proximos" :key="bloque.id" class="calendario__bloque">
          <div class="calendario__bloque-datos">
            <span class="calendario__bloque-fecha">{{ formatearFecha(bloque.fecha) }}</span>
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
  max-width: 560px;
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
  margin: 32px 0 12px;
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
  border-left: 4px solid var(--color-accent);
  box-shadow: var(--shadow-card);
  padding: 14px 18px;
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
