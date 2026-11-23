<script setup>
// Pantalla con panel de ilustración (login y registro). En escritorio el panel va a un lado y el contenido
// (la tarjeta del formulario) al otro; en el móvil no se enseña el panel para no estorbar al formulario.
// ACOM-242: el panel enseña dos manos que se dan la mano (ilustración propia y animada), en lugar de la foto
// de antes, de la que no se pudo confirmar la licencia (ACOM-189). Es decorativo: se esconde a los lectores de pantalla.
import ManosQueSeEncuentran from "@/components/animation/ManosQueSeEncuentran.vue";
</script>

<template>
  <div class="pantalla-foto pantalla">
    <aside class="pantalla-foto__panel" aria-hidden="true" data-testid="panel-foto">
      <div class="pantalla-foto__marco">
        <div class="pantalla-foto__velo"></div>
        <ManosQueSeEncuentran class="pantalla-foto__manos" />
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

  /* El panel se queda a la vista aunque el formulario sea largo y haya que bajar */
  .pantalla-foto__marco {
    position: sticky;
    top: 0;
    height: 100%;
    max-height: 100vh;
    min-height: 420px;
    overflow: hidden;
  }

  /* Fondo de color del panel: terracota arriba (donde va el lema, para que el texto blanco se lea bien) y verde abajo */
  .pantalla-foto__velo {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      170deg,
      var(--color-accent-dark) 0%,
      var(--color-accent-dark) 42%,
      var(--color-secondary) 78%
    );
  }

  /* Las manos, centradas en el panel */
  .pantalla-foto__manos {
    position: absolute;
    left: 8%;
    right: 8%;
    top: 50%;
    width: 84%;
    transform: translateY(-40%);
  }

  .pantalla-foto__lema {
    position: absolute;
    left: 32px;
    right: 32px;
    /* Arriba, para que se vea siempre aunque el formulario sea largo y el panel llegue más abajo de la pantalla */
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
