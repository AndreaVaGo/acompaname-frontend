<script setup>
import { computed } from "vue";
import { formatearEuros } from "@/utils/formatearEuros";

// Barras horizontales con un importe en euros por fila (por tipo de cuidado, por cuidador...).
// La barra más larga es la fila de mayor importe; el detalle es un texto pequeño opcional.
const props = defineProps({
  titulo: { type: String, required: true },
  // Cada fila: { texto: "Domicilio", importe: 90, detalle: "3 pagos" }
  filas: { type: Array, required: true },
  color: { type: String, default: "var(--color-secondary)" },
  vacio: { type: String, default: "Todavía no hay datos." },
});

const maximo = computed(() => {
  let mayor = 0;
  for (const fila of props.filas) {
    if (fila.importe > mayor) {
      mayor = fila.importe;
    }
  }
  return mayor;
});

function ancho(fila) {
  if (maximo.value === 0) {
    return 0;
  }
  return Math.round((fila.importe * 100) / maximo.value);
}
</script>

<template>
  <div class="admin-pagos-barras">
    <h2 class="titulo-seccion">{{ titulo }}</h2>

    <p v-if="filas.length === 0" class="admin-pagos-barras__vacio">{{ vacio }}</p>

    <div v-else class="admin-pagos-barras__lista">
      <div v-for="fila in filas" :key="fila.texto" class="admin-pagos-barras__fila">
        <span class="admin-pagos-barras__texto">{{ fila.texto }}</span>
        <div class="admin-pagos-barras__fondo">
          <div
            class="admin-pagos-barras__relleno"
            :style="{ width: ancho(fila) + '%', backgroundColor: color }"
          ></div>
        </div>
        <span class="admin-pagos-barras__valor">
          <strong>{{ formatearEuros(fila.importe) }}</strong>
          <small v-if="fila.detalle">{{ fila.detalle }}</small>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-pagos-barras {
  flex: 1 1 320px;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.admin-pagos-barras .titulo-seccion {
  margin-top: 0;
}

.admin-pagos-barras__vacio {
  margin: 0;
  color: var(--color-text-muted);
}

.admin-pagos-barras__lista {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.admin-pagos-barras__fila {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-pagos-barras__texto {
  flex: 0 0 100px;
  font-size: 0.9rem;
  overflow-wrap: anywhere;
}

.admin-pagos-barras__fondo {
  flex: 1 1 auto;
  height: 14px;
  border-radius: var(--radius-pill);
  background-color: var(--color-neutral-bg);
}

.admin-pagos-barras__relleno {
  height: 14px;
  border-radius: var(--radius-pill);
}

.admin-pagos-barras__valor {
  flex: 0 0 96px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.9rem;
}

.admin-pagos-barras__valor small {
  color: var(--color-text-muted);
  font-size: 0.75rem;
}
</style>