<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { RouterLink } from "vue-router";
import pinia from "../../pinia/pinia";
import { useAuthStore } from "../../stores/auth";
import AnimacionComoFunciona from "../../components/animation/AnimacionComoFunciona.vue";
import AparecerAlVer from "../../components/animation/AparecerAlVer.vue";
import AvataresPersonas from "../../components/animation/AvataresPersonas.vue";
import CintaDeCuidados from "../../components/animation/CintaDeCuidados.vue";
import { progresoDeScroll, pasoDeProgreso } from "../../utils/pasosScroll";
import IconoManoCorazon from "../../components/animation/IconoManoCorazon.vue";

const authStore = useAuthStore(pinia);

// El título entra palabra a palabra. Cada palabra lleva su número para saber cuándo le toca
const palabrasTitulo = ["Personas", "cuidadoras", "de", "confianza,"];
const palabrasResalte = ["cuando", "tu", "familia", "más", "lo", "necesita"];

// "Así de sencillo" se queda fija mientras se baja y los pasos se van encendiendo.
// Solo en pantallas grandes y si la persona no ha pedido reducir el movimiento
const TOTAL_PASOS = 3;
const bloquePasos = ref(null);
const modoFijo = ref(false);
const progreso = ref(0);
const pasoActivo = ref(0);
let consulta = null;

function actualizarModo() {
  modoFijo.value = consulta.matches;
  actualizarScroll();
}

function actualizarScroll() {
  if (!modoFijo.value || !bloquePasos.value) {
    return;
  }
  const caja = bloquePasos.value.getBoundingClientRect();
  progreso.value = progresoDeScroll(caja.top, caja.height, window.innerHeight);
  pasoActivo.value = pasoDeProgreso(progreso.value, TOTAL_PASOS);
}

onMounted(() => {
  // Si el navegador no sabe de pantallas (por ejemplo, en los tests), todo se ve normal
  if (typeof window.matchMedia !== "function") {
    return;
  }
  consulta = window.matchMedia(
    "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
  );
  consulta.addEventListener("change", actualizarModo);
  window.addEventListener("scroll", actualizarScroll, { passive: true });
  actualizarModo();
});

onBeforeUnmount(() => {
  if (consulta) {
    consulta.removeEventListener("change", actualizarModo);
    window.removeEventListener("scroll", actualizarScroll);
  }
});

// Los dos botones del principio cambian según quién entra:
// una visita puede registrarse o iniciar sesión, y quien ya tiene sesión va a lo suyo
const botones = computed(() => {
  if (!authStore.estaAutenticado) {
    return [
      { texto: "Registrarme", ruta: "/registro" },
      { texto: "Iniciar sesión", ruta: "/login" },
    ];
  }
  if (authStore.rol === "CUIDADOR") {
    return [
      { texto: "Ver mis solicitudes", ruta: "/solicitudes-cuidador" },
      { texto: "Mi calendario", ruta: "/mi-calendario" },
    ];
  }
  if (authStore.rol === "ADMIN") {
    return [{ texto: "Ir al panel de administración", ruta: "/admin" }];
  }
  // Familia
  return [
    { texto: "Buscar personas cuidadoras", ruta: "/buscar" },
    { texto: "Mis solicitudes", ruta: "/solicitudes" },
  ];
});
</script>

