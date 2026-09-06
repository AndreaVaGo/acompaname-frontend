<script setup>
defineProps([
  "solicitud",
  "nombreMostrado",
  "mostrarAcciones",
  "aceptar",
  "rechazar",
]);
</script>

<template>
  <div class="solicitudes__card">
    <div class="solicitudes__card-top">
      <h3>{{ nombreMostrado }}</h3>
      <span
        class="solicitudes__estado"
        :class="'solicitudes__estado--' + solicitud.estado.toLowerCase()"
      >
        {{
          solicitud.estado === "PENDIENTE"
            ? "Pendiente"
            : solicitud.estado === "ACEPTADA"
              ? "Aceptada"
              : solicitud.estado === "RECHAZADA"
                ? "Rechazada"
                : "Completada"
        }}
      </span>
    </div>

    <p class="solicitudes__paciente">{{ solicitud.nombrePaciente }}</p>

    <ul class="solicitudes__detalles">
      <li>🏠 {{ solicitud.tipoCuidado }}</li>
      <li>📅 Inicio: {{ solicitud.fechaCuidado }}</li>
      <li>📝 {{ solicitud.notas }}</li>
    </ul>

    <div
      class="solicitudes__acciones"
      v-if="mostrarAcciones && solicitud.estado === 'PENDIENTE'"
    >
      <button class="btn btn--primary" @click="aceptar(solicitud.id)">
        Aceptar
      </button>
      <button class="btn btn--secondary" @click="rechazar(solicitud.id)">
        Rechazar
      </button>
    </div>
  </div>
</template>

<style scoped>
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
</style>
