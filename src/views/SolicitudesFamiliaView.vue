<script setup>
import { ref } from "vue";

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
      <div
        class="solicitudes__card"
        v-for="solicitud in solicitudes"
        :key="solicitud.id"
      >
        <div class="solicitudes__card-top">
          <h3>{{ solicitud.cuidador }}</h3>
          <span
            class="solicitudes__estado"
            :class="'solicitudes__estado--' + solicitud.estado"
          >
            {{
              solicitud.estado === "pendiente"
                ? "Pendiente"
                : solicitud.estado === "aceptada"
                  ? "Aceptada"
                  : "Rechazada"
            }}
          </span>
        </div>

        <p class="solicitudes__paciente">{{ solicitud.paciente }}</p>

        <ul class="solicitudes__detalles">
          <li>🏠 {{ solicitud.tipoCuidado }}</li>
          <li>📅 Inicio: {{ solicitud.fechaInicio }}</li>
          <li>📝 {{ solicitud.notas }}</li>
        </ul>
      </div>
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

.solicitudes__card {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.solicitudes__card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;

  & h3 {
    margin: 0;
  }
}

.solicitudes__estado {
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
  font-weight: bold;

  &--pendiente {
    background-color: var(--color-accent-bg);
    color: #c65a35;
  }

  &--aceptada {
    background-color: var(--color-secondary-bg);
    color: var(--color-secondary);
  }

  &--rechazada {
    background-color: var(--color-neutral-bg);
    color: #777;
  }
}

.solicitudes__paciente {
  color: var(--color-text-muted);
  margin-bottom: 12px;
}

.solicitudes__detalles {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  font-size: 0.9rem;
  color: #444;

  & li {
    margin-bottom: 6px;
  }
}

.solicitudes__acciones {
  display: flex;
  gap: var(--gap-sm);
  border-top: 1px solid #eee;
  padding-top: 16px;

  & .btn {
    flex: 1;
  }
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
