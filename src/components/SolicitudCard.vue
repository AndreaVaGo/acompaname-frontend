<script setup>
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import { nombreNecesidad } from "@/utils/necesidades";
import { formatearFecha } from "@/utils/formatearFecha";

const props = defineProps([
  "solicitud",
  "nombreMostrado",
  "mostrarAcciones",
  "pagado",
  "aceptar",
  "rechazar",
  "completar",
]);

// El cuidador ve la tarjeta resumida y amplía los detalles con el botón Ver
const expandido = ref(false);

// La familia lo ve todo; el cuidador solo cuando pulsa Ver
const detallesVisibles = computed(
  () => !props.mostrarAcciones || expandido.value,
);

// El cuidador solo ve la dirección cuando ya ha aceptado la solicitud
const direccionVisible = computed(
  () =>
    !props.mostrarAcciones ||
    props.solicitud.estado === "ACEPTADA" ||
    props.solicitud.estado === "COMPLETADA",
);
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
      <li>📅 Inicio: {{ formatearFecha(solicitud.fechaCuidado) }}</li>
    </ul>

    <div class="solicitudes__extra" v-if="detallesVisibles">
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
        <li v-if="solicitud.fechaFin">
          📅 Fin: {{ formatearFecha(solicitud.fechaFin) }}
        </li>
        <li v-if="solicitud.direccion && direccionVisible">
          📍 {{ solicitud.direccion }}
        </li>
        <li v-else-if="solicitud.direccion" class="solicitudes__aviso">
          📍 La dirección se mostrará cuando aceptes la solicitud
        </li>
        <li v-if="solicitud.notas">📝 {{ solicitud.notas }}</li>
      </ul>
    </div>

    <div class="solicitudes__acciones" v-if="mostrarAcciones">
      <template v-if="solicitud.estado === 'PENDIENTE'">
        <button class="btn btn--primary" @click="aceptar(solicitud.id)">
          Aceptar
        </button>
        <button class="btn btn--secondary" @click="rechazar(solicitud.id)">
          Rechazar
        </button>
      </template>
      <button
        v-if="solicitud.estado === 'ACEPTADA' && completar"
        class="btn btn--primary solicitudes__completar"
        @click="completar(solicitud.id)"
      >
        Marcar como completada
      </button>
      <button
        class="btn btn--secondary solicitudes__ver"
        @click="expandido = !expandido"
      >
        {{ expandido ? "Ocultar" : "Ver" }}
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

.solicitudes__aviso {
  color: var(--color-text-muted);
  font-style: italic;
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