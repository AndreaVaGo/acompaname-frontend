<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "../../stores/auth";
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
        <div class="perfil__cabecera">
          <span class="perfil__avatar">{{
            cuidador.usuarioNombre.charAt(0).toUpperCase()
          }}</span>
          <div>
            <h1>{{ cuidador.usuarioNombre }}</h1>
            <span class="perfil__tag">{{ cuidador.especialidad }}</span>
          </div>
        </div>

        <ul class="perfil__datos">
          <li>
            <strong>Experiencia:</strong> {{ cuidador.anosExperiencia }} años
          </li>
          <li>
            <span
              class="perfil__badge"
              :class="{ 'perfil__badge--activo': cuidador.disponibleAhora }"
            ></span>
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
        <RouterLink
          v-if="authStore.rol === 'FAMILIA'"
          :to="`/solicitar/${cuidadorId}`"
          class="btn btn--primary perfil__solicitar"
        >
          Solicitar servicio
        </RouterLink>
        <RouterLink
          v-if="!authStore.estaAutenticado"
          to="/login"
          class="btn btn--primary perfil__solicitar"
        >
          Inicia sesión para solicitar
        </RouterLink>
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
  background-color: var(--color-bg);
  font-family: var(--font-base);
  color: var(--color-text);
  padding: var(--gap-lg) 60px 60px;
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
  align-items: flex-start;
  gap: var(--gap-md);
  margin-bottom: 24px;
}

.perfil__info {
  flex: 2;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 28px;
  box-shadow: var(--shadow-card);

  & h2 {
    margin-top: 20px;
    margin-bottom: 8px;
    font-size: 1.1rem;
  }
}

.perfil__cabecera {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;

  & h1 {
    margin: 0 0 6px;
  }
}

.perfil__avatar {
  background-color: var(--color-accent-bg);
  color: var(--color-accent);
  width: 64px;
  height: 64px;
  min-width: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.6rem;
}

.perfil__tag {
  display: inline-block;
  background-color: var(--color-accent-bg);
  color: var(--color-accent);
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.85rem;
  font-weight: bold;
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
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.perfil__badge {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #999;
  display: inline-block;
}

.perfil__badge--activo {
  background-color: var(--color-secondary);
}

.perfil__bio {
  color: #444;
  line-height: 1.5;
  font-style: italic;
  border-left: 3px solid var(--color-accent-bg);
  padding-left: 14px;
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
  display: block;
  text-align: center;
  text-decoration: none;
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