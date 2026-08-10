<script setup>
import { useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";

const route = useRoute();
const cuidadorId = route.params.id;
const authStore = useAuthStore();

const cuidador = {
  nombre: "Lucía Ferrer",
  especialidad: "Auxiliar de enfermería geriátrica",
  experiencia: 8,
  tarifa: 14,
  disponibilidad: "Lunes a viernes, mañanas y noches",
  bio: "Acompaño a personas mayores en hospital y en casa desde hace 8 años. Me tomo el tiempo de conocer a cada familia y de explicarlo todo con calma.",
  valoracion: 4.7,
  resenas: [
    {
      familia: "Familia Serrano",
      puntuacion: 5,
      comentario:
        "Lucía cuidó a mi padre cuatro noches en el hospital. Nos llamaba cada mañana para contarnos cómo había pasado la noche. Un alivio enorme.",
      fecha: "8 de junio de 2026",
    },
    {
      familia: "Familia Peña",
      puntuacion: 5,
      comentario:
        "Muy cariñosa y puntual. Mi madre la esperaba con ganas cada día.",
      fecha: "19 de mayo de 2026",
    },
    {
      familia: "Familia Molins",
      puntuacion: 4,
      comentario:
        "Gran profesional. Solo tuvimos que ajustar los horarios al principio.",
      fecha: "30 de abril de 2026",
    },
  ],
};
</script>

<template>
  <div class="perfil">
    <a href="#" class="perfil__back">← Volver</a>

    <div class="perfil__main">
      <div class="perfil__info">
        <h1>{{ cuidador.nombre }}</h1>
        <p class="perfil__especialidad">{{ cuidador.especialidad }}</p>
        <p class="perfil__valoracion">
          ⭐ {{ cuidador.valoracion }} · {{ cuidador.resenas.length }} reseñas
        </p>

        <ul class="perfil__datos">
          <li><strong>Experiencia:</strong> {{ cuidador.experiencia }} años</li>
          <li>
            <strong>Disponibilidad:</strong> {{ cuidador.disponibilidad }}
          </li>
        </ul>

        <h2>Sobre mí</h2>
        <p class="perfil__bio">{{ cuidador.bio }}</p>
      </div>

      <div class="perfil__sidebar">
        <p class="perfil__precio">{{ cuidador.tarifa }} €<span>/hora</span></p>
        <p class="perfil__disponibilidad-corta">
          {{ cuidador.disponibilidad }}
        </p>
        <button
          v-if="authStore.rolActual === 'familia'"
          class="btn btn--primary perfil__solicitar">
          Solicitar servicio
        </button>
        <p class="perfil__nota">
          Sin compromiso: la solicitud se envía y el cuidador la acepta o la
          rechaza.
        </p>
      </div>
    </div>

    <div class="perfil__resenas">
      <h2>Reseñas recientes</h2>
      <div
        class="perfil__resena"
        v-for="(resena, index) in cuidador.resenas"
        :key="index"
      >
        <div class="perfil__resena-top">
          <strong>{{ resena.familia }}</strong>
          <span class="perfil__resena-fecha">{{ resena.fecha }}</span>
        </div>
        <p class="perfil__resena-estrellas">
          {{ "⭐".repeat(resena.puntuacion) }}
        </p>
        <p>{{ resena.comentario }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.perfil {
  min-height: 100vh;
  background-color: var(--color-bg);
  font-family: var(--font-base);
  color: var(--color-text);
  padding: var(--gap-lg) 60px;
  max-width: 1000px;
  margin: 0 auto;
}

.perfil__back {
  display: inline-block;
  margin-bottom: 20px;
  color: var(--color-text);
  text-decoration: none;
}

.perfil__main {
  display: flex;
  gap: var(--gap-md);
  margin-bottom: 24px;
}

.perfil__info {
  flex: 2;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 28px;
  box-shadow: var(--shadow-card);

  & h1 {
    margin-bottom: 4px;
  }

  & h2 {
    margin-top: 20px;
    margin-bottom: 8px;
    font-size: 1.1rem;
  }
}

.perfil__especialidad {
  color: var(--color-text-muted);
  margin-bottom: 8px;
}

.perfil__valoracion {
  margin-bottom: 16px;
}

.perfil__datos {
  list-style: none;
  padding: 0;
  margin: 0;

  & li {
    margin-bottom: 6px;
  }
}

.perfil__bio {
  color: #444;
  line-height: 1.5;
}

.perfil__sidebar {
  flex: 1;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 28px;
  box-shadow: var(--shadow-card);
  height: fit-content;
}

.perfil__precio {
  font-size: 1.6rem;
  font-weight: bold;
  margin: 0;

  & span {
    font-size: 1rem;
    font-weight: normal;
    color: var(--color-text-muted);
  }
}

.perfil__disponibilidad-corta {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.perfil__solicitar {
  width: 100%;
  margin-bottom: 12px;
}

.perfil__nota {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.perfil__resenas {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 28px;
  box-shadow: var(--shadow-card);

  & h2 {
    margin-bottom: 16px;
  }
}

.perfil__resena {
  background-color: var(--color-bg);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.perfil__resena-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.perfil__resena-fecha {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.perfil__resena-estrellas {
  margin: 0 0 6px;
}

@media (max-width: 768px) {
  .perfil {
    padding: 24px 20px;
  }

  .perfil__main {
    flex-direction: column;
  }

  .perfil__info,
  .perfil__sidebar {
    padding: 20px;
  }
}
</style>
