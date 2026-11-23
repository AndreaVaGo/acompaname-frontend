<script setup>
// Pantalla con panel de foto (login y registro). En escritorio la foto va a un lado y el contenido
// (la tarjeta del formulario) al otro; en el móvil no se enseña la foto para no estorbar al formulario.
// La foto es decorativa: no lleva texto alternativo y se esconde a los lectores de pantalla.
// Foto de Roman Kraft en Unsplash (Licencia Unsplash: uso gratuito, sin atribución obligatoria):
// https://unsplash.com/es/fotos/mujer-y-hombre-tomados-de-la-mano-0EVKn3-5JSU
// ACOM-242: la foto cobra vida con una animación suave (ver el final del archivo).
import fotoManos from "@/assets/hero-manos.jpg";
</script>

<template>
  <div class="pantalla-foto pantalla">
    <aside class="pantalla-foto__panel" aria-hidden="true" data-testid="panel-foto">
      <div class="pantalla-foto__marco">
        <img
          class="pantalla-foto__imagen"
          :src="fotoManos"
          alt=""
          width="1000"
          height="667"
          loading="lazy"
          decoding="async"
        />
        <div class="pantalla-foto__velo"></div>
        <p class="pantalla-foto__lema">Cuidar también es acompañar</p>
      </div>
    </aside>
    <div class="pantalla-foto__contenido">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* En el móvil solo se ve el contenido */
.pantalla-foto__panel {
  display: none;
}

.pantalla-foto__contenido {
  min-width: 0;
}

@media (min-width: 960px) {
  .pantalla-foto {
    display: grid;
    grid-template-columns: minmax(320px, 5fr) 7fr;
  }

  .pantalla-foto__panel {
    display: block;
  }

  /* La foto se queda a la vista aunque el formulario sea largo y haya que bajar */
  .pantalla-foto__marco {
    position: sticky;
    top: 0;
    height: 100%;
    max-height: 100vh;
    min-height: 420px;
    overflow: hidden;
  }

  .pantalla-foto__imagen {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* Primero entra (fundido y acercamiento) y después "respira" muy despacio, como si las manos se apretaran */
    transform-origin: 50% 60%;
    animation:
      foto-llega 2.4s cubic-bezier(0.2, 0.7, 0.2, 1) both,
      foto-respira 9s ease-in-out 2.4s infinite alternate;
  }

  /* Velo de color encima de la foto para que el texto blanco se lea bien */
  .pantalla-foto__velo {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      160deg,
      color-mix(in srgb, var(--color-accent-dark) 78%, transparent),
      color-mix(in srgb, var(--color-secondary) 62%, transparent)
    );
  }

  .pantalla-foto__lema {
    position: absolute;
    left: 32px;
    right: 32px;
    /* Arriba, para que se vea siempre aunque el formulario sea largo y la foto llegue más abajo de la pantalla */
    top: 40px;
    margin: 0;
    color: var(--color-white);
    font-family: var(--font-display);
    font-size: 1.9rem;
    font-weight: bold;
    line-height: 1.2;
    animation: lema-sube 0.9s ease-out 0.7s both;
  }
}

/* Solo se anima transform y opacity */
@keyframes foto-llega {
  from {
    transform: scale(1.14) translateY(14px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes foto-respira {
  from {
    transform: scale(1) translateY(0);
  }
  to {
    transform: scale(1.05) translateY(-6px);
  }
}

@keyframes lema-sube {
  from {
    transform: translateY(14px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Con "reducir movimiento" activado en el sistema, la foto se queda quieta */
@media (prefers-reduced-motion: reduce) {
  .pantalla-foto__imagen,
  .pantalla-foto__lema {
    animation: none;
  }
}
</style>
