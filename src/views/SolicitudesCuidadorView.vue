<script setup>
import { ref, onMounted } from "vue";
import SolicitudCard from "../components/SolicitudCard.vue";
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
