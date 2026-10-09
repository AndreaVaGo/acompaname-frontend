<script setup>
import { ref, onMounted } from "vue";
import SolicitudCard from "../../components/SolicitudCard.vue";
import SolicitudRepository from "@/repositories/SolicitudRepository";

const solicitudRepository = new SolicitudRepository();
const solicitudes = ref([]);
const cargando = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    solicitudes.value = await solicitudRepository.getMisSolicitudes();
  } catch (err) {
    error.value = "No se pudieron cargar tus solicitudes.";
  } finally {
    cargando.value = false;
  }
});

async function aceptar(id) {
  try {
    const actualizada = await solicitudRepository.cambiarEstado(id, "ACEPTADA");
    const solicitud = solicitudes.value.find((s) => s.id === id);
    solicitud.estado = actualizada.estado;
  } catch (err) {
    error.value = "No se pudo aceptar la solicitud.";
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
    error.value = "No se pudo rechazar la solicitud.";
  }
}
</script>

<template>
  <div class="solicitudes">
    <header class="solicitudes__header">
      <h1>Solicitudes recibidas</h1>
      <p>Solicitudes que las familias te han enviado.</p>
    </header>

    <p v-if="error" class="solicitudes__error">{{ error }}</p>

    <div class="solicitudes__grid">
      <SolicitudCard
        v-for="solicitud in solicitudes"
        :key="solicitud.id"
        :solicitud="solicitud"
        :nombreMostrado="solicitud.familiaNombre"
        :mostrarAcciones="true"
        :aceptar="aceptar"
        :rechazar="rechazar"
      />
    </div>
  </div>
</template>
<style scoped>
.solicitudes {
  min-height: 100vh;
  background-color: var(--color-bg);
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
  background-color: #fdecea;
  border: 1px solid #f5c6c0;
  color: #c0392b;
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin-bottom: 16px;
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