<template>
  <div class="landing">
    <section class="landing__hero">
      <div class="landing__hero-content">
        <span class="landing__badge">
          <span class="landing__badge-icon">♥</span>
          Nunca sola, nunca solo
        </span>
        <h1>
          <template v-for="(palabra, i) in palabrasTitulo" :key="'t' + i"
            ><span class="landing__palabra" :style="{ '--i': i }">{{ palabra }}</span
            >{{ " " }}</template
          >
          <span class="landing__resalte">
            <template v-for="(palabra, i) in palabrasResalte" :key="'r' + i"
              ><span
                class="landing__palabra"
                :style="{ '--i': palabrasTitulo.length + i }"
                >{{ palabra }}</span
              >{{ " " }}</template
            >
          </span>
        </h1>
        <p class="landing__hero-text">
          Encuentra profesionales para acompañar en el hospital o en casa a
          quien lo necesite por enfermedad o dependencia, sea cual sea su edad.
          Sin llamadas interminables ni papeleo.
        </p>
        <div class="landing__hero-actions">
          <RouterLink
            v-for="(boton, posicion) in botones"
            :key="boton.ruta"
            :to="boton.ruta"
            class="btn"
            :class="posicion === 0 ? 'btn--primary' : 'btn--secondary'"
            >{{ boton.texto }}</RouterLink
          >
        </div>
        <!-- "Solo mirar" es para quien todavía no tiene cuenta: una tarjeta con enlace a la búsqueda -->
        <div v-if="!authStore.estaAutenticado" class="landing__hint">
          <RouterLink to="/buscar" class="landing__link">
            <AvataresPersonas class="landing__avatares" />
            <span class="landing__mirar-textos">
              <span class="landing__mirar-pregunta">¿Solo quieres mirar?</span>
              <span class="landing__texto">Ver personas cuidadoras disponibles</span>
            </span>
            <span class="landing__flecha" aria-hidden="true">→</span>
          </RouterLink>
        </div>
      </div>
      <div class="landing__hero-image">
        <!-- Animación de 15 segundos que explica cómo funciona la web (sustituye a la foto) -->
        <AnimacionComoFunciona />
      </div>
    </section>

    <CintaDeCuidados />

    <!-- En pantallas grandes este bloque es más alto que la ventana: dentro, la sección se queda fija -->
    <div
      ref="bloquePasos"
      class="landing__steps-bloque"
      :class="{ 'landing__steps-bloque--fijo': modoFijo }"
    >
    <section class="landing__steps" :class="{ 'landing__steps--fijo': modoFijo }">
      <h2>Así de sencillo</h2>
      <div v-if="modoFijo" class="landing__progreso" aria-hidden="true">
        <div
          class="landing__progreso-relleno"
          :style="{ width: progreso * 100 + '%' }"
        ></div>
      </div>
      <div class="landing__steps-grid">
        <AparecerAlVer
          class="landing__step-card"
          :class="{ 'landing__step-card--apagada': modoFijo && pasoActivo < 0 }"
          :retraso="0"
        >
          <span class="landing__step-numero" aria-hidden="true">01</span>
          <span class="landing__step-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-accent)"
              stroke-width="2"
            >
              <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
            </svg>
          </span>
          <h3>1. Cuéntanos qué necesitas</h3>
          <p>Hospital, domicilio o ambos. En un minuto.</p>
        </AparecerAlVer>
        <AparecerAlVer
          class="landing__step-card"
          :class="{ 'landing__step-card--apagada': modoFijo && pasoActivo < 1 }"
          :retraso="250"
        >
          <span class="landing__step-numero" aria-hidden="true">02</span>
          <span class="landing__step-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-accent)"
              stroke-width="2"
            >
              <path
                d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 6.9L12 17.3 5.7 20.8l1.7-6.9L2 9.2l7.1-.6z"
              />
            </svg>
          </span>
          <h3>2. Elige a la persona</h3>
          <p>Perfiles con experiencia, tarifa y valoraciones reales.</p>
        </AparecerAlVer>
        <AparecerAlVer
          class="landing__step-card"
          :class="{ 'landing__step-card--apagada': modoFijo && pasoActivo < 2 }"
          :retraso="500"
        >
          <span class="landing__step-numero" aria-hidden="true">03</span>
          <span class="landing__step-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-accent)"
              stroke-width="2"
            >
              <path d="M4 4h16v9c0 5-4 7-8 8-4-1-8-3-8-8V4z" />
            </svg>
          </span>
          <h3>3. Solicita y acompaña</h3>
          <p>La persona cuidadora acepta y os coordináis desde la app.</p>
        </AparecerAlVer>
      </div>
    </section>
    </div>

    <hr v-if="!authStore.estaAutenticado" class="landing__divider" />

    <AparecerAlVer v-if="!authStore.estaAutenticado" class="landing__cta">
      <div class="landing__cta-texto">
        <div class="landing__cta-icon"><IconoManoCorazon /></div>
        <h2>¿Eres persona cuidadora profesional?</h2>
        <p>
          Publica tu perfil, recibe solicitudes de familias cercanas y gestiona tu
          agenda desde un único sitio.
        </p>
        <ul class="landing__cta-ventajas">
          <li>Tú pones tu tarifa</li>
          <li>Tú eliges tus horarios</li>
          <li>Familias cerca de ti</li>
        </ul>
        <RouterLink to="/registro?rol=cuidador" class="btn btn--primary landing__cta-boton">
          Crear mi perfil profesional
          <span class="landing__cta-flecha" aria-hidden="true">→</span>
        </RouterLink>
      </div>

      <!-- Vista previa de ejemplo de cómo se vería un perfil: es solo decoración, sin datos de nadie -->
      <div class="landing__cta-vista" aria-hidden="true" data-testid="vista-previa-perfil">
        <div class="landing__cta-perfil">
          <div class="landing__cta-perfil-cabecera">
            <span class="landing__cta-perfil-foto"><IconoManoCorazon /></span>
            <span>
              <strong class="landing__cta-perfil-nombre">Tu nombre</strong>
              <span class="landing__cta-perfil-especialidad">Tu especialidad</span>
            </span>
          </div>
          <p class="landing__cta-perfil-estrellas">★★★★★</p>
          <div class="landing__cta-perfil-pie">
            <span class="landing__cta-perfil-precio">18 €/hora</span>
            <span class="landing__cta-perfil-estado">Disponible</span>
          </div>
        </div>
      </div>
    </AparecerAlVer>

  </div>
