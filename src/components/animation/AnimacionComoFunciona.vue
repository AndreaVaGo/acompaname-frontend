<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import IconoManoCorazon from "./IconoManoCorazon.vue";
import { DURACION, calcular } from "../../utils/lineaDeTiempoHero";

// Segundo en el que va la animación
const t = ref(0);
// La persona la ha pausado con el botón
const pausada = ref(false);
// Se ve en pantalla (si no se ve, no gastamos recursos moviéndola)
const enPantalla = ref(true);
const raiz = ref(null);

// Todo lo que se ve en este segundo, calculado en utils/lineaDeTiempoHero.js
const e = computed(() => calcular(t.value));
const corriendo = computed(() => !pausada.value && enPantalla.value);
const textoBoton = computed(() =>
  pausada.value ? "Reproducir animación" : "Pausar animación",
);

// Siluetas de la escena A: bebé, niño, adolescente, adulto y persona mayor (sin caras)
const figuras = [
  { alto: 15, ancho: 10, izquierda: 5.5, color: "var(--color-accent)" },
  { alto: 21, ancho: 12, izquierda: 20.5, color: "var(--color-secondary)" },
  { alto: 27, ancho: 14, izquierda: 37.5, color: "var(--color-accent)" },
  { alto: 36, ancho: 17, izquierda: 56.5, color: "var(--color-secondary)" },
  { alto: 31, ancho: 16, izquierda: 78.5, color: "var(--color-accent-dark)" },
];

const fichas = ["Niños", "Adultos", "Mayores", "Disponible ahora"];
const tarjetas = [
  { inicial: "L", nombre: "Lucía M.", detalle: "Pediatría · Oviedo" },
  { inicial: "D", nombre: "Daniel R.", detalle: "Geriatría · Gijón" },
  { inicial: "M", nombre: "Marta P.", detalle: "Acompañamiento hospitalario · Oviedo" },
];
const camposNinos = ["Pediatra de referencia", "Alergias", "Rutinas de comida y sueño"];
const camposMayores = ["Medicación", "Movilidad", "Orientación y memoria"];

// Estilos que dependen del segundo en el que estamos
function estilo(pieza) {
  return { opacity: pieza.o, transform: `translateY(${pieza.y}cqw)` };
}

function estiloFigura(figura, i) {
  return {
    left: `${figura.izquierda}cqw`,
    width: `${figura.ancho}cqw`,
    height: `${figura.alto}cqw`,
    "--color-figura": figura.color,
    ...estilo(e.value.figuras[i]),
  };
}

function alternar() {
  pausada.value = !pausada.value;
}

// --- Reloj de la animación ---
let idFotograma = null;
let ultimo = null;
let observador = null;

function fotograma(ahora) {
  if (corriendo.value) {
    if (ultimo !== null) {
      // Si la pestaña estuvo en segundo plano, no damos un salto grande de golpe
      t.value += Math.min(0.1, (ahora - ultimo) / 1000);
      if (t.value >= DURACION) t.value -= DURACION;
    }
    ultimo = ahora;
  } else {
    ultimo = null;
  }
  idFotograma = requestAnimationFrame(fotograma);
}

onMounted(() => {
  // Quien prefiere menos movimiento la ve parada, en un fotograma completo
  const menosMovimiento =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (menosMovimiento) {
    pausada.value = true;
    t.value = 5;
  }

  // Solo se mueve mientras se ve en pantalla
  if ("IntersectionObserver" in window) {
    observador = new IntersectionObserver((entradas) => {
      enPantalla.value = entradas[0].isIntersecting;
    });
    observador.observe(raiz.value);
  }

  idFotograma = requestAnimationFrame(fotograma);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(idFotograma);
  if (observador) {
    observador.disconnect();
  }
});
</script>

