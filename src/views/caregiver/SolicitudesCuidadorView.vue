<script setup>
import { ref, onMounted } from "vue";
import SolicitudCard from "../../components/SolicitudCard.vue";
import SolicitudRepository from "@/repositories/SolicitudRepository";
import MensajeRepository from "@/repositories/MensajeRepository";
import { mensajeDeError } from "@/utils/mensajeDeError";
import { usarSolicitudesPaginadas } from "@/utils/solicitudesPaginadas";
import { moverFoco } from "@/utils/focoTarjeta";

const solicitudRepository = new SolicitudRepository();
const mensajeRepository = new MensajeRepository();
const cargando = ref(true);
// Mensajes sin leer por solicitud: { idSolicitud: cantidad }
const sinLeerPorSolicitud = ref({});
const error = ref("");
const { solicitudes, totalElementos, hayMas, cargandoMas, cargarSiguiente } =
  usarSolicitudesPaginadas(solicitudRepository, (mensaje) => {
    error.value = mensaje;
  });

// Se pide aparte y sin esperar: si falla o tarda, la lista se ve igual y solo no sale el contador
async function cargarMensajesSinLeer() {
  try {
    const respuesta = await mensajeRepository.getNoLeidos();
    sinLeerPorSolicitud.value = respuesta.porSolicitud || {};
  } catch (err) {
    sinLeerPorSolicitud.value = {};
  }
}

onMounted(async () => {
  cargarMensajesSinLeer();

  await cargarSiguiente();
  cargando.value = false;
});

async function aceptar(id) {
  try {
    const actualizada = await solicitudRepository.cambiarEstado(id, "ACEPTADA");
    const solicitud = solicitudes.value.find((s) => s.id === id);
    solicitud.estado = actualizada.estado;
  } catch (err) {
    error.value = mensajeDeError(err, "No se pudo aceptar la solicitud.");
  }
}

async function rechazar(id) {
  try {
    const actualizada = await solicitudRepository.cambiarEstado(
      id,
      "RECHAZADA",
    );
    const solicitud = solicitudes.value.find((s) => s.id === id);
    solicitud.estado = actualizada.estado;
  } catch (err) {
    error.value = mensajeDeError(err, "No se pudo rechazar la solicitud.");
  }
}

async function completar(id) {
  try {
    const actualizada = await solicitudRepository.cambiarEstado(
      id,
      "COMPLETADA",
    );
    const solicitud = solicitudes.value.find((s) => s.id === id);
    solicitud.estado = actualizada.estado;
  } catch (err) {
    error.value = mensajeDeError(err, "No se pudo marcar la solicitud como completada.");
  }
}
</script>

<template>
  <div class="solicitudes pantalla">
    <header class="solicitudes__header">
      <h1>Solicitudes recibidas</h1>
      <p>Solicitudes que las familias te han enviado.</p>
    </header>

    <p role="alert" v-if="error" class="solicitudes__error">{{ error }}</p>

    <div class="solicitudes__grid">
      <SolicitudCard
        v-for="(solicitud, indice) in solicitudes"
        :key="solicitud.id"
        :style="{ '--i': Math.min(indice, 8) }"
        @mousemove="moverFoco"
        :solicitud="solicitud"
        :nombreMostrado="solicitud.familiaNombre"
        :mostrarAcciones="true"
        :aceptar="aceptar"
        :rechazar="rechazar"
        :completar="completar"
        :mensajesSinLeer="sinLeerPorSolicitud[solicitud.id]"
      />
    </div>

    <div v-if="!cargando && hayMas" class="solicitudes__mas">
      <p class="solicitudes__contador">
        Mostrando {{ solicitudes.length }} de {{ totalElementos }}
      </p>
      <button
        class="btn btn--secondary"
        data-testid="cargar-mas"
        :disabled="cargandoMas"
        @click="cargarSiguiente"
      >
        {{ cargandoMas ? "Cargando…" : "Cargar más" }}
      </button>
    </div>
  </div>
</template>
<style scoped>
.solicitudes {
  min-height: 100vh;
  font-family: var(--font-base);
  color: var(--color-text);
  padding: var(--gap-lg) 60px;
  max-width: 1200px;
  margin: 0 auto;
}

.solicitudes__header {
  & h1 {
    font-size: 1.8rem;
    margin-bottom: 6px;
  }

  & p {
    color: var(--color-text-muted);
    margin-bottom: 24px;
  }
}

.solicitudes__error {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin-bottom: 16px;
}

.solicitudes__mas {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
}

.solicitudes__contador {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.solicitudes__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--gap-md);
}

@media (max-width: 768px) {
  .solicitudes {
    padding: 24px 20px;
  }

  .solicitudes__grid {
    grid-template-columns: 1fr;
  }
}
</style>