</template>

<style scoped>
.landing {
  font-family: var(--font-base);
  color: var(--color-text);
  background-color: var(--color-bg);
  /* El fondo con manchas de color va detrás del contenido, pero delante del color de fondo */
  position: relative;
  isolation: isolate;
  overflow-x: clip;

  & h1,
  & h2,
  & h3 {
    margin: 0;
  }
}

.btn {
  border: none;
  padding: 12px 24px;
  border-radius: var(--radius-pill);
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  text-decoration: none;
  display: inline-block;
}

.btn--primary {
  background-color: var(--color-accent-dark);
  color: var(--color-white);
}

.btn--secondary {
  background-color: var(--color-white);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.landing__hint {
  margin: 0;
}

/* Tarjeta en forma de píldora: tres personas, dos líneas de texto y una flecha en un círculo.
   Al pasar el ratón sube, el borde se vuelve verde y la flecha se llena */
.landing__link {
  display: flex;
  width: fit-content;
  max-width: 100%;
  align-items: center;
  gap: 20px;
  padding: 16px 20px 16px 18px;
  background-color: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-card);
  color: var(--color-text);
  text-decoration: none;
  transition:
    transform var(--dur-med) var(--ease-out),
    box-shadow var(--dur-med) var(--ease-out),
    border-color var(--dur-med) var(--ease-out);
}

.landing__link:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
  border-color: var(--color-secondary);
}

.landing__mirar-textos {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.landing__mirar-pregunta {
  font-size: 1rem;
  color: var(--color-text-muted);
}

/* La acción va en verde y en negrita; se subraya al pasar el ratón */
.landing__texto {
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--color-secondary);
}

.landing__link:hover .landing__texto {
  text-decoration: underline;
}

/* Los círculos laten con suavidad (misma animación que los iconos de las tarjetas) */
.landing__avatares {
  flex-shrink: 0;
  /* Más grandes que el tamaño original del dibujo (84 x 36) */
  width: 126px;
  height: auto;
  border-radius: 999px;
  --halo: rgba(46, 125, 91, 0.2);
  animation: latido 3s ease-out infinite;
}

/* La flecha va dentro de un círculo verde claro; al pasar el ratón se llena y se desplaza */
.landing__flecha {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
  font-size: 1.7rem;
  line-height: 1;
  transition:
    transform var(--dur-med) var(--ease-out),
    background-color var(--dur-med) var(--ease-out),
    color var(--dur-med) var(--ease-out);
}

.landing__link:hover .landing__flecha {
  transform: translateX(4px);
  background-color: var(--color-secondary);
  color: var(--color-white);
}

/* Dos manchas de color muy suaves (coral y verde) detrás de la portada, para dar profundidad */
.landing::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 720px;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(circle at 12% 18%, rgba(242, 137, 107, 0.2), transparent 45%),
    radial-gradient(circle at 88% 62%, rgba(46, 125, 91, 0.18), transparent 50%);
}

/* El texto a la izquierda y la animación a la derecha, centrada en vertical */
.landing__hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 50px;
  padding: 40px 60px;
  max-width: 1200px;
  margin: 0 auto;
}

.landing__hero-content {
  max-width: 650px;
}

