<script setup>
import { computed } from "vue";
import { formatearEuros } from "@/utils/formatearEuros";

// Las cinco tarjetas de resumen de arriba del panel
const props = defineProps({
  estadisticas: { type: Object, required: true },
});

// El total de solicitudes es la suma de las cuatro clases de estado
const totalSolicitudes = computed(() => {
  return (
    props.estadisticas.solicitudesPendientes +
    props.estadisticas.solicitudesAceptadas +
    props.estadisticas.solicitudesCompletadas +
    props.estadisticas.solicitudesRechazadas
  );
});

// La media llega con punto (4.6) y se muestra con coma (4,6); sin valoraciones, un guion
const valoracion = computed(() => {
  if (props.estadisticas.valoracionMedia === null) {
    return "—";
  }
  return String(props.estadisticas.valoracionMedia).replace(".", ",");
});
</script>

<template>
  <section class="admin-tarjetas">
    <div class="admin-tarjetas__tarjeta admin-tarjetas__tarjeta--verde">
      <div class="admin-tarjetas__nombre">Familias</div>
      <div class="admin-tarjetas__numero">{{ estadisticas.totalFamilias }}</div>
    </div>

    <div class="admin-tarjetas__tarjeta admin-tarjetas__tarjeta--coral">
      <div class="admin-tarjetas__nombre">Cuidadores</div>
      <div class="admin-tarjetas__numero">{{ estadisticas.totalCuidadores }}</div>
      <div class="admin-tarjetas__detalle">
        {{ estadisticas.cuidadoresDisponibles }} disponibles ahora
      </div>
    </div>

    <div class="admin-tarjetas__tarjeta admin-tarjetas__tarjeta--azul">
      <div class="admin-tarjetas__nombre">Solicitudes</div>
      <div class="admin-tarjetas__numero">{{ totalSolicitudes }}</div>
    </div>

    <div class="admin-tarjetas__tarjeta admin-tarjetas__tarjeta--verde">
      <div class="admin-tarjetas__nombre">Ingresos cobrados</div>
      <div class="admin-tarjetas__numero">
        {{ formatearEuros(estadisticas.ingresosCobrados) }}
      </div>
    </div>

    <div class="admin-tarjetas__tarjeta admin-tarjetas__tarjeta--coral">
      <div class="admin-tarjetas__nombre">Valoración media</div>
      <div class="admin-tarjetas__numero">
        {{ valoracion }}
        <span v-if="estadisticas.valoracionMedia !== null" class="admin-tarjetas__sobre">
          / 5
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.admin-tarjetas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap-md);
}

.admin-tarjetas__tarjeta {
  flex: 1 1 200px;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  border-left: 6px solid var(--color-secondary);
  padding: 20px 22px;
  box-shadow: var(--shadow-card);
}

.admin-tarjetas__tarjeta--coral {
  border-left-color: var(--color-accent);
}

.admin-tarjetas__tarjeta--azul {
  border-left-color: var(--color-info);
}

.admin-tarjetas__nombre {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.admin-tarjetas__numero {
  font-size: 2.2rem;
  font-weight: bold;
  margin-top: 4px;
}

.admin-tarjetas__sobre {
  font-size: 1rem;
  font-weight: normal;
  color: var(--color-text-muted);
}

.admin-tarjetas__detalle {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}
</style>