<template>
  <div class="animacion-caja">
    <div
      ref="raiz"
      class="animacion"
      role="img"
      aria-label="Animación de 15 segundos. Una familia busca a una persona cuidadora, rellena una solicitud que se adapta a la edad de la persona cuidada y la persona cuidadora la acepta. Termina con el nombre Acompáñame."
    >
      <!-- Escena A: siluetas de todas las edades -->
      <span class="animacion__suelo" :style="{ opacity: e.suelo }"></span>
      <span
        v-for="(figura, i) in figuras"
        :key="i"
        class="animacion__figura"
        :style="estiloFigura(figura, i)"
      >
        <span class="animacion__cabeza"></span>
        <span class="animacion__cuerpo"></span>
      </span>
      <p class="animacion__apertura">
        <span class="animacion__linea" :style="estilo(e.lineasA[0])">Cuidar a quien quieres</span>
        <span class="animacion__linea" :style="estilo(e.lineasA[1])"
          >también es <em>pedir ayuda.</em></span
        >
      </p>

      <!-- Textos de las escenas B, C y D -->
      <div class="animacion__texto" :style="estilo(e.capB)">
        <span class="animacion__etiqueta">Buscar</span>
        <p>Encuentra a la persona cuidadora que necesitas.</p>
      </div>
      <div class="animacion__texto" :style="estilo(e.capC)">
        <span class="animacion__etiqueta">Solicitar</span>
        <p>Cuéntanos qué necesita. El formulario se adapta.</p>
      </div>
      <div class="animacion__texto" :style="estilo(e.capD)">
        <span class="animacion__etiqueta">Coordinar</span>
        <p>La persona cuidadora acepta. Os coordináis desde la app.</p>
      </div>

      <!-- Móvil con tres pantallas -->
      <div
        class="animacion__movil"
        :style="{ opacity: e.movil.o, transform: `translateX(${e.movil.x}cqw)` }"
      >
        <div class="animacion__pantalla">
          <span class="animacion__muesca"></span>
          <div class="animacion__cabeza-app">
            <span class="animacion__logo"><IconoManoCorazon /></span>
            Acompáñame
          </div>

          <!-- Pantalla 1: buscador con filtro por edad -->
          <div class="animacion__capa" :style="{ opacity: e.p1 }">
            <div class="animacion__buscador">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m20 20-4.2-4.2" />
              </svg>
              Oviedo
            </div>
            <div class="animacion__fichas">
              <span
                v-for="(ficha, i) in fichas"
                :key="ficha"
                class="animacion__ficha"
                :class="{ 'animacion__ficha--elegida': i === 0 && e.fichaNinosElegida }"
                :style="i === 0 ? { transform: `scale(${e.fichaNinosEscala})` } : null"
                >{{ ficha }}</span
              >
            </div>
            <div
              v-for="(tarjeta, k) in tarjetas"
              :key="tarjeta.nombre"
              class="animacion__tarjeta"
              :class="{ 'animacion__tarjeta--acierto': k === 0 && e.tarjetaAcierto }"
              :style="estilo(e.tarjetas[k])"
            >
              <span class="animacion__avatar">{{ tarjeta.inicial }}</span>
              <div>
                <b>{{ tarjeta.nombre }}</b>
                <small>{{ tarjeta.detalle }}</small>
                <span class="animacion__disp">Disponible ahora</span>
              </div>
            </div>
          </div>

          <!-- Pantalla 2: el formulario cambia según la edad -->
          <div class="animacion__capa" :style="{ opacity: e.p2 }">
            <p class="animacion__titulo-form">Solicitar cuidado</p>
            <div class="animacion__modo">
              <span class="animacion__ficha animacion__ficha--elegida">A domicilio</span>
              <span class="animacion__ficha">Hospital</span>
            </div>
            <span class="animacion__etq">Edad de la persona cuidada</span>
            <div class="animacion__campo animacion__campo--edad">
              <span class="animacion__valor">{{ e.edad }}</span>
              <span class="animacion__grupos">
                <span class="animacion__grupo" :style="{ opacity: e.grupoNinos }">Niños y niñas</span>
                <span class="animacion__grupo" :style="{ opacity: e.grupoMayores }">Personas mayores</span>
              </span>
            </div>
            <div class="animacion__campos">
              <div :style="estilo(e.camposNinos)">
                <template v-for="campo in camposNinos" :key="campo">
                  <span class="animacion__etq">{{ campo }}</span>
                  <div class="animacion__campo animacion__campo--chico"><span class="animacion__relleno"></span></div>
                </template>
              </div>
              <div :style="estilo(e.camposMayores)">
                <template v-for="campo in camposMayores" :key="campo">
                  <span class="animacion__etq">{{ campo }}</span>
                  <div class="animacion__campo animacion__campo--chico"><span class="animacion__relleno"></span></div>
                </template>
              </div>
            </div>
            <div class="animacion__enviar" :style="{ transform: `scale(${e.botonEscala})` }">
              Enviar solicitud
            </div>
          </div>

          <!-- Pantalla 3: solicitud aceptada -->
          <div class="animacion__capa animacion__capa--centro" :style="{ opacity: e.p3 }">
            <div class="animacion__sello" :style="{ transform: `scale(${e.selloEscala})` }">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path
                  class="animacion__check"
                  pathLength="1"
                  stroke-dasharray="1"
                  :stroke-dashoffset="e.checkDibujo"
                  d="M5 12.5l4.5 4.5L19 7"
                />
              </svg>
            </div>
            <p class="animacion__aceptada">Solicitud aceptada</p>
            <div class="animacion__chat">
              <div class="animacion__burbuja animacion__burbuja--mia" :style="estilo(e.burbuja1)">
                ¿A qué hora os viene bien?
              </div>
              <div class="animacion__burbuja animacion__burbuja--otra" :style="estilo(e.burbuja2)">
                A las 9:00, sin problema.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cierre -->
      <div class="animacion__cierre" :style="{ opacity: e.cierre }">
        <div class="animacion__marca" :style="{ transform: `scale(${e.marcaEscala})` }">
          <IconoManoCorazon />
        </div>
        <p class="animacion__nombre" :style="{ transform: `translateY(${e.nombreY}cqw)` }">Acompáñame</p>
        <p class="animacion__lema" :style="{ opacity: e.lema }">Cuidado y acompañamiento, a cualquier edad.</p>
      </div>
    </div>

    <!-- Botón con icono de pausa o de play; el texto lo leen los lectores de pantalla -->
    <button
      type="button"
      class="animacion__pausa"
      :aria-label="textoBoton"
      :title="textoBoton"
      @click="alternar"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
        <path v-if="pausada" d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
        <path v-else d="M7 5h3.5a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm6.5 0H17a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-3.5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.animacion-caja {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  width: 100%;
}