.landing__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  font-size: 0.85rem;
  margin-bottom: 16px;

  & .landing__badge-icon {
    color: var(--color-secondary);
  }
}

.landing__hero h1 {
  font-size: clamp(2.3rem, 4.2vw, 3.3rem);
  line-height: 1.1;
  letter-spacing: -0.015em;
  margin-bottom: 16px;
}

.landing__hero-text {
  font-size: 1.05rem;
  color: var(--color-text-muted);
  margin-bottom: 24px;
}

.landing__hero-actions {
  display: flex;
  gap: var(--gap-sm);
  margin-bottom: 32px;
}

/* Al cargar la página, cada pieza del texto de la portada sube y aparece, una tras otra */
.landing__hero-content > * {
  animation: entrar var(--dur-slow) var(--ease-out) both;
}

.landing__hero-content > :nth-child(2) {
  animation-delay: 90ms;
}

.landing__hero-content > :nth-child(3) {
  animation-delay: 180ms;
}

.landing__hero-content > :nth-child(4) {
  animation-delay: 270ms;
}

.landing__hero-content > :nth-child(5) {
  animation-delay: 360ms;
}

/* La animación de la derecha entra desde el lado */
.landing__hero-image {
  animation: entrar-lado 800ms var(--ease-out) 200ms both;
}

/* Parte del título lleva un subrayado coral claro que se dibuja de izquierda a derecha */
/* Cada palabra del título sube y se enfoca, una detrás de otra */
.landing__palabra {
  display: inline-block;
  animation: palabra-sube 700ms var(--ease-out) both;
  animation-delay: calc(120ms + var(--i) * 70ms);
}

/* El título entero ya no se anima de golpe: lo hacen sus palabras */
.landing__hero-content > h1 {
  animation: none;
}

.landing__resalte {
  background-image: linear-gradient(var(--color-accent-bg), var(--color-accent-bg));
  background-repeat: no-repeat;
  background-position: 0 92%;
  background-size: 100% 0.4em;
  box-decoration-break: clone;
  animation: subrayar 700ms var(--ease-out) 1100ms both;
}

@keyframes palabra-sube {
  from {
    opacity: 0;
    translate: 0 0.6em;
    filter: blur(6px);
  }
}

@keyframes entrar {
  from {
    opacity: 0;
    translate: 0 24px;
  }
}

@keyframes entrar-lado {
  from {
    opacity: 0;
    translate: 40px 0;
    scale: 0.96;
  }
}

@keyframes subrayar {
  from {
    background-size: 0 0.4em;
  }
}

/* La animación es cuadrada y ocupa el mismo hueco que tenía la foto */
.landing__hero-image {
  flex-shrink: 0;
  width: 500px;
}

.landing__divider {
  border: none;
  border-top: 1px solid var(--color-secondary-bg);
  margin: 0 60px;
}

/* En pantallas grandes el bloque es más alto que la ventana, y la sección se queda fija dentro de él */
.landing__steps-bloque--fijo {
  height: 220vh;
}

.landing__steps--fijo {
  position: sticky;
  top: 90px;
}

/* Barra que se llena según se avanza por los tres pasos */
.landing__progreso {
  max-width: 900px;
  height: 6px;
  margin: 0 auto 24px;
  border-radius: var(--radius-pill);
  background-color: var(--color-secondary-bg);
  overflow: hidden;
}

.landing__progreso-relleno {
  height: 100%;
  border-radius: var(--radius-pill);
  background-color: var(--color-accent);
  transition: width var(--dur-fast) linear;
}

/* Los pasos que todavía no han llegado se ven apagados */
.landing__step-card--apagada {
  filter: grayscale(1) opacity(0.45);
}

.landing__steps {
  text-align: center;
  padding: var(--gap-lg) 60px;

  & h2 {
    font-size: 1.5rem;
    margin-bottom: 24px;
  }
}

.landing__steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gap-md);
  max-width: 900px;
  margin: 0 auto;
}

/* Cada paso tiene su color: coral, verde y azul. Lo usan la franja de arriba, el fondo suave,
   el icono, el halo del latido y el número grande */
