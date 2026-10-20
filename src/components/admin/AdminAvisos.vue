<script setup>
import { computed } from "vue";

// Bloque «Requieren atención»: solo enseña los avisos que tienen algo que contar
const props = defineProps({
  avisos: { type: Object, required: true },
});

const emit = defineEmits(["verPendientes"]);

function textoProximas(cantidad) {
  if (cantidad === 1) {
    return "1 solicitud pendiente con fecha en las próximas 48 horas.";
  }
  return `${cantidad} solicitudes pendientes con fecha en las próximas 48 horas.`;
}

function textoVencidas(cantidad) {
  if (cantidad === 1) {
    return "1 solicitud pendiente cuya fecha ya ha pasado.";
  }
  return `${cantidad} solicitudes pendientes cuya fecha ya ha pasado.`;
}

function textoPagos(cantidad) {
  if (cantidad === 1) {
    return "1 pago sin cobrar desde hace más de una semana.";
  }
  return `${cantidad} pagos sin cobrar desde hace más de una semana.`;
}

// Lista de frases, una por cada aviso que tenga alguna cantidad
const frases = computed(() => {
  const lista = [];
  if (props.avisos.pendientesProximas48Horas > 0) {
    lista.push(textoProximas(props.avisos.pendientesProximas48Horas));
  }
  if (props.avisos.pendientesVencidas > 0) {
    lista.push(textoVencidas(props.avisos.pendientesVencidas));
  }
  if (props.avisos.pagosSinCobrarMasDeUnaSemana > 0) {
    lista.push(textoPagos(props.avisos.pagosSinCobrarMasDeUnaSemana));
  }
  return lista;
});

// El botón solo tiene sentido si hay solicitudes pendientes que mirar
const hayPendientes = computed(() => {
  return (
    props.avisos.pendientesProximas48Horas > 0 ||
    props.avisos.pendientesVencidas > 0
  );
});
</script>

<template>
  <section v-if="frases.length > 0" class="admin-avisos">
    <div>
      <h2 class="admin-avisos__titulo">Requieren atención</h2>
      <ul class="admin-avisos__lista">
        <li v-for="frase in frases" :key="frase">{{ frase }}</li>
      </ul>
    </div>
    <button
      v-if="hayPendientes"
      type="button"
      class="btn admin-avisos__boton"
      @click="emit('verPendientes')"
    >
      Ver solicitudes pendientes
    </button>
  </section>

  <section v-else class="admin-avisos admin-avisos--vacio">
    <p class="admin-avisos__vacio">Todo en orden: no hay nada que requiera atención.</p>
  </section>
</template>

<style scoped>
.admin-avisos {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background-color: var(--color-accent-bg);
  border-radius: var(--radius-card);
  border-left: 6px solid var(--color-accent-dark);
  padding: 20px 24px;
}

.admin-avisos--vacio {
  background-color: var(--color-secondary-bg);
  border-left-color: var(--color-secondary);
}

.admin-avisos__titulo {
  margin: 0 0 8px;
  font-size: 1.1rem;
  color: var(--color-accent-dark);
}

.admin-avisos__lista {
  margin: 0;
  padding-left: 20px;
  line-height: 1.7;
  font-size: 0.95rem;
}

.admin-avisos__vacio {
  margin: 0;
  font-weight: bold;
  color: var(--color-secondary);
}

.admin-avisos__boton {
  background-color: var(--color-accent-dark);
  color: var(--color-white);
}
</style>