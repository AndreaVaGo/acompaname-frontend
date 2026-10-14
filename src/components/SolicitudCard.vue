<script setup>
import { RouterLink } from "vue-router";
import { nombreNecesidad } from "@/utils/necesidades";

defineProps([
  "solicitud",
  "nombreMostrado",
  "mostrarAcciones",
  "pagado",
  "aceptar",
  "rechazar",
  "completar",
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

    <div
      class="solicitudes__necesidades"
      v-if="solicitud.necesidades && solicitud.necesidades.length > 0"
    >
      <span
        class="solicitudes__necesidad"
        v-for="codigo in solicitud.necesidades"
        :key="codigo"
      >
        {{ nombreNecesidad(codigo) }}
      </span>
    </div>

    <ul class="solicitudes__detalles">
      <li>🏠 {{ solicitud.tipoCuidado }}</li>
      <li>📅 Inicio: {{ solicitud.fechaCuidado }}</li>
<<<<<<< HEAD
      <li v-if="solicitud.fechaFin">📅 Fin: {{ solicitud.fechaFin }}</li>
      <li>📝 {{ solicitud.notas }}</li>
=======
      <li v-if="solicitud.notas">📝 {{ solicitud.notas }}</li>
>>>>>>> feature/request-card-tweaks
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

    <div
      class="solicitudes__acciones"
      v-if="mostrarAcciones && solicitud.estado === 'ACEPTADA' && completar"
    >
      <button
        class="btn btn--primary solicitudes__completar"
        @click="completar(solicitud.id)"
      >
        Marcar como completada
      </button>
    </div>

    <div
      class="solicitudes__acciones"
      v-if="!mostrarAcciones && solicitud.estado === 'ACEPTADA' && !pagado"
    >
      <RouterLink :to="`/pagar/${solicitud.id}`" class="btn btn--primary">
        Pagar
      </RouterLink>
    </div>

    <div
      class="solicitudes__acciones"
      v-if="!mostrarAcciones && solicitud.estado === 'ACEPTADA' && pagado"
    >
      <p class="solicitudes__pagado">Pagado ✓</p>
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
  flex-wrap: wrap;
  gap: 12px;
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
}

.solicitudes__estado--pendiente {
  background-color: var(--color-accent-bg);
  color: #c65a35;
}

.solicitudes__estado--aceptada {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
}

.solicitudes__estado--rechazada {
  background-color: var(--color-neutral-bg);
  color: #777;
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
    text-align: center;
    text-decoration: none;
  }
}

.solicitudes__pagado {
  flex: 1;
  margin: 0;
  padding: 12px 24px;
  border-radius: var(--radius-pill);
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
  font-weight: bold;
  text-align: center;
}

.solicitudes__necesidades {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.solicitudes__necesidad {
  background-color: var(--color-accent-bg);
  color: #c65a35;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
}
</style>