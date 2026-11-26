<script setup>
import { ref, onMounted } from "vue";
import BloqueOcupadoRepository from "@/repositories/BloqueOcupadoRepository";
import { mensajeDeError } from "@/utils/mensajeDeError";
import { formatearMomento, horaDeMomento } from "@/utils/formatearHora";

// Vincular el calendario de Mi calendario con uno externo (Google, Outlook, iCloud) para que se mantenga al día solo.
// Avisa al padre (evento "cambio") cada vez que los ratos ocupados pueden haber cambiado
const emit = defineEmits(["cambio"]);

const repository = new BloqueOcupadoRepository();

// null mientras carga; después { vinculado, ultimaSincronizacion, ultimoError }
const estado = ref(null);
const errorCarga = ref("");
const url = ref("");
const trabajando = ref(false);
const confirmando = ref(false);
const aviso = ref("");
const error = ref("");

// Si el servidor explica el problema ("Solo se pueden vincular calendarios de Google..."), se enseña
function textoDelError(err, porDefecto) {
  const detalle = err && err.detalle ? err.detalle.trim() : "";
  const esTexto = detalle !== "" && !detalle.startsWith("{") && !detalle.startsWith("[");
  if (err && err.status === 400 && esTexto) {
    return detalle;
  }
  return mensajeDeError(err, porDefecto);
}

// "26-11-2026 · 10:10" a partir de 2026-11-26T10:10:00.123
function cuando(momento) {
  if (!momento) {
    return "";
  }
  return formatearMomento(momento.slice(0, 10), horaDeMomento(momento));
}

async function cargarEstado() {
  errorCarga.value = "";
  try {
    estado.value = await repository.getSuscripcion();
  } catch (err) {
    errorCarga.value = mensajeDeError(err, "No se pudo comprobar tu calendario vinculado.");
  }
}

function empezar() {
  aviso.value = "";
  error.value = "";
  confirmando.value = false;
}

async function vincular() {
  empezar();
  if (url.value.trim() === "") {
    error.value = "Pega la dirección de tu calendario.";
    return;
  }
  trabajando.value = true;
  try {
    estado.value = await repository.vincularCalendario(url.value.trim());
    url.value = "";
    aviso.value = "Listo, tu calendario está vinculado y se actualizará solo cada hora.";
    emit("cambio");
  } catch (err) {
    error.value = textoDelError(err, "No se pudo vincular el calendario.");
  } finally {
    trabajando.value = false;
  }
}

async function sincronizar() {
  empezar();
  trabajando.value = true;
  try {
    estado.value = await repository.sincronizarCalendario();
    if (estado.value.ultimoError) {
      error.value = "No se pudo leer el calendario: " + estado.value.ultimoError;
    } else {
      aviso.value = "Calendario actualizado.";
    }
    emit("cambio");
  } catch (err) {
    error.value = textoDelError(err, "No se pudo sincronizar el calendario.");
  } finally {
    trabajando.value = false;
  }
}

async function desvincular() {
  empezar();
  trabajando.value = true;
  try {
    await repository.desvincularCalendario();
    estado.value = { vinculado: false, ultimaSincronizacion: null, ultimoError: null };
    aviso.value = "Calendario desvinculado. Los ratos que venían de él se han quitado.";
    emit("cambio");
  } catch (err) {
    error.value = textoDelError(err, "No se pudo desvincular el calendario.");
  } finally {
    trabajando.value = false;
  }
}

onMounted(cargarEstado);
</script>

