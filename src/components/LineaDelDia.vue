<script setup>
import { computed } from "vue";
import { huecosLibres, minutosAHora } from "@/utils/calendario";

// tramos: lo que tiene ocupado el día, en minutos desde las 00:00.
// Por ejemplo [{ inicio: 480, fin: 900, texto: "Rato ocupado · Turno" }] es de 08:00 a 15:00
const props = defineProps({
  tramos: { type: Array, default: () => [] },
});

const MINUTOS_DEL_DIA = 1440;
// Los números que salen debajo de la línea
const HORAS_MARCADAS = [0, 6, 12, 18, 24];
// Si el tramo dura 4 horas o más, la hora se escribe dentro (si no, no cabe)
const MINUTOS_PARA_ESCRIBIR_DENTRO = 240;

const libres = computed(() => huecosLibres(props.tramos));

// La frase que explica qué horas quedan libres
const textoLibres = computed(() => {
  if (libres.value.length === 0) {
    return "No te queda ninguna hora libre este día.";
  }
  if (props.tramos.length === 0) {
    return "Libre todo el día.";
  }
  const partes = [];
  for (const hueco of libres.value) {
    partes.push(minutosAHora(hueco.inicio) + " – " + minutosAHora(hueco.fin));
  }
  return "Horas libres: " + partes.join(" · ");
});

// Dónde empieza el tramo y cuánto mide, en tanto por ciento del día
function estiloDe(tramo) {
  return {
    left: (tramo.inicio / MINUTOS_DEL_DIA) * 100 + "%",
    width: ((tramo.fin - tramo.inicio) / MINUTOS_DEL_DIA) * 100 + "%",
  };
}

function rangoDe(tramo) {
  return minutosAHora(tramo.inicio) + " – " + minutosAHora(tramo.fin);
}

function cabeTexto(tramo) {
  return tramo.fin - tramo.inicio >= MINUTOS_PARA_ESCRIBIR_DENTRO;
}
</script>

<template>
  <div class="linea-dia">
    <div class="linea-dia__pista" role="img" :aria-label="textoLibres">
      <span
        v-for="(tramo, posicion) in tramos"
        :key="posicion"
        class="linea-dia__tramo"
        :style="estiloDe(tramo)"
        :title="rangoDe(tramo) + (tramo.texto ? ' · ' + tramo.texto : '')"
      >
        <span v-if="cabeTexto(tramo)" class="linea-dia__texto">{{ rangoDe(tramo) }}</span>
      </span>
    </div>

    <div class="linea-dia__horas" aria-hidden="true">
      <span v-for="hora in HORAS_MARCADAS" :key="hora">{{ hora }} h</span>
    </div>

    <p class="linea-dia__libres">{{ textoLibres }}</p>

    <div class="linea-dia__leyenda" aria-hidden="true">
      <span class="linea-dia__leyenda-item">
        <span class="linea-dia__muestra linea-dia__muestra--libre"></span>
        Libre
      </span>
      <span class="linea-dia__leyenda-item">
        <span class="linea-dia__muestra linea-dia__muestra--ocupado"></span>
        Ocupado
      </span>
    </div>
  </div>
</template>

<style scoped>
.linea-dia {
  margin-bottom: 16px;
}

/* La línea entera es el día (de 00:00 a 24:00): en verde lo libre y en azul lo ocupado */
.linea-dia__pista {
  position: relative;
  height: 36px;
  border-radius: var(--radius-input);
  background-color: var(--color-secondary-bg);
  border: 1px solid var(--color-secondary);
  overflow: hidden;
}

.linea-dia__tramo {
  position: absolute;
  top: 0;
  bottom: 0;
  min-width: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-info);
  border-left: 1px solid var(--color-white);
  border-right: 1px solid var(--color-white);
}

.linea-dia__texto {
  color: var(--color-white);
  font-size: 0.8rem;
  font-weight: bold;
  white-space: nowrap;
}

.linea-dia__horas {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.linea-dia__libres {
  margin: 10px 0 8px;
  font-weight: bold;
  color: var(--color-secondary);
}

.linea-dia__leyenda {
  display: flex;
  gap: 16px;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.linea-dia__leyenda-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.linea-dia__muestra {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 3px;
}

.linea-dia__muestra--libre {
  background-color: var(--color-secondary-bg);
  border: 1px solid var(--color-secondary);
}

.linea-dia__muestra--ocupado {
  background-color: var(--color-info);
}
</style>
