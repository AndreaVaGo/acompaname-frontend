<script setup>
import { computed } from "vue";
import { formatearEuros } from "@/utils/formatearEuros";

// Gráfico de columnas: lo cobrado y lo pendiente de cada mes. Solo CSS, sin librerías.
const props = defineProps({
  meses: { type: Array, required: true },
});

const NOMBRES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// El mes llega como «2026-10» y se enseña como «oct 2026»
function nombreMes(mes) {
  const [anio, numero] = mes.split("-");
  return NOMBRES[Number(numero) - 1] + " " + anio;
}

// El mes con más importe llena toda la columna; los demás se miden contra él
const maximo = computed(() => {
  let mayor = 0;
  for (const mes of props.meses) {
    const total = mes.cobrado + mes.pendiente;
    if (total > mayor) {
      mayor = total;
    }
  }
  return mayor;
});

function alto(importe) {
  if (maximo.value === 0) {
    return 0;
  }
  return Math.round((importe * 100) / maximo.value);
}

function descripcion(mes) {
  return (
    nombreMes(mes.mes) +
    ": cobrado " +
    formatearEuros(mes.cobrado) +
    ", pendiente " +
    formatearEuros(mes.pendiente)
  );
}
</script>

<template>
  <div class="admin-pagos-meses">
    <h2 class="titulo-seccion">Pagos por mes</h2>

    <p v-if="maximo === 0" class="admin-pagos-meses__vacio">
      Todavía no hay pagos en estos meses.
    </p>

    <template v-else>
      <div class="admin-pagos-meses__grafico">
        <div
          v-for="mes in meses"
          :key="mes.mes"
          class="admin-pagos-meses__columna"
          :title="descripcion(mes)"
        >
          <span class="admin-pagos-meses__importe">
            {{ formatearEuros(mes.cobrado + mes.pendiente) }}
          </span>
          <div class="admin-pagos-meses__barra">
            <div
              class="admin-pagos-meses__tramo admin-pagos-meses__tramo--cobrado"
              :style="{ height: alto(mes.cobrado) + '%' }"
            ></div>
            <div
              class="admin-pagos-meses__tramo admin-pagos-meses__tramo--pendiente"
              :style="{ height: alto(mes.pendiente) + '%' }"
            ></div>
          </div>
          <span class="admin-pagos-meses__mes">{{ nombreMes(mes.mes) }}</span>
        </div>
      </div>

      <div class="admin-pagos-meses__leyenda">
        <span class="admin-pagos-meses__ficha admin-pagos-meses__ficha--cobrado">Cobrado</span>
        <span class="admin-pagos-meses__ficha admin-pagos-meses__ficha--pendiente">Pendiente</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.admin-pagos-meses {
  flex: 2 1 420px;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
}

.admin-pagos-meses .titulo-seccion {
  margin-top: 0;
}

.admin-pagos-meses__vacio {
  margin: 0;
  color: var(--color-text-muted);
}

/* Líneas de guía horizontales detrás de las columnas (cada 25 % de la altura de la barra) */
.admin-pagos-meses__grafico {
  display: flex;
  gap: 14px;
  align-items: flex-end;
  padding: 8px 8px 0;
  border-radius: var(--radius-input);
  background-color: var(--color-accent-bg);
}

.admin-pagos-meses__columna {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-bottom: 10px;
  border-radius: var(--radius-input);
  transition: transform 0.2s;
}

.admin-pagos-meses__columna:hover {
  transform: translateY(-4px);
}

/* Las columnas se llenan de abajo hacia arriba: primero lo cobrado y encima lo pendiente */
.admin-pagos-meses__barra {
  width: 100%;
  max-width: 56px;
  height: 170px;
  display: flex;
  flex-direction: column-reverse;
  background-color: var(--color-white);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px var(--color-border);
}

.admin-pagos-meses__tramo--cobrado {
  background-color: var(--color-secondary);
}

.admin-pagos-meses__tramo--pendiente {
  background-color: var(--color-accent);
}

.admin-pagos-meses__mes {
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--color-text-muted);
}

.admin-pagos-meses__columna:hover .admin-pagos-meses__mes {
  color: var(--color-text);
}

/* El importe total del mes va arriba de su columna, en negrita */
.admin-pagos-meses__importe {
  font-size: 0.85rem;
  font-weight: bold;
}

.admin-pagos-meses__leyenda {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
  font-size: 0.85rem;
  font-weight: bold;
}

/* La leyenda son pastillas con el color de cada tramo */
.admin-pagos-meses__ficha {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
}

.admin-pagos-meses__ficha::before {
  content: "";
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: currentColor;
}

.admin-pagos-meses__ficha--cobrado {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
}

.admin-pagos-meses__ficha--pendiente {
  background-color: var(--color-accent-bg);
  color: var(--color-accent-dark);
}

/* En el móvil las columnas se juntan un poco para que quepan */
@media (max-width: 640px) {
  .admin-pagos-meses__grafico {
    gap: 6px;
    padding: 8px 4px 0;
  }

  .admin-pagos-meses__barra {
    height: 140px;
  }

  .admin-pagos-meses__importe {
    font-size: 0.7rem;
  }
}
</style>