<template>
  <section class="formulario sincronizar">
    <h2 class="titulo-seccion" data-icono="🔄">Sincronizar con otro calendario</h2>

    <p v-if="errorCarga" class="sincronizar__ayuda" data-testid="error-carga">{{ errorCarga }}</p>

    <template v-else-if="estado && estado.vinculado">
      <p class="sincronizar__estado" data-testid="estado-vinculado">✔ Calendario vinculado</p>
      <p v-if="estado.ultimaSincronizacion" class="sincronizar__ayuda" data-testid="ultima-sincronizacion">
        Última lectura correcta: {{ cuando(estado.ultimaSincronizacion) }}
      </p>
      <p v-else class="sincronizar__ayuda">Todavía no se ha leído correctamente.</p>
      <p v-if="estado.ultimoError" class="sincronizar__error" data-testid="ultimo-error">
        La última lectura falló: {{ estado.ultimoError }}. Se mantienen los ratos que ya tenías.
      </p>
      <p class="sincronizar__ayuda">Se actualiza solo cada hora. También puedes hacerlo ahora.</p>

      <div class="sincronizar__botones">
        <button
          type="button"
          id="sincronizar-ahora"
          class="btn btn--primary"
          :disabled="trabajando"
          @click="sincronizar"
        >
          Sincronizar ahora
        </button>
        <button
          v-if="!confirmando"
          type="button"
          id="desvincular"
          class="btn btn--secondary"
          :disabled="trabajando"
          @click="confirmando = true"
        >
          Desvincular
        </button>
      </div>

      <div v-if="confirmando" class="sincronizar__confirmar" role="alert">
        <p>Se quitarán los ratos ocupados que vinieron de ese calendario. Los que añadiste tú se quedan.</p>
        <div class="sincronizar__botones">
          <button type="button" id="confirmar-desvincular" class="btn btn--primary" :disabled="trabajando" @click="desvincular">
            Sí, desvincular
          </button>
          <button type="button" id="cancelar-desvincular" class="btn btn--secondary" @click="confirmando = false">
            Cancelar
          </button>
        </div>
      </div>
    </template>

    <template v-else-if="estado">
      <p class="sincronizar__ayuda">
        Vincula tu calendario de Google, Outlook o iCloud una sola vez y tus ratos ocupados se mantendrán al día
        solos, sin tener que subir archivos.
      </p>
      <ul class="sincronizar__lista">
        <li>Pega la dirección secreta en formato iCal (.ics) de tu calendario. La encuentras en sus ajustes.</li>
        <li>Solo se leen las fechas y las horas. El título y los detalles de tus citas no se leen ni se guardan.</li>
        <li>Quien tenga esa dirección puede ver tu calendario: no la compartas con nadie.</li>
        <li>Los eventos que se repiten todavía no se leen: añádelos a mano.</li>
      </ul>

      <label for="calendario-url">Dirección del calendario (.ics)</label>
      <input
        id="calendario-url"
        v-model="url"
        type="url"
        autocomplete="off"
        placeholder="https://calendar.google.com/..."
        :disabled="trabajando"
      />
      <button type="button" id="vincular" class="btn btn--primary" :disabled="trabajando" @click="vincular">
        Vincular calendario
      </button>
    </template>

    <p v-else-if="!errorCarga" class="sincronizar__ayuda">Cargando...</p>

    <p v-if="trabajando" class="sincronizar__ayuda" role="status">Leyendo tu calendario...</p>
    <p v-if="aviso" class="sincronizar__ok" role="status">{{ aviso }}</p>
    <p v-if="error" class="sincronizar__error" role="alert">{{ error }}</p>
  </section>
</template>

<style scoped>
.sincronizar {
  padding: 28px 32px 32px;

  & .titulo-seccion:first-child {
    margin-top: 0;
  }
}

.sincronizar__ayuda {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin: 0 0 12px;
}

.sincronizar__lista {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin: 0 0 16px;
  padding-left: 20px;
}

.sincronizar__estado {
  font-weight: bold;
  color: var(--color-secondary);
  margin: 0 0 6px;
}

.sincronizar__botones {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sincronizar__confirmar {
  margin-top: 16px;
  padding: 12px 16px;
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  border-radius: var(--radius-input);
}

.sincronizar__ok {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
  font-size: 0.9rem;
  font-weight: bold;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: 16px 0;
}

.sincronizar__error {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: 16px 0;
}

@media (max-width: 768px) {
  .sincronizar {
    padding: 24px 20px 28px;
  }
}
</style>
