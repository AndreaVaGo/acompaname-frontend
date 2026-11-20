<script setup>
// Pantalla con panel de foto (login y registro). En escritorio la foto va a un lado y el contenido
// (la tarjeta del formulario) al otro; en el móvil no se enseña la foto para no estorbar al formulario.
// La foto es decorativa: no lleva texto alternativo y se esconde a los lectores de pantalla.
// OJO ACOM-189: falta confirmar la fuente y la licencia de esta foto. Si no se encuentra, hay que
// cambiar el archivo por uno de un banco libre (Unsplash, Pexels) y anotar el enlace en el README.
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
  }
}
</style>