.landing__step-card {
  --paso-color: var(--color-accent);
  --paso-fondo: var(--color-accent-bg);
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, var(--paso-fondo) 0%, var(--color-white) 60%);
  border-top: 4px solid var(--paso-color);
  border-radius: var(--radius-card);
  padding: var(--gap-md);
  box-shadow: var(--shadow-card);
  text-align: left;
  transition:
    transform var(--dur-med) var(--ease-out),
    box-shadow var(--dur-med) var(--ease-out),
    filter var(--dur-med) var(--ease-out);

  & h3 {
    margin-bottom: 6px;
  }
}

.landing__step-card:nth-child(2) {
  --paso-color: var(--color-secondary);
  --paso-fondo: var(--color-secondary-bg);
}

.landing__step-card:nth-child(3) {
  --paso-color: var(--color-info);
  --paso-fondo: var(--color-info-bg);
}

/* Número grande de fondo: decora y ayuda a ver el orden de los pasos */
.landing__step-numero {
  position: absolute;
  top: 6px;
  right: 16px;
  font-family: var(--font-display);
  font-size: 3.6rem;
  font-weight: bold;
  line-height: 1;
  color: var(--paso-color);
  opacity: 0.2;
  transition:
    transform var(--dur-med) var(--ease-out),
    opacity var(--dur-med) var(--ease-out);
  pointer-events: none;
}

.landing__step-icon {
  /* Círculo blanco con borde del color del paso (el latido usa la sombra, por eso el borde no es una sombra) */
  background-color: var(--color-white);
  border: 2px solid var(--paso-color);
  color: var(--paso-color);
  border-radius: 50%;
  width: 52px;
  height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  transition: transform var(--dur-med) var(--ease-out);
  /* Latido suave: un halo del color del paso que se expande y se apaga */
  --halo: color-mix(in srgb, var(--paso-color) 45%, transparent);
  animation: latido 3s ease-out infinite;
}

/* El dibujo hereda el color del paso (el color escrito en el svg se anula) */
.landing__step-icon svg {
  width: 24px;
  height: 24px;
  stroke: currentColor;
}

/* Cada tarjeta late un poco después que la anterior */
.landing__step-card:nth-child(2) .landing__step-icon {
  animation-delay: 1s;
}

.landing__step-card:nth-child(3) .landing__step-icon {
  animation-delay: 2s;
}

@keyframes latido {
  0% {
    box-shadow: 0 0 0 0 var(--halo);
  }
  60%,
  100% {
    box-shadow: 0 0 0 14px transparent;
  }
}

/* Al pasar el ratón, la tarjeta sube un poco y su icono se inclina */
.landing__step-card:hover,
.landing__cta:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.landing__step-card:hover .landing__step-icon,
.landing__cta:hover .landing__cta-icon {
  transform: rotate(-10deg) scale(1.12);
  animation: none;
}

.landing__step-card:hover .landing__step-numero {
  transform: scale(1.12);
  opacity: 0.3;
}

.landing__cta {
  /* Dos columnas: el mensaje a la izquierda y la vista previa de un perfil a la derecha */
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  align-items: center;
  gap: 24px;
  position: relative;
  overflow: hidden;
  /* Coral suave que se aclara hacia la derecha, y un halo verde en la esquina */
  background:
    radial-gradient(circle at 100% 0%, rgba(46, 125, 91, 0.18), transparent 45%),
    linear-gradient(135deg, var(--color-accent-bg) 0%, var(--color-white) 60%);
  max-width: 900px;
  margin: 32px auto;
  padding: 36px 40px;
  border-radius: var(--radius-card);
  text-align: left;
  box-shadow: var(--shadow-card);
  transition:
    transform var(--dur-med) var(--ease-out),
    box-shadow var(--dur-med) var(--ease-out);

  & h2 {
    margin-bottom: 12px;
  }
}

/* Mismo estilo que los iconos de las tarjetas de arriba: círculo coral claro, icono coral
   (el color del icono viene del propio componente) y latido coral */
