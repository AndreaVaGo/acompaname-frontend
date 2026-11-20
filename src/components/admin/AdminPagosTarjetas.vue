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
    <div class="admin-pagos-tarjetas__tarjeta tarjeta-cristal admin-pagos-tarjetas__tarjeta--verde">
      <div class="admin-pagos-tarjetas__nombre">Total cobrado</div>
      <div class="admin-pagos-tarjetas__numero">{{ formatearEuros(resumen.totalCobrado) }}</div>
      <div class="admin-pagos-tarjetas__detalle">{{ textoPagos(resumen.numeroCobrados) }}</div>
    </div>

    <div class="admin-pagos-tarjetas__tarjeta tarjeta-cristal admin-pagos-tarjetas__tarjeta--coral">
      <div class="admin-pagos-tarjetas__nombre">Pendiente de cobro</div>
      <div class="admin-pagos-tarjetas__numero">{{ formatearEuros(resumen.totalPendiente) }}</div>
      <div class="admin-pagos-tarjetas__detalle">{{ textoPagos(resumen.numeroPendientes) }}</div>
    </div>

    <div class="admin-pagos-tarjetas__tarjeta tarjeta-cristal admin-pagos-tarjetas__tarjeta--azul">
      <div class="admin-pagos-tarjetas__nombre">Porcentaje cobrado</div>
      <div class="admin-pagos-tarjetas__numero">{{ porcentaje }}</div>
      <div class="admin-pagos-tarjetas__detalle">de {{ textoPagos(facturados) }} facturados</div>
    </div>

    <div class="admin-pagos-tarjetas__tarjeta tarjeta-cristal admin-pagos-tarjetas__tarjeta--azul">
      <div class="admin-pagos-tarjetas__nombre">Importe medio</div>
      <div class="admin-pagos-tarjetas__numero">{{ formatearEuros(resumen.importeMedio) }}</div>
      <div class="admin-pagos-tarjetas__detalle">por pago facturado</div>
    </div>

    <div class="admin-pagos-tarjetas__tarjeta tarjeta-cristal admin-pagos-tarjetas__tarjeta--coral">
      <div class="admin-pagos-tarjetas__nombre">Sin cobrar más de 7 días</div>
      <div class="admin-pagos-tarjetas__numero">{{ resumen.pendientesMasDeSieteDias }}</div>
      <div class="admin-pagos-tarjetas__detalle">
        {{ formatearEuros(resumen.importePendienteMasDeSieteDias) }} en riesgo
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Una rejilla reparte el ancho a partes iguales: las cinco caben en una fila en escritorio
   y en pantallas pequeñas pasan a dos o a una por fila */
.admin-pagos-tarjetas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--gap-md);
}

.admin-pagos-tarjetas__tarjeta {
  /* El cristal, la sombra y la entrada vienen de la clase global tarjeta-cristal */
  --borde-tarjeta: var(--color-secondary);
  --tinte-tarjeta: color-mix(in srgb, var(--color-secondary) 14%, transparent);
  padding: 18px 18px;
}

.admin-pagos-tarjetas__tarjeta--coral {
  --borde-tarjeta: var(--color-accent);
  --tinte-tarjeta: color-mix(in srgb, var(--color-accent) 16%, transparent);
}

.admin-pagos-tarjetas__tarjeta--azul {
  --borde-tarjeta: var(--color-info);
  --tinte-tarjeta: color-mix(in srgb, var(--color-info) 14%, transparent);
}

.admin-pagos-tarjetas__nombre {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.admin-pagos-tarjetas__numero {
  font-size: 1.6rem;
  font-weight: bold;
  margin-top: 4px;
  /* Un importe grande no se parte en dos líneas */
  white-space: nowrap;
}

.admin-pagos-tarjetas__detalle {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}
</style>