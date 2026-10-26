<script setup>
import { computed } from "vue";
import { formatearEuros } from "@/utils/formatearEuros";

// Tarjeta «Pagos»: lo que ya se ha cobrado y lo que falta por cobrar,
// con una barra que enseña qué parte del total ya está cobrada
const props = defineProps({
  cobrados: { type: Number, required: true },
  pendientes: { type: Number, required: true },
});

// Porcentaje cobrado sobre el total (sin pagos, 0)
const porcentajeCobrado = computed(() => {
  const total = props.cobrados + props.pendientes;
  if (total === 0) {
    return 0;
  }
  return Math.round((props.cobrados * 100) / total);
});
</script>

<template>
  <div class="admin-pagos">
    <h2 class="titulo-seccion">Pagos</h2>

    <div class="admin-pagos__lista">
      <div class="admin-pagos__caja admin-pagos__caja--cobrados">
        <span class="admin-pagos__nombre">Pagados</span>
        <span class="admin-pagos__importe">{{ formatearEuros(cobrados) }}</span>
      </div>
      <div class="admin-pagos__caja admin-pagos__caja--pendientes">
        <span class="admin-pagos__nombre">Pendientes</span>
        <span class="admin-pagos__importe">{{ formatearEuros(pendientes) }}</span>
      </div>
    </div>

    <div class="admin-pagos__progreso">
      <div class="admin-pagos__fondo">
        <div
          class="admin-pagos__relleno"
          :style="{ width: porcentajeCobrado + '%' }"
        ></div>
      </div>
      <span class="admin-pagos__porcentaje">{{ porcentajeCobrado }} % cobrado</span>
    </div>
  </div>
</template>

<style scoped>
.admin-pagos {
  flex: 1 1 280px;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.admin-pagos .titulo-seccion {
  margin-top: 0;
}

.admin-pagos__lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Cada caja lleva una franja de color a la izquierda, como las tarjetas de arriba */
.admin-pagos__caja {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border-radius: 10px;
  border-left: 6px solid transparent;
  padding: 14px 16px;
}

.admin-pagos__caja--cobrados {
  background-color: var(--color-secondary-bg);
  border-left-color: var(--color-secondary);
}

.admin-pagos__caja--cobrados .admin-pagos__nombre,
.admin-pagos__caja--cobrados .admin-pagos__importe {
  color: var(--color-secondary);
}

.admin-pagos__caja--pendientes {
  background-color: var(--color-accent-bg);
  border-left-color: var(--color-accent);
}

.admin-pagos__caja--pendientes .admin-pagos__nombre,
.admin-pagos__caja--pendientes .admin-pagos__importe {
  color: var(--color-accent-dark);
}

.admin-pagos__nombre {
  font-weight: bold;
}

/* El importe se ve grande para que se lea de un vistazo */
.admin-pagos__importe {
  font-size: 1.4rem;
  font-weight: bold;
}

/* Barra de progreso: lo cobrado en verde sobre el fondo naranja suave de lo pendiente */
.admin-pagos__progreso {
  margin-top: 18px;
}

.admin-pagos__fondo {
  height: 14px;
  border-radius: var(--radius-pill);
  background-color: var(--color-accent-bg);
  overflow: hidden;
}

.admin-pagos__relleno {
  height: 14px;
  border-radius: var(--radius-pill);
  background-color: var(--color-secondary);
}

.admin-pagos__porcentaje {
  display: block;
  margin-top: 8px;
  text-align: right;
  font-size: 0.85rem;
  font-weight: bold;
  color: var(--color-secondary);
}
</style>