<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute, RouterLink } from "vue-router";
import MensajeRepository from "@/repositories/MensajeRepository";
import { useAuthStore } from "@/stores/auth";
import { unirMensajes, ultimoId, fechaDeMensaje } from "@/utils/chat";
import { mensajeDeError } from "@/utils/mensajeDeError";

const route = useRoute();
const authStore = useAuthStore();
const repository = new MensajeRepository();

const solicitudId = route.params.id;
const mensajes = ref([]);
const texto = ref("");
const cargando = ref(true);
const enviando = ref(false);
const error = ref("");
const lista = ref(null);

// Cada cuántos milisegundos se pregunta si hay mensajes nuevos (sin WebSockets, con consultas cortas)
const INTERVALO_MS = 4000;
const MAX_CARACTERES = 1000;
let temporizador = null;

// La familia vuelve a sus solicitudes y la persona cuidadora a las recibidas
const volverA = computed(() =>
  authStore.rol === "CUIDADOR" ? "/solicitudes-cuidador" : "/solicitudes",
);

// Deja el scroll abajo del todo para ver el último mensaje
async function irAlFinal() {
  await nextTick();
  if (lista.value) {
    lista.value.scrollTop = lista.value.scrollHeight;
  }
}

// Si la persona está leyendo mensajes antiguos no se le baja el scroll de golpe
function estaAbajo() {
  if (!lista.value) {
    return true;
  }
  const el = lista.value;
  return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
}

async function cargar() {
  try {
    mensajes.value = await repository.getMensajes(solicitudId);
    await irAlFinal();
  } catch (err) {
    error.value = mensajeDeError(err, "No se pudo cargar el chat.");
  } finally {
    cargando.value = false;
  }
}

// Pregunta solo por los mensajes más nuevos que el último que ya se tiene
async function buscarNuevos() {
  // Con la pestaña en segundo plano no hace falta preguntar
  if (document.hidden || cargando.value || error.value) {
    return;
  }
  try {
    const nuevos = await repository.getMensajes(solicitudId, ultimoId(mensajes.value));
    if (nuevos.length > 0) {
      const bajar = estaAbajo();
      mensajes.value = unirMensajes(mensajes.value, nuevos);
      if (bajar) {
        await irAlFinal();
      }
    }
  } catch (err) {
    // Un fallo de red puntual no corta la conversación: se reintenta en la siguiente vuelta
  }
}

async function enviar() {
  const mensaje = texto.value.trim();
  if (!mensaje || enviando.value) {
    return;
  }
  enviando.value = true;
  try {
    const creado = await repository.enviar(solicitudId, mensaje);
    mensajes.value = unirMensajes(mensajes.value, [creado]);
    texto.value = "";
    error.value = "";
    await irAlFinal();
  } catch (err) {
    error.value = mensajeDeError(err, "No se pudo enviar el mensaje.");
  } finally {
    enviando.value = false;
  }
}

onMounted(async () => {
  await cargar();
  temporizador = setInterval(buscarNuevos, INTERVALO_MS);
});

onBeforeUnmount(() => {
  clearInterval(temporizador);
});
</script>

<template>
  <div class="chat">
    <RouterLink :to="volverA" class="chat__volver">← Volver a mis solicitudes</RouterLink>

    <header class="chat__header">
      <h1>Chat de la solicitud nº {{ solicitudId }}</h1>
      <p>Aquí podéis hablar de los detalles del servicio.</p>
    </header>

    <p role="alert" v-if="error" class="chat__error">{{ error }}</p>

    <p v-if="cargando" class="chat__cargando">Cargando mensajes…</p>

    <div v-else class="chat__caja">
      <ul ref="lista" class="chat__mensajes" aria-live="polite" aria-label="Mensajes">
        <li v-if="mensajes.length === 0" class="chat__vacio">
          Todavía no hay mensajes. ¡Escribe el primero!
        </li>
        <li
          v-for="mensaje in mensajes"
          :key="mensaje.id"
          class="chat__mensaje"
          :class="{ 'chat__mensaje--mio': mensaje.mio }"
        >
          <span v-if="!mensaje.mio" class="chat__autor">{{ mensaje.emisorNombre }}</span>
          <p class="chat__texto">{{ mensaje.texto }}</p>
          <time class="chat__hora">{{ fechaDeMensaje(mensaje.fecha) }}</time>
        </li>
      </ul>

      <form class="chat__form" @submit.prevent="enviar">
        <label for="chat-texto" class="chat__label">Escribe un mensaje</label>
        <textarea
          id="chat-texto"
          v-model="texto"
          class="chat__input"
          rows="2"
          :maxlength="MAX_CARACTERES"
          placeholder="Escribe aquí… (Enter envía, Mayús + Enter salta de línea)"
          @keydown.enter.exact.prevent="enviar"
        ></textarea>
        <button
          type="submit"
          class="btn btn--primary chat__enviar"
          :disabled="enviando || texto.trim() === ''"
        >
          Enviar
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.chat {
  min-height: 100vh;
  font-family: var(--font-base);
  color: var(--color-text);
  padding: 40px 60px;
  max-width: 800px;
  margin: 0 auto;
}

.chat__volver {
  display: inline-block;
  margin-bottom: 16px;
  color: var(--color-text);
  font-weight: bold;
  text-decoration: none;
}

.chat__volver:hover {
  text-decoration: underline;
}

.chat__header {
  & h1 {
    font-size: 1.6rem;
    margin-bottom: 6px;
  }

  & p {
    color: var(--color-text-muted);
    margin-bottom: 20px;
  }
}

.chat__error {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin-bottom: 12px;
}

.chat__cargando {
  color: var(--color-text-muted);
}

.chat__caja {
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.chat__mensajes {
  list-style: none;
  margin: 0;
  padding: 20px;
  height: 50vh;
  min-height: 260px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: linear-gradient(180deg, var(--color-secondary-bg), transparent 160px);
}

.chat__vacio {
  margin: auto;
  color: var(--color-text-muted);
  text-align: center;
}

/* Los mensajes de la otra persona a la izquierda y los míos a la derecha */
.chat__mensaje {
  align-self: flex-start;
  max-width: 78%;
  padding: 10px 14px;
  background-color: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 16px 16px 16px 4px;
  animation: entra-sube 0.3s var(--ease-out) backwards;
}

.chat__mensaje--mio {
  align-self: flex-end;
  background-color: var(--color-accent-bg);
  border-color: var(--color-accent);
  border-radius: 16px 16px 4px 16px;
}

.chat__autor {
  display: block;
  margin-bottom: 2px;
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--color-secondary);
}

.chat__texto {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.chat__hora {
  display: block;
  margin-top: 4px;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.chat__form {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px 12px;
  align-items: end;
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
}

/* La etiqueta se oculta a la vista, pero la leen los lectores de pantalla */
.chat__label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.chat__input {
  padding: 10px 12px;
  border-radius: var(--radius-input);
  border: 1px solid var(--color-border);
  font-family: inherit;
  font-size: 1rem;
  resize: none;
  transition:
    border-color var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-fast) var(--ease-out);
}

.chat__input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-bg);
}

@media (prefers-reduced-motion: reduce) {
  .chat__mensaje {
    animation: none;
  }
}

@media (max-width: 768px) {
  .chat {
    padding: 24px 16px;
  }

  .chat__mensaje {
    max-width: 90%;
  }
}
</style>
