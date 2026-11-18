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

// Una rayita por cada hora, de las 0 a las 24 (son 25 rayitas)
const RAYITAS = [];
for (let hora = 0; hora <= 24; hora++) {
  RAYITAS.push(hora);
}
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

// Dónde va una rayita o un número: las 0 h a la izquierda del todo y las 24 h a la derecha
function posicionDe(hora) {
  return { left: (hora / 24) * 100 + "%" };
}

// Las rayitas de las 0, 6, 12, 18 y 24 son grandes, las de las 3, 9, 15 y 21 medianas y el resto pequeñas
function claseDeRayita(hora) {
  if (hora % 6 === 0) {
    return "linea-dia__rayita--grande";
  }
  if (hora % 3 === 0) {
    return "linea-dia__rayita--mediana";
  }
  return "";
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

    <div class="linea-dia__rayitas" aria-hidden="true">
      <span
        v-for="hora in RAYITAS"
        :key="hora"
        class="linea-dia__rayita"
        :class="claseDeRayita(hora)"
        :style="posicionDe(hora)"
      ></span>
    </div>

    <div class="linea-dia__horas" aria-hidden="true">
      <span
        v-for="hora in HORAS_MARCADAS"
        :key="hora"
        :class="{ 'linea-dia__hora--inicio': hora === 0, 'linea-dia__hora--fin': hora === 24 }"
        :style="posicionDe(hora)"
      >
        {{ hora }} h
      </span>
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

/* La regla: una rayita por cada hora, pegada a la línea */
.linea-dia__rayitas {
  position: relative;
  height: 12px;
}

.linea-dia__rayita {
  position: absolute;
  top: 0;
  width: 1px;
  height: 5px;
  background-color: var(--color-text-muted);
  transform: translateX(-50%);
}

.linea-dia__rayita--mediana {
  height: 8px;
}

.linea-dia__rayita--grande {
  height: 12px;
  width: 2px;
  background-color: var(--color-text);
}

/* Los números van centrados bajo su rayita; el primero y el último se quedan dentro de la línea */
.linea-dia__horas {
  position: relative;
  height: 18px;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.linea-dia__horas span {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  white-space: nowrap;
}

.linea-dia__horas .linea-dia__hora--inicio {
  transform: none;
}

.linea-dia__horas .linea-dia__hora--fin {
  transform: translateX(-100%);
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

@media (max-width: 480px) {
  .linea-dia__horas {
    font-size: 0.7rem;
  }

  .linea-dia__libres {
    font-size: 0.9rem;
  }
}
</style>