/* Escenario cuadrado. Todo se mide en cqw (un 1 % de su ancho), así se ve igual de grande en cualquier pantalla */
.animacion {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  container-type: inline-size;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  font-family: var(--font-base);
  color: var(--color-text);

  & > * {
    position: absolute;
  }
}

/* Escena A */
.animacion__suelo {
  left: -10cqw;
  top: 78cqw;
  width: 120cqw;
  height: 50cqw;
  border-radius: 50%;
  background-color: var(--color-accent-bg);
}

.animacion__figura {
  bottom: 10cqw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6cqw;
}

.animacion__cabeza {
  width: 70%;
  aspect-ratio: 1;
  border-radius: 50%;
  background-color: var(--color-figura);
}

.animacion__cuerpo {
  flex: 1;
  width: 100%;
  border-radius: 999px 999px 1.5cqw 1.5cqw;
  background-color: var(--color-figura);
}

.animacion__apertura {
  left: 7cqw;
  top: 10cqw;
  margin: 0;
  font-size: 6.2cqw;
  line-height: 1.15;
  font-weight: bold;

  & em {
    font-style: normal;
    color: var(--color-accent-dark);
  }
}

.animacion__linea {
  display: block;
}

/* Textos de las escenas B, C y D */
.animacion__texto {
  left: 7cqw;
  top: 7cqw;
  width: 86cqw;

  & p {
    margin: 1.6cqw 0 0;
    font-size: 5.6cqw;
    line-height: 1.18;
    font-weight: bold;
  }
}

