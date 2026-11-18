<script setup>
import { GRUPOS } from "@/utils/catalogoGrupos";

// Palabras que se deslizan: dónde se cuida y a quién (los grupos salen del catálogo)
const dondes = ["En el hospital", "En casa"];
const elementos = [];
for (const donde of dondes) {
  elementos.push(donde);
}
for (const grupo of GRUPOS) {
  elementos.push(grupo.nombre);
}
</script>

<template>
  <section class="cinta" aria-label="Cuidado en el hospital o en casa, para cualquier edad">
    <div class="cinta__pista">
      <ul class="cinta__lista">
        <li v-for="elemento in elementos" :key="elemento" class="cinta__item">
          {{ elemento }}
        </li>
      </ul>
      <!-- Segunda copia para que el bucle no tenga saltos. Los lectores de pantalla no la leen -->
      <ul class="cinta__lista" aria-hidden="true">
        <li v-for="elemento in elementos" :key="elemento" class="cinta__item">
          {{ elemento }}
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.cinta {
  overflow: hidden;
  padding: 18px 0;
  border-block: 1px solid var(--color-secondary-bg);
  /* Los bordes se difuminan para que las palabras entren y salgan suavemente */
  mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
}

.cinta__pista {
  display: flex;
  width: max-content;
  animation: cinta 40s linear infinite;
}

/* Al pasar el ratón o llegar con el teclado, la cinta se para para poder leerla */
.cinta:hover .cinta__pista,
.cinta:focus-within .cinta__pista {
  animation-play-state: paused;
}

.cinta__lista {
  display: flex;
  gap: 40px;
  margin: 0;
  padding: 0 20px;
  list-style: none;
}

.cinta__item {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--color-text);
  white-space: nowrap;
}

/* Un punto coral entre cada palabra */
.cinta__item::after {
  content: "•";
  margin-left: 40px;
  color: var(--color-accent);
}

/* La pista tiene dos copias iguales: al llegar a la mitad vuelve al principio sin que se note */
@keyframes cinta {
  to {
    transform: translateX(-50%);
  }
}

/* Con "reducir movimiento" la cinta no se mueve: se ve quieta, con las palabras en varias líneas */
@media (prefers-reduced-motion: reduce) {
  .cinta {
    mask-image: none;
  }

  .cinta__pista {
    width: auto;
    animation: none;
    justify-content: center;
  }

  .cinta__lista {
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px 28px;
  }

  .cinta__lista[aria-hidden="true"] {
    display: none;
  }

  .cinta__item::after {
    margin-left: 28px;
  }
}
</style>
