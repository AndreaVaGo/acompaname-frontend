<script setup>
import { ref, computed } from "vue";
import {
  NOMBRES_MESES,
  NOMBRES_DIAS,
  celdasDelMes,
  hoyEnFormatoISO,
} from "@/utils/calendario";

// marcas: qué días tienen algo. Por ejemplo { "2026-12-15": { servicios: 1, bloques: 0, minutos: 180 } }
// (minutos = lo que dura lo apuntado ese día; si no viene, el día se considera con horas libres)
// seleccionado: el día que está marcado ahora (2026-12-15), o "" si ninguno
// mesInicial: cualquier fecha del mes que se enseña al principio (si no, el mes de hoy)
const props = defineProps({
  marcas: { type: Object, default: () => ({}) },
  seleccionado: { type: String, default: "" },
  mesInicial: { type: String, default: "" },
});

const emit = defineEmits(["seleccionar"]);

const hoy = hoyEnFormatoISO();

// A partir de 8 horas apuntadas en un día se considera un día completo
const MINUTOS_DIA_COMPLETO = 480;

// El mes que se está viendo (el mes va de 0 a 11)
const partesIniciales = (props.mesInicial || hoy).split("-").map(Number);
const anio = ref(partesIniciales[0]);
const mes = ref(partesIniciales[1] - 1);

const titulo = computed(() => `${NOMBRES_MESES[mes.value]} ${anio.value}`);
const celdas = computed(() => celdasDelMes(anio.value, mes.value));

function mesAnterior() {
  if (mes.value === 0) {
    mes.value = 11;
    anio.value = anio.value - 1;
  } else {
    mes.value = mes.value - 1;
  }
}

function mesSiguiente() {
  if (mes.value === 11) {
    mes.value = 0;
    anio.value = anio.value + 1;
  } else {
    mes.value = mes.value + 1;
  }
}

// Vuelve al mes de hoy y marca el día de hoy
function irAHoy() {
  const partes = hoy.split("-").map(Number);
  anio.value = partes[0];
  mes.value = partes[1] - 1;
  emit("seleccionar", hoy);
}

// Lo que hay en un día (si no hay nada, ceros)
function marcaDe(fecha) {
  return props.marcas[fecha] || { servicios: 0, bloques: 0, minutos: 0 };
}

// "libre" (nada apuntado), "parcial" (algo apuntado pero quedan horas libres) o "completo"
function estadoDe(fecha) {
  const marca = marcaDe(fecha);
  if (marca.servicios === 0 && marca.bloques === 0) {
    return "libre";
  }
  if ((marca.minutos || 0) >= MINUTOS_DIA_COMPLETO) {
    return "completo";
  }
  return "parcial";
}

// "servicio", "bloque" o "mixto" (las dos cosas), para elegir el color de la casilla
function tipoDe(fecha) {
  const marca = marcaDe(fecha);
  if (marca.servicios > 0 && marca.bloques > 0) {
    return "mixto";
  }
  return marca.servicios > 0 ? "servicio" : "bloque";
}

// Cuánto se llena la barra de un día, de 0 a 100 (con 8 horas apuntadas está llena).
// Si la marca no trae minutos, se enseña a la mitad
function porcentajeDe(fecha) {
  const minutos = marcaDe(fecha).minutos;
  if (minutos === undefined) {
    return 50;
  }
  return Math.min(100, Math.round((minutos / MINUTOS_DIA_COMPLETO) * 100));
}

// Las clases de color de una casilla (los días libres no llevan color)
function clasesDeColor(fecha) {
  const estado = estadoDe(fecha);
  if (estado === "libre") {
    return ["calendario-mensual__dia--libre"];
  }
  const clases = ["calendario-mensual__dia--" + tipoDe(fecha)];
  if (estado === "completo") {
    clases.push("calendario-mensual__dia--completo");
  }
  return clases;
}