.animacion__etiqueta {
  display: inline-block;
  font-size: 2.8cqw;
  font-weight: bold;
  padding: 0.7cqw 2.2cqw;
  border-radius: var(--radius-pill);
  background-color: var(--color-accent-bg);
}

/* Móvil: dentro, todo se mide en em (1 em = 1,93 cqw) */
.animacion__movil {
  left: 32cqw;
  top: 29cqw;
  width: 35.8cqw;
  height: 68cqw;
  padding: 0.8cqw;
  border-radius: 5cqw;
  background-color: var(--color-text);
  box-shadow: 0 2cqw 5cqw rgba(26, 46, 42, 0.25);
}

.animacion__pantalla {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 4.3cqw;
  background-color: var(--color-white);
  overflow: hidden;
  font-size: 1.93cqw;
}

.animacion__muesca {
  position: absolute;
  z-index: 3;
  left: 50%;
  top: 0.67em;
  translate: -50% 0;
  width: 4.44em;
  height: 0.81em;
  border-radius: var(--radius-pill);
  background-color: var(--color-text);
}

.animacion__cabeza-app {
  position: absolute;
  z-index: 2;
  left: 1.28em;
  right: 1.28em;
  top: 2.13em;
  display: flex;
  align-items: center;
  gap: 0.5em;
  font-size: 1.04em;
  font-weight: bold;
}

.animacion__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.86em;
  height: 1.86em;
  border-radius: 50%;
  background-color: var(--color-accent-bg);

  & svg {
    width: 70%;
    height: 70%;
  }
}

.animacion__capa {
  position: absolute;
  inset: 0;
  padding: 5.48em 1.33em 0;
}

.animacion__capa--centro {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* Pantalla 1 */
.animacion__buscador {
  display: flex;
  align-items: center;
  gap: 0.54em;
  height: 2.47em;
  padding: 0 1em;
  border-radius: var(--radius-pill);
  background-color: var(--color-bg);
  font-size: 0.96em;
  font-weight: bold;

  & svg {
    width: 1.16em;
    height: 1.16em;
  }
}

.animacion__fichas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.44em;
  margin-top: 0.74em;
}

.animacion__ficha {
  padding: 0.48em 1.05em;
  border-radius: var(--radius-pill);
  background-color: var(--color-accent-bg);
  font-size: 0.85em;
  font-weight: bold;
}

.animacion__ficha--elegida {
  background-color: var(--color-accent);
}

.animacion__tarjeta {
  display: flex;
  align-items: center;
  gap: 0.74em;
  margin-top: 0.74em;
  padding: 0.74em;
  border: 0.11em solid var(--color-border);
  border-radius: 0.96em;
  background-color: var(--color-white);

  & b {
    display: block;
  }

  & small {
    display: block;
    margin-top: 0.09em;
    font-size: 0.78em;
    color: var(--color-text-muted);
  }
}

.animacion__tarjeta--acierto {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 0.19em var(--color-accent-bg);
}

.animacion__avatar {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.36em;
  height: 2.36em;
  border-radius: 50%;
  background-color: var(--color-accent-bg);
  font-size: 1.19em;
  font-weight: bold;
}

.animacion__disp {
  display: inline-block;
  margin-top: 0.43em;
  padding: 0.27em 0.84em;
  border-radius: var(--radius-pill);
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
  font-size: 0.7em;
  font-weight: bold;
}

/* Pantalla 2 */
.animacion__titulo-form {
  margin: 0 0 0.57em;
  font-size: 1.3em;
  font-weight: bold;
}

.animacion__modo {
  display: flex;
  gap: 0.44em;
}

