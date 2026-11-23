<script setup>
// Ilustración propia (SVG, sin imágenes de terceros): dos manos que se acercan y se dan la mano,
// como símbolo de la confianza entre la familia y la persona cuidadora. Va en el panel del login y del registro.
// La animación dura unos 2 segundos y se queda quieta (sin bucle). Solo se anima transform y opacity.
// Con "reducir movimiento" activado en el sistema sale ya terminada, sin animar nada.
// Es decorativa: se esconde a los lectores de pantalla.
</script>

<template>
  <svg
    class="manos"
    viewBox="0 0 400 260"
    fill="none"
    aria-hidden="true"
    focusable="false"
    data-testid="manos-ilustracion"
  >
    <!-- Corazón que aparece cuando las manos se encuentran (el mismo trazo que el logo) -->
    <g class="manos__corazon">
      <path
        transform="translate(164 6) scale(3)"
        d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
        fill="#ffffff"
      />
    </g>

    <g class="manos__apreton">
      <!-- Mano de la persona cuidadora: llega desde la derecha y queda detrás -->
      <g class="manos__mano manos__mano--derecha">
        <rect x="290" y="112" width="140" height="92" rx="24" fill="#d6f0e0" />
        <rect x="282" y="112" width="14" height="92" rx="7" fill="#2e7d5b" fill-opacity="0.35" />
        <rect x="140" y="116" width="170" height="84" rx="38" fill="#fbe0d6" />
      </g>

      <!-- Mano de la familia: llega desde la izquierda y rodea a la otra con los dedos -->
      <g class="manos__mano manos__mano--izquierda">
        <rect x="-30" y="104" width="140" height="92" rx="24" fill="#ffffff" />
        <rect x="104" y="100" width="14" height="92" rx="7" fill="#a8441f" fill-opacity="0.3" />
        <rect x="112" y="108" width="96" height="84" rx="34" fill="#ffffff" />
        <g fill="#ffffff" stroke="#a8441f" stroke-opacity="0.3" stroke-width="3">
          <rect x="176" y="104" width="30" height="78" rx="15" />
          <rect x="200" y="100" width="30" height="84" rx="15" />
          <rect x="224" y="104" width="30" height="80" rx="15" />
          <rect x="248" y="112" width="28" height="68" rx="14" />
        </g>
        <rect x="128" y="92" width="104" height="28" rx="14" fill="#ffffff" stroke="#a8441f" stroke-opacity="0.3" stroke-width="3" transform="rotate(-8 180 106)" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.manos {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

/* Cada elemento se mueve sobre su propia caja, no sobre la de todo el dibujo */
.manos__mano,
.manos__corazon,
.manos__apreton {
  transform-box: fill-box;
  transform-origin: center;
}

.manos__mano--izquierda {
  animation: llegar-izquierda 1s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.manos__mano--derecha {
  animation: llegar-derecha 1s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

/* Cuando se juntan, un par de sacudidas de saludo */
.manos__apreton {
  animation: saludar 0.9s ease-in-out 1s both;
}

/* Y aparece el corazón */
.manos__corazon {
  animation: aparecer-corazon 0.6s cubic-bezier(0.3, 1.6, 0.5, 1) 1.7s both;
}

@keyframes llegar-izquierda {
  from {
    transform: translateX(-170px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes llegar-derecha {
  from {
    transform: translateX(170px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes saludar {
  0%,
  100% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-9px);
  }
  50% {
    transform: translateY(5px);
  }
  75% {
    transform: translateY(-5px);
  }
}

@keyframes aparecer-corazon {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Con "reducir movimiento": el dibujo sale ya terminado */
@media (prefers-reduced-motion: reduce) {
  .manos__mano--izquierda,
  .manos__mano--derecha,
  .manos__apreton,
  .manos__corazon {
    animation: none;
  }
}
</style>
