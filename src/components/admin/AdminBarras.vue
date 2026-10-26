<script setup>
import { computed } from "vue";

// Lista de barras horizontales: cada fila tiene un texto, una cantidad y un color.
// El ancho de cada barra es el porcentaje que esa cantidad supone sobre el total.
const props = defineProps({
  titulo: { type: String, required: true },
  filas: { type: Array, required: true },
  nota: { type: String, default: "" },
});

const total = computed(() => {
  let suma = 0;
  for (const fila of props.filas) {
    suma = suma + fila.cantidad;
  }
  return suma;
});

function porcentaje(fila) {
  if (total.value === 0) {
    return 0;
  }
  return Math.round((fila.cantidad * 100) / total.value);
}
</script>

<template>
  <div class="admin-barras">
    <h2 class="titulo-seccion">{{ titulo }}</h2>

    <div class="admin-barras__lista">
      <!-- El color de la fila se guarda en una variable CSS para usarlo en el puntito y en la cantidad -->
      <div
        v-for="fila in filas"
        :key="fila.texto"
        class="admin-barras__fila"
        :style="{ '--color-fila': fila.color }"
      >
        <span class="admin-barras__texto">{{ fila.texto }}</span>
        <div class="admin-barras__fondo">
          <div
            class="admin-barras__relleno"
            :style="{ width: porcentaje(fila) + '%', backgroundColor: fila.color }"
          ></div>
        </div>
        <span class="admin-barras__cantidad">{{ fila.cantidad }}</span>
      </div>
    </div>

    <p v-if="nota" class="admin-barras__nota">{{ nota }}</p>
  </div>
</template>

<style scoped>
.admin-barras {
  flex: 1 1 320px;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.admin-barras .titulo-seccion {
  margin-top: 0;
}

.admin-barras__lista {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.admin-barras__fila {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Puntito del color de la fila delante del texto */
.admin-barras__texto {
  flex: 0 0 110px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: bold;
}

.admin-barras__texto::before {
  content: "";
  flex: 0 0 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--color-fila);
}

.admin-barras__fondo {
  flex: 1 1 auto;
  height: 18px;
  border-radius: var(--radius-pill);
  background-color: var(--color-neutral-bg);
}

.admin-barras__relleno {
  height: 18px;
  border-radius: var(--radius-pill);
}

/* La cantidad va en una pastilla del color de la fila */
.admin-barras__cantidad {
  flex: 0 0 auto;
  min-width: 32px;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  background-color: var(--color-fila);
  color: var(--color-white);
  text-align: center;
  font-size: 0.85rem;
  font-weight: bold;
}

.admin-barras__nota {
  margin: 22px 0 0;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}
</style>