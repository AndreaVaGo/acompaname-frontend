<script setup>
import { ref, onMounted } from "vue";
import SolicitudCard from "../../components/SolicitudCard.vue";
import SolicitudRepository from "@/repositories/SolicitudRepository";
import PagoRepository from "@/repositories/PagoRepository";

const solicitudRepository = new SolicitudRepository();
const pagoRepository = new PagoRepository();
const solicitudes = ref([]);
const idsPagados = ref([]);
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

  // Si falla la carga de pagos, la lista se ve igual y solo no marca ninguno como pagado
  try {
    const pagos = await pagoRepository.getMisPagos();
    idsPagados.value = pagos
      .filter((pago) => pago.estado === "COMPLETADO")
      .map((pago) => pago.solicitudId);
  } catch (err) {
    idsPagados.value = [];
  }
});
</script>

<template>
  <div class="solicitudes">
    <header class="solicitudes__header">
      <h1>Mis solicitudes</h1>
      <p>Solicitudes que has enviado a los cuidadores.</p>
    </header>

    <p v-if="error" class="solicitudes__error">{{ error }}</p>

    <div class="solicitudes__grid">
      <SolicitudCard
        v-for="solicitud in solicitudes"
        :key="solicitud.id"
        :solicitud="solicitud"
        :nombreMostrado="solicitud.cuidadorNombre"
        :mostrarAcciones="false"
        :pagado="idsPagados.includes(solicitud.id)"
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