// El texto que leen los lectores de pantalla en cada día
function descripcionDe(celda) {
  let texto = `${celda.dia} de ${NOMBRES_MESES[mes.value]}`;
  if (marcaDe(celda.fecha).servicios > 0) {
    texto += ", con servicio aceptado";
  }
  if (marcaDe(celda.fecha).bloques > 0) {
    texto += ", con rato ocupado";
  }
  if (estadoDe(celda.fecha) === "completo") {
    texto += ", día completo";
  } else if (estadoDe(celda.fecha) === "parcial") {
    texto += ", con horas libres";
  }
  return texto;
}
</script>

<template>
  <div class="calendario-mensual">
    <div class="calendario-mensual__cabecera">
      <button
        type="button"
        class="calendario-mensual__flecha"
        id="mes-anterior"
        aria-label="Mes anterior"
        @click="mesAnterior"
      >
        ‹
      </button>
      <h2 class="calendario-mensual__titulo" aria-live="polite">{{ titulo }}</h2>
      <button
        type="button"
        class="calendario-mensual__flecha"
        id="mes-siguiente"
        aria-label="Mes siguiente"
        @click="mesSiguiente"
      >
        ›
      </button>
    </div>

    <div class="calendario-mensual__semana">
      <span v-for="nombre in NOMBRES_DIAS" :key="nombre">{{ nombre }}</span>
    </div>

    <div class="calendario-mensual__dias">
      <template v-for="(celda, posicion) in celdas" :key="posicion">
        <span v-if="!celda" class="calendario-mensual__hueco"></span>
        <button
          v-else
          type="button"
          class="calendario-mensual__dia"
          :class="[
            clasesDeColor(celda.fecha),
            {
              'calendario-mensual__dia--hoy': celda.fecha === hoy,
              'calendario-mensual__dia--seleccionado': celda.fecha === seleccionado,
              'calendario-mensual__dia--pasado': celda.fecha < hoy,
            },
          ]"
          :aria-label="descripcionDe(celda)"
          :aria-pressed="celda.fecha === seleccionado"
          @click="emit('seleccionar', celda.fecha)"
        >
          <span class="calendario-mensual__numero">{{ celda.dia }}</span>
          <span class="calendario-mensual__puntos">
            <span
              v-if="marcaDe(celda.fecha).servicios > 0"
              class="calendario-mensual__punto calendario-mensual__punto--servicio"
            ></span>
            <span
              v-if="marcaDe(celda.fecha).bloques > 0"
              class="calendario-mensual__punto calendario-mensual__punto--bloque"
            ></span>
          </span>
          <span v-if="estadoDe(celda.fecha) !== 'libre'" class="calendario-mensual__barra">
            <span
              class="calendario-mensual__barra-relleno"
              :style="{ width: porcentajeDe(celda.fecha) + '%' }"
            ></span>
          </span>
        </button>
      </template>
    </div>

    <div class="calendario-mensual__pie">
      <div class="calendario-mensual__leyenda">
        <span class="calendario-mensual__leyenda-item">
          <span class="calendario-mensual__punto calendario-mensual__punto--servicio"></span>
          Servicio aceptado
        </span>
        <span class="calendario-mensual__leyenda-item">
          <span class="calendario-mensual__punto calendario-mensual__punto--bloque"></span>
          Rato ocupado
        </span>
        <span class="calendario-mensual__leyenda-item">
          <span class="calendario-mensual__barra calendario-mensual__barra--muestra">
            <span class="calendario-mensual__barra-relleno" style="width: 100%"></span>
          </span>
          Barra llena: día completo
        </span>
      </div>
      <button type="button" class="calendario-mensual__hoy" @click="irAHoy">Hoy</button>
    </div>
  </div>
</template>

<style scoped>
.calendario-mensual {
  padding: 20px 24px 24px;
}

.calendario-mensual__cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.calendario-mensual__titulo {
  margin: 0;
  font-size: 1.3rem;
  text-align: center;
}

.calendario-mensual__flecha {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--color-accent);
  background-color: var(--color-white);
  color: var(--color-accent);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.calendario-mensual__flecha:hover {
  background-color: var(--color-accent-bg);
}

