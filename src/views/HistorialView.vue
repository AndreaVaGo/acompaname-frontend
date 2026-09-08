<script setup>
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import SolicitudRepository from "@/repositories/SolicitudRepository";
import ValoracionRepository from "@/repositories/ValoracionRepository";

const solicitudRepository = new SolicitudRepository();
const valoracionRepository = new ValoracionRepository();
const historial = ref([]);

onMounted(async () => {
  const todas = await solicitudRepository.getMisSolicitudes();
  const valoraciones = await valoracionRepository.getAll();
  const idsValorados = valoraciones.map((v) => v.solicitudId);

  historial.value = todas
    .filter((s) => s.estado === "COMPLETADA" || s.estado === "RECHAZADA")
    .map((s) => ({
      id: s.id,
      nombre: s.cuidadorNombre,
      paciente: s.nombrePaciente,
      edad: s.edadPaciente,
      tipoCuidado: s.tipoCuidado,
      fechaInicio: s.fechaCuidado,
      notas: s.notas,
      estado: s.estado.toLowerCase(),
      valorada: idsValorados.includes(s.id),
    }));
});

function textoEstado(estado) {
  if (estado === "completada") return "Completada";
  if (estado === "rechazada") return "Rechazada";
  return "Pendiente";
}
</script>

<template>
  <div class="historial">
    <header class="historial__header">
      <h1>Historial de solicitudes</h1>
      <p>El estado final de cada acompañamiento que has gestionado.</p>
    </header>

    <div class="historial__grid" v-if="historial.length">
      <div class="historial__card" v-for="item in historial" :key="item.id">
        <div class="historial__card-top">
          <h3>{{ item.nombre }}</h3>
          <span
            class="historial__estado"
            :class="'historial__estado--' + item.estado"
          >
            {{ textoEstado(item.estado) }}
          </span>
        </div>

        <p class="historial__paciente">
          {{ item.paciente }} · {{ item.edad }} años
        </p>

        <ul class="historial__detalles">
          <li>🏠 {{ item.tipoCuidado }}</li>
          <li>📅 Inicio: {{ item.fechaInicio }}</li>
          <li>📝 {{ item.notas }}</li>
        </ul>

        <div class="historial__footer" v-if="item.estado === 'completada'">
          <span v-if="item.valorada" class="historial__valorado"
            >Valoración enviada ✓</span
          >
          <RouterLink
            v-else
            :to="`/valorar/${item.id}`"
            class="btn btn--primary"
            >Dejar valoración
          </RouterLink>
        </div>
      </div>
    </div>

    <p class="historial__empty" v-else>
      Aún no tienes solicitudes en tu historial.
    </p>
  </div>
</template>

<style scoped>
.historial {
  min-height: 100vh;
  background-color: var(--color-bg);
  font-family: var(--font-base);
  color: var(--color-text);
  padding: var(--gap-lg) 60px;
  max-width: 1200px;
  margin: 0 auto;
}

.historial__header {
  & h1 {
    font-size: 1.8rem;
    margin-bottom: 6px;
  }

  & p {
    color: var(--color-text-muted);
    margin-bottom: 24px;
  }
}

.historial__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--gap-md);
}

.historial__card {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.historial__card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;

  & h3 {
    margin: 0;
  }
}

.historial__estado {
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
  font-weight: bold;

  &--completada {
    background-color: var(--color-accent-bg);
    color: #c65a35;
  }

  &--rechazada {
    background-color: var(--color-neutral-bg);
    color: #777;
  }
}

.historial__paciente {
  color: var(--color-text-muted);
  margin-bottom: 12px;
}

.historial__detalles {
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
  font-size: 0.9rem;
  color: #444;

  & li {
    margin-bottom: 6px;
  }
}

.historial__footer {
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.historial__valorado {
  color: var(--color-secondary);
  font-weight: bold;
  font-size: 0.9rem;
}

.historial__empty {
  text-align: center;
  color: var(--color-text-muted);
  margin-top: 40px;
}

@media (max-width: 768px) {
  .historial {
    padding: 24px 20px;
  }

  .historial__grid {
    grid-template-columns: 1fr;
  }
}
</style>