.animacion__etq {
  display: block;
  margin: 1.04em 0 0.33em;
  font-size: 0.78em;
  font-weight: bold;
  color: var(--color-text-muted);
}

.animacion__campo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 2.07em;
  padding: 0 0.74em;
  border: 0.11em solid var(--color-border);
  border-radius: 0.74em;
}

.animacion__campo--edad {
  border: 0.15em solid var(--color-accent);
}

.animacion__campo--chico {
  height: 1.78em;
}

.animacion__valor {
  min-width: 2em;
  font-size: 1.11em;
  font-weight: bold;

  /* Cursor que parpadea, como al escribir */
  &::after {
    content: "";
    display: inline-block;
    width: 0.08em;
    height: 1em;
    margin-left: 0.15em;
    vertical-align: middle;
    background-color: var(--color-text);
    animation: parpadeo 0.9s steps(1) infinite;
  }
}

@keyframes parpadeo {
  50% {
    opacity: 0;
  }
}

.animacion__grupos {
  position: relative;
  width: 8.15em;
  height: 1.41em;
}

.animacion__grupo {
  position: absolute;
  right: 0;
  top: 0.11em;
  padding: 0.3em 0.9em;
  border-radius: var(--radius-pill);
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
  font-size: 0.74em;
  font-weight: bold;
  white-space: nowrap;
}

.animacion__campos {
  position: relative;
  height: 13.3em;
  margin-top: 0.3em;

  & > div {
    position: absolute;
    inset: 0;
  }
}

.animacion__relleno {
  width: 58%;
  height: 0.37em;
  border-radius: var(--radius-pill);
  background-color: var(--color-neutral-bg);
}

.animacion__enviar {
  position: absolute;
  left: 1.33em;
  right: 1.33em;
  bottom: 1.48em;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.44em;
  border-radius: var(--radius-pill);
  background-color: var(--color-accent);
  font-weight: bold;
}

/* Pantalla 3 */
.animacion__sello {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5.93em;
  height: 5.93em;
  margin-top: 1.48em;
  border-radius: 50%;
  background-color: var(--color-secondary);

  & svg {
    width: 3.11em;
    height: 3.11em;
  }
}

.animacion__aceptada {
  margin: 0.67em 0 1.11em;
  font-size: 1.33em;
  font-weight: bold;
}

.animacion__chat {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.animacion__burbuja {
  max-width: 82%;
  margin-top: 0.66em;
  padding: 0.75em 1.08em;
  border-radius: 1.17em;
  font-size: 0.89em;
  font-weight: bold;
}

.animacion__burbuja--mia {
  align-self: flex-start;
  border-bottom-left-radius: 0.25em;
  background-color: var(--color-bg);
}

.animacion__burbuja--otra {
  align-self: flex-end;
  border-bottom-right-radius: 0.25em;
  background-color: var(--color-accent-bg);
}

/* Cierre */
.animacion__cierre {
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: var(--color-white);
  pointer-events: none;

  & p {
    margin: 0;
  }
}

.animacion__marca {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26cqw;
  height: 26cqw;
  border-radius: 50%;
  background-color: var(--color-accent-bg);

  & svg {
    width: 16cqw;
    height: 16cqw;
  }
}

.animacion__nombre {
  margin-top: 3cqw;
  font-size: 11cqw;
  font-weight: bold;
  line-height: 1;
}

.animacion__lema {
  max-width: 90cqw;
  margin-top: 2cqw;
  font-size: 3.5cqw;
  font-weight: bold;
  color: var(--color-secondary);
}

/* Botón redondo de pausa y play (quien lo necesite puede parar el movimiento) */
.animacion__pausa {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background-color: var(--color-white);
  color: var(--color-text);
  cursor: pointer;
  transition: background-color 0.2s ease;

  & svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background-color: var(--color-accent-bg);
  }

  &:focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .animacion__valor::after {
    animation: none;
  }
}
</style>