<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

// La clase que se le ponga desde fuera (por ejemplo la de una tarjeta) se queda en el div de abajo.
// Ojo: no se puede poner un comentario HTML antes del div, porque entonces habría dos raíces
// y la clase de fuera no se pasaría.

// Retraso (en milisegundos) antes de empezar, para que varias piezas aparezcan una tras otra
defineProps({
  retraso: { type: Number, default: 0 },
});

// Ya se ha visto en pantalla (solo se anima la primera vez)
const visible = ref(false);
const raiz = ref(null);
let observador = null;

onMounted(() => {
  // Si el navegador no puede observar la pantalla, se muestra directamente
  if (!("IntersectionObserver" in window)) {
    visible.value = true;
    return;
  }

  observador = new IntersectionObserver(
    (entradas) => {
      if (entradas[0].isIntersecting) {
        visible.value = true;
        observador.disconnect();
      }
    },
    { threshold: 0.2 },
  );
  observador.observe(raiz.value);
});

onBeforeUnmount(() => {
  if (observador) {
    observador.disconnect();
  }
});
</script>

<template>
  <div
    ref="raiz"
    class="aparecer"
    :class="{ 'aparecer--visible': visible }"
    :style="{ '--retraso': `${retraso}ms` }"
  >
    <slot />
  </div>
</template>

<style scoped>
/* Antes de verse, está invisible */
.aparecer {
  opacity: 0;
}

/* Al verse, sube, crece un poco y aparece (con animation, para no chocar con el efecto de pasar el ratón) */
.aparecer--visible {
  animation: aparecer 0.9s ease-out both;
  animation-delay: var(--retraso);
}

@keyframes aparecer {
  from {
    opacity: 0;
    translate: 0 50px;
    scale: 0.94;
  }
  to {
    opacity: 1;
    translate: 0 0;
    scale: 1;
  }
}

/* Quien prefiere menos movimiento lo ve todo desde el principio */
@media (prefers-reduced-motion: reduce) {
  .aparecer {
    opacity: 1;
  }

  .aparecer--visible {
    animation: none;
  }
}
</style>