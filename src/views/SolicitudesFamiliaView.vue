<script setup>
import { ref } from "vue";
import SolicitudCard from "../components/SolicitudCard.vue";

const solicitudes = ref([
  {
    id: 1,
    cuidador: "Lucía Ferrer",
    paciente: "Antonio Serrano",
    tipoCuidado: "Hospitalario",
    fechaInicio: "12 de agosto de 2026",
    notas: "Ingreso previsto de 4 noches en el Hospital La Paz.",
    estado: "pendiente",
  },
  {
    id: 2,
    cuidador: "Marta Gómez",
    paciente: "Antonio Serrano",
    tipoCuidado: "A domicilio",
    fechaInicio: "20 de agosto de 2026",
    notas: "Apoyo por las tardes, tres días por semana.",
    estado: "aceptada",
  },
]);
</script>

<template>
  <div class="solicitudes">
    <header class="solicitudes__header">
      <h1>Mis solicitudes</h1>
      <p>Solicitudes que has enviado a los cuidadores.</p>
    </header>

    <div class="solicitudes__grid">
      <SolicitudCard
        v-for="solicitud in solicitudes"
        :key="solicitud.id"
        :solicitud="solicitud"
        :nombreMostrado="solicitud.cuidador"
        :mostrarAcciones="false"
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

.solicitudes__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--gap-md);
}



@media (max-width: 768px) {
  .solicitudes-page {
    padding: 24px 20px;
  }

  .solicitudes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
