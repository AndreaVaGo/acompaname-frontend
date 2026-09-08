<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import SolicitudRepository from "@/repositories/SolicitudRepository";
import ValoracionRepository from "@/repositories/ValoracionRepository";

const route = useRoute();
const router = useRouter();
const solicitudRepository = new SolicitudRepository();
const valoracionRepository = new ValoracionRepository();

const solicitudId = route.params.id;
const cuidadorNombre = ref("");
const puntuacion = ref(0);
const comentario = ref("");
const error = ref("");

onMounted(async () => {
  try {
    const solicitud = await solicitudRepository.getById(solicitudId);
    cuidadorNombre.value = solicitud.cuidadorNombre;
  } catch (err) {
    error.value = "No se pudo cargar la solicitud.";
  }
});

function seleccionarEstrella(valor) {
  puntuacion.value = valor;
}

async function enviarValoracion() {
  if (puntuacion.value === 0) return;
  try {
    await valoracionRepository.create({
      comentario: comentario.value,
      puntuacion: puntuacion.value,
      fecha: new Date().toISOString().split("T")[0],
      solicitudId: Number(solicitudId),
    });
    router.push({ name: "historial" });
  } catch (err) {
    error.value = "No se pudo enviar la valoración.";
  }
}
</script>

<template>
  <div class="valorar">
    <div class="valorar__box">
      <h1>Valorar a {{ cuidadorNombre }}</h1>
      <p class="valorar__subtitle">
        Tu opinión ayuda a otras familias a decidir.
      </p>

      <form class="valorar__form" @submit.prevent="enviarValoracion">
        <div class="valorar__estrellas">
          <span
            v-for="n in 5"
            :key="n"
            class="valorar__estrella"
            :class="{ 'valorar__estrella--active': n <= puntuacion }"
            @click="seleccionarEstrella(n)"
          >
            ⭐
          </span>
        </div>

        <label for="comentario">Comentario</label>
        <textarea
          id="comentario"
          v-model="comentario"
          placeholder="Cuéntanos cómo fue tu experiencia..."
        ></textarea>

        <p v-if="error" class="valorar__error">{{ error }}</p>

        <button
          type="submit"
          class="btn btn--primary"
          :disabled="puntuacion === 0"
        >
          Enviar valoración
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.valorar {
  min-height: 100vh;
  background-color: var(--color-bg);
  font-family: var(--font-base);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.valorar__box {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 32px;
  max-width: 420px;
  width: 100%;
  box-shadow: var(--shadow-card);
}

.valorar h1 {
  font-size: 1.4rem;
  margin-bottom: 8px;
}

.valorar__subtitle {
  color: var(--color-text-muted);
  margin-bottom: 20px;
}

.valorar__estrellas {
  display: flex;
  gap: 8px;
  font-size: 1.8rem;
  margin-bottom: 20px;
}

.valorar__estrella {
  cursor: pointer;
  filter: grayscale(100%);
  opacity: 0.4;

  &--active {
    filter: grayscale(0%);
    opacity: 1;
  }
}

.valorar__form {
  display: flex;
  flex-direction: column;

  & label {
    font-weight: bold;
    margin-bottom: 6px;
    font-size: 0.9rem;
  }

  & textarea {
    padding: 12px 14px;
    border-radius: var(--radius-input);
    border: 1px solid var(--color-border);
    margin-bottom: var(--gap-md);
    font-size: 1rem;
    font-family: inherit;
    min-height: 90px;
    resize: vertical;
  }

  & .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@media (max-width: 480px) {
  .valorar__box {
    padding: 24px;
  }
}
</style>
