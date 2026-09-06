<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { RouterLink } from "vue-router";
import CuidadorRepository from "@/repositories/CuidadorRepository";

const route = useRoute();
const cuidadorId = route.params.id;
const authStore = useAuthStore();
const cuidadorRepository = new CuidadorRepository();

const cuidador = ref(null);
const cargando = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    cuidador.value = await cuidadorRepository.getById(cuidadorId);
  } catch (err) {
    error.value = "No se pudo cargar el perfil del cuidador.";
  } finally {
    cargando.value = false;
  }
});
</script>

<template>
  <div class="perfil" v-if="cuidador">
    <RouterLink to="/buscar" class="perfil__back">← Volver</RouterLink>

    <div class="perfil__main">
      <div class="perfil__info">
        <h1>{{ cuidador.usuarioNombre }}</h1>
        <p class="perfil__especialidad">{{ cuidador.especialidad }}</p>

        <ul class="perfil__datos">
          <li>
            <strong>Experiencia:</strong> {{ cuidador.anosExperiencia }} años
          </li>
          <li>
            <strong>Disponibilidad:</strong>
            {{
              cuidador.disponibleAhora
                ? "Disponible ahora"
                : "No disponible ahora"
            }}
          </li>
        </ul>

        <h2>Sobre mí</h2>
        <p class="perfil__bio">{{ cuidador.bio }}</p>
      </div>

      <div class="perfil__sidebar">
        <p class="perfil__precio">
          {{ cuidador.tarifaHora }} €<span>/hora</span>
        </p>
        <button
          v-if="authStore.rol === 'FAMILIA'"
          class="btn btn--primary perfil__solicitar"
        >
          Solicitar servicio
        </button>
        <p class="perfil__nota">
          Sin compromiso: la solicitud se envía y el cuidador la acepta o la
          rechaza.
        </p>
      </div>
    </div>
  </div>
  <p v-else-if="error">{{ error }}</p>
  <p v-else>Cargando...</p>
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