.landing__cta-icon {
  background-color: var(--color-accent-bg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  margin-bottom: 12px;
  transition: transform var(--dur-med) var(--ease-out);
  --halo: rgba(242, 137, 107, 0.45);
  animation: latido 3s ease-out infinite;
}

.landing__cta-icon svg {
  width: 24px;
  height: 24px;
}

/* Tres ventajas en etiquetas */
.landing__cta-ventajas {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0 20px;
  padding: 0;
}

.landing__cta-ventajas li {
  background-color: var(--color-white);
  border: 1px solid var(--color-secondary-bg);
  color: var(--color-secondary);
  border-radius: var(--radius-pill);
  padding: 6px 14px;
  font-size: 0.9rem;
  font-weight: bold;
}

.landing__cta-ventajas li::before {
  content: "✓";
  margin-right: 6px;
}

/* El botón lleva una flecha que se desliza al pasar el ratón */
.landing__cta-boton {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.landing__cta-flecha {
  display: inline-block;
  transition: transform var(--dur-med) var(--ease-out);
}

.landing__cta-boton:hover .landing__cta-flecha {
  transform: translateX(5px);
}

/* Vista previa de un perfil: una tarjeta que flota despacio */
.landing__cta-vista {
  display: flex;
  justify-content: center;
}

.landing__cta-perfil {
  width: 100%;
  max-width: 260px;
  background-color: var(--color-white);
  border-top: 4px solid var(--color-secondary);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card-hover);
  padding: 18px;
  transform: rotate(2deg);
  animation: cta-flota 5s ease-in-out infinite;
}

@keyframes cta-flota {
  0%,
  100% {
    transform: translateY(0) rotate(2deg);
  }
  50% {
    transform: translateY(-8px) rotate(2deg);
  }
}

.landing__cta-perfil-cabecera {
  display: flex;
  align-items: center;
  gap: 12px;
}

.landing__cta-perfil-foto {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background-color: var(--color-secondary-bg);
}

.landing__cta-perfil-foto svg {
  width: 24px;
  height: 24px;
}

.landing__cta-perfil-nombre,
.landing__cta-perfil-especialidad {
  display: block;
}

.landing__cta-perfil-especialidad {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.landing__cta-perfil-estrellas {
  margin: 12px 0;
  color: var(--color-accent);
  letter-spacing: 2px;
}

.landing__cta-perfil-pie {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.landing__cta-perfil-precio {
  font-weight: bold;
}

.landing__cta-perfil-estado {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
  border-radius: var(--radius-pill);
  padding: 3px 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

/* Quien prefiere menos movimiento no ve ni el latido ni los efectos al pasar el ratón */
@media (prefers-reduced-motion: reduce) {
  .landing__hero-content > *,
  .landing__hero-image,
  .landing__palabra,
  .landing__resalte,
  .landing__step-card,
  .landing__step-icon,
  .landing__step-numero,
  .landing__cta,
  .landing__cta-icon,
  .landing__cta-flecha,
  .landing__cta-perfil,
  .landing__avatares,
  .landing__link,
  .landing__flecha {
    transition: none;
    animation: none;
  }

  .landing__step-card:hover,
  .landing__cta:hover,
  .landing__step-card:hover .landing__step-icon,
  .landing__step-card:hover .landing__step-numero,
  .landing__cta:hover .landing__cta-icon,
  .landing__cta-boton:hover .landing__cta-flecha,
  .landing__link:hover .landing__flecha {
    transform: none;
  }
}

@media (max-width: 768px) {
  .landing__hero {
    flex-direction: column;
    align-items: stretch;
    padding: 24px 20px;
    gap: 24px;
  }

  .landing__hero-content {
    max-width: 100%;
  }

  .landing__hero h1 {
    font-size: 2rem;
  }

  .landing__hero-image {
    width: 100%;
  }

  .landing__divider {
    margin: 0 20px;
  }

  .landing__steps {
    padding: 24px 20px;
  }

  .landing__steps-grid {
    grid-template-columns: 1fr;
  }

  .landing__cta {
    grid-template-columns: 1fr;
    margin: 24px 20px;
    padding: 24px;
    text-align: center;
  }

  .landing__cta-ventajas {
    justify-content: center;
  }

  /* En móvil la tarjeta ocupa todo el ancho y las personas se hacen más pequeñas,
     así el texto cabe sin partirse en mitad de una palabra */
  .landing__link {
    width: 100%;
    gap: 12px;
    padding: 14px 14px 14px 14px;
    border-radius: 36px;
  }

  .landing__avatares {
    width: 72px;
  }

  .landing__mirar-textos {
    flex: 1;
    min-width: 0;
  }

  .landing__mirar-pregunta {
    font-size: 0.9rem;
  }

  .landing__texto {
    font-size: 1.15rem;
    overflow-wrap: normal;
    word-break: normal;
  }
}
</style>