.calendario-mensual__semana,
.calendario-mensual__dias {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendario-mensual__semana {
  margin-bottom: 4px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: bold;
  color: var(--color-text-muted);
}

.calendario-mensual__dia {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  min-height: 52px;
  padding: 6px 2px;
  border: 1px solid transparent;
  border-radius: var(--radius-input);
  background-color: var(--color-white);
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.95rem;
  cursor: pointer;
}

.calendario-mensual__dia--libre:hover {
  background-color: var(--color-accent-bg);
}

/* Día con algo apuntado y horas libres: color suave */
.calendario-mensual__dia--servicio {
  background-color: var(--color-secondary-bg);
  border-color: var(--color-secondary);
}

.calendario-mensual__dia--bloque {
  background-color: var(--color-info-bg);
  border-color: var(--color-info);
}

.calendario-mensual__dia--mixto {
  background: linear-gradient(135deg, var(--color-secondary-bg) 50%, var(--color-info-bg) 50%);
  border-color: var(--color-info);
}

/* Día completo: color fuerte y letra blanca */
.calendario-mensual__dia--completo {
  color: var(--color-white);
  font-weight: bold;
}

.calendario-mensual__dia--servicio.calendario-mensual__dia--completo {
  background: var(--color-secondary);
}

.calendario-mensual__dia--bloque.calendario-mensual__dia--completo {
  background: var(--color-info);
}

.calendario-mensual__dia--mixto.calendario-mensual__dia--completo {
  background: linear-gradient(135deg, var(--color-secondary) 50%, var(--color-info) 50%);
}

/* Barrita de abajo: cuánto del día está ocupado (llena con 8 horas) */
.calendario-mensual__barra {
  display: block;
  width: 70%;
  height: 5px;
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.calendario-mensual__barra--muestra {
  display: inline-block;
  width: 28px;
}

.calendario-mensual__barra-relleno {
  display: block;
  height: 100%;
  background-color: var(--color-text);
}

.calendario-mensual__dia--servicio .calendario-mensual__barra-relleno {
  background-color: var(--color-secondary);
}

.calendario-mensual__dia--bloque .calendario-mensual__barra-relleno {
  background-color: var(--color-info);
}

/* En un día completo el fondo es fuerte, así que la barra va en blanco */
.calendario-mensual__dia--completo .calendario-mensual__barra {
  background-color: rgba(255, 255, 255, 0.35);
}

.calendario-mensual__dia--completo .calendario-mensual__barra-relleno {
  background-color: var(--color-white);
}

.calendario-mensual__dia--pasado {
  color: var(--color-text-muted);
}

.calendario-mensual__dia--hoy {
  border-color: var(--color-accent);
  font-weight: bold;
}

/* El día abierto lleva un aro grueso, así no pierde el color que tenga */
.calendario-mensual__dia--seleccionado {
  box-shadow: 0 0 0 3px var(--color-accent);
  font-weight: bold;
}

.calendario-mensual__dia--libre.calendario-mensual__dia--seleccionado {
  background-color: var(--color-accent-bg);
}

.calendario-mensual__puntos {
  display: flex;
  gap: 3px;
  min-height: 8px;
}

.calendario-mensual__punto {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 0 1px var(--color-white);
}

.calendario-mensual__punto--servicio {
  background-color: var(--color-secondary);
}

.calendario-mensual__punto--bloque {
  background-color: var(--color-info);
}

.calendario-mensual__pie {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.calendario-mensual__leyenda {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.calendario-mensual__leyenda-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.calendario-mensual__hoy {
  border: 1px solid var(--color-accent);
  background-color: var(--color-white);
  color: var(--color-accent);
  border-radius: var(--radius-input);
  padding: 6px 16px;
  font-family: inherit;
  cursor: pointer;
}

.calendario-mensual__hoy:hover {
  background-color: var(--color-accent-bg);
}

@media (max-width: 768px) {
  .calendario-mensual {
    padding: 16px 12px 20px;
  }

  .calendario-mensual__dia {
    min-height: 46px;
    font-size: 0.9rem;
  }
}
</style>
