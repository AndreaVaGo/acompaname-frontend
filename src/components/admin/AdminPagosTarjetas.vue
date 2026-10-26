<script setup>
import { computed } from "vue";
import { formatearEuros } from "@/utils/formatearEuros";

// Las tarjetas de arriba de la pestaña Pagos
const props = defineProps({
  resumen: { type: Object, required: true },
});

function textoPagos(cantidad) {
  if (cantidad === 1) {
    return "1 pago";
  }
  return cantidad + " pagos";
}

// El porcentaje llega con punto (66.7) y se muestra con coma (66,7 %); sin pagos, un guion
const porcentaje = computed(() => {
  if (props.resumen.porcentajeCobrado === null) {
    return "—";
  }
  return String(props.resumen.porcentajeCobrado).replace(".", ",") + " %";
});

// Los pagos cancelados no se facturan: no cuentan en la media ni en el porcentaje
const facturados = computed(() => {
  return props.resumen.numeroCobrados + props.resumen.numeroPendientes;
});
</script>

<template>
  <section class="admin-pagos-tarjetas">
    <div class="admin-pagos-tarjetas__tarjeta admin-pagos-tarjetas__tarjeta--verde">
      <div class="admin-pagos-tarjetas__nombre">Total cobrado</div>
      <div class="admin-pagos-tarjetas__numero">{{ formatearEuros(resumen.totalCobrado) }}</div>
      <div class="admin-pagos-tarjetas__detalle">{{ textoPagos(resumen.numeroCobrados) }}</div>
    </div>

    <div class="admin-pagos-tarjetas__tarjeta admin-pagos-tarjetas__tarjeta--coral">
      <div class="admin-pagos-tarjetas__nombre">Pendiente de cobro</div>
      <div class="admin-pagos-tarjetas__numero">{{ formatearEuros(resumen.totalPendiente) }}</div>
      <div class="admin-pagos-tarjetas__detalle">{{ textoPagos(resumen.numeroPendientes) }}</div>
    </div>

    <div class="admin-pagos-tarjetas__tarjeta admin-pagos-tarjetas__tarjeta--azul">
      <div class="admin-pagos-tarjetas__nombre">Porcentaje cobrado</div>
      <div class="admin-pagos-tarjetas__numero">{{ porcentaje }}</div>
      <div class="admin-pagos-tarjetas__detalle">de {{ textoPagos(facturados) }} facturados</div>
    </div>

    <div class="admin-pagos-tarjetas__tarjeta admin-pagos-tarjetas__tarjeta--azul">
      <div class="admin-pagos-tarjetas__nombre">Importe medio</div>
      <div class="admin-pagos-tarjetas__numero">{{ formatearEuros(resumen.importeMedio) }}</div>
      <div class="admin-pagos-tarjetas__detalle">por pago facturado</div>
    </div>

    <div class="admin-pagos-tarjetas__tarjeta admin-pagos-tarjetas__tarjeta--coral">
      <div class="admin-pagos-tarjetas__nombre">Sin cobrar más de 7 días</div>
      <div class="admin-pagos-tarjetas__numero">{{ resumen.pendientesMasDeSieteDias }}</div>
      <div class="admin-pagos-tarjetas__detalle">
        {{ formatearEuros(resumen.importePendienteMasDeSieteDias) }} en riesgo
      </div>
    </div>
  </section>
</template>

<style scoped>
.admin-pagos-tarjetas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap-md);
}

.admin-pagos-tarjetas__tarjeta {
  flex: 1 1 180px;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  border-left: 6px solid var(--color-secondary);
  padding: 20px 22px;
  box-shadow: var(--shadow-card);
}

.admin-pagos-tarjetas__tarjeta--coral {
  border-left-color: var(--color-accent);
}

.admin-pagos-tarjetas__tarjeta--azul {
  border-left-color: var(--color-info);
}

.admin-pagos-tarjetas__nombre {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.admin-pagos-tarjetas__numero {
  font-size: 1.9rem;
  font-weight: bold;
  margin-top: 4px;
}

.admin-pagos-tarjetas__detalle {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}
</style>