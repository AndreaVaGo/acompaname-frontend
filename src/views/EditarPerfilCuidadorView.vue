<script setup>
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import CuidadorRepository from "@/repositories/CuidadorRepository";
import { useAuthStore } from "@/stores/auth";

const cuidadorRepository = new CuidadorRepository();
const authStore = useAuthStore();

const perfilId = ref(null);
const especialidad = ref("");
const anosExperiencia = ref(0);
const tarifaHora = ref(0);
const disponibleAhora = ref(true);
const tieneVehiculo = ref(true);
const bio = ref("");
const error = ref("");
const guardado = ref(false);
const cargando = ref(true);

onMounted(async () => {
  try {
    const perfil = await cuidadorRepository.getMiPerfil();
    perfilId.value = perfil.id;
    especialidad.value = perfil.especialidad;
    anosExperiencia.value = perfil.anosExperiencia;
    tarifaHora.value = perfil.tarifaHora;
    disponibleAhora.value = perfil.disponibleAhora;
    tieneVehiculo.value = perfil.tieneVehiculo;
    bio.value = perfil.bio;
  } catch (err) {
    error.value = "No se pudo cargar tu perfil.";
  } finally {
    cargando.value = false;
  }
});

async function guardarCambios() {
  if (!especialidad.value || !bio.value) {
    error.value = "Por favor, rellena todos los campos obligatorios.";
    guardado.value = false;
    return;
  }
  error.value = "";

  try {
    await cuidadorRepository.update(perfilId.value, {
      especialidad: especialidad.value,
      anosExperiencia: Number(anosExperiencia.value),
      tarifaHora: Number(tarifaHora.value),
      bio: bio.value,
      tieneVehiculo: tieneVehiculo.value,
      disponibleAhora: disponibleAhora.value,
      usuarioId: authStore.id,
    });
    guardado.value = true;
  } catch (err) {
    error.value = "No se pudieron guardar los cambios.";
    guardado.value = false;
  }
}
</script>

<template>
  <div class="editar-perfil">
    <div class="editar-perfil__grid">
      <form class="editar-perfil__form" @submit.prevent="guardarCambios">
        <h1>Editar mi perfil</h1>
        <p class="editar-perfil__subtitle">
          Así es como te ven las familias cuando buscan cuidador.
        </p>

        <label for="especialidad">Especialidad</label>
        <input type="text" id="especialidad" v-model="especialidad" />

        <div class="editar-perfil__row">
          <div>
            <label for="experiencia">Años de experiencia</label>
            <input type="number" id="experiencia" v-model="anosExperiencia" />
          </div>
          <div>
            <label for="tarifa">Tarifa por hora (€)</label>
            <input type="number" id="tarifa" v-model="tarifaHora" />
          </div>
        </div>

        <label class="editar-perfil__checkbox">
          <input type="checkbox" v-model="disponibleAhora" />
          Estoy disponible ahora mismo
        </label>

        <label class="editar-perfil__checkbox">
          <input type="checkbox" v-model="tieneVehiculo" />
          Tengo vehículo propio
        </label>

        <label for="bio">Sobre mí</label>
        <textarea id="bio" v-model="bio"></textarea>

        <p v-if="error" class="editar-perfil__error">{{ error }}</p>
        <p v-if="guardado" class="editar-perfil__guardado">
          Cambios guardados ✓
        </p>

        <button type="submit" class="btn btn--primary">Guardar cambios</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.editar-perfil {
  min-height: 100vh;
  background-color: var(--color-bg);
  font-family: var(--font-base);
  color: var(--color-text);
  padding: var(--gap-lg) 60px;
  max-width: 1000px;
  margin: 0 auto;
}

.editar-perfil__grid {
  display: flex;
  gap: var(--gap-md);
  align-items: flex-start;
}

.editar-perfil__form {
  flex: 2;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 32px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;

  & h1 {
    font-size: 1.5rem;
    margin-bottom: 4px;
  }

  & label {
    font-weight: bold;
    margin-bottom: 6px;
    font-size: 0.9rem;
  }

  & input[type="text"],
  & input[type="number"],
  & textarea {
    padding: 12px 14px;
    border-radius: var(--radius-input);
    border: 1px solid var(--color-border);
    margin-bottom: var(--gap-md);
    font-size: 1rem;
    font-family: inherit;
  }

  & textarea {
    min-height: 90px;
    resize: vertical;
  }
}

.editar-perfil__subtitle {
  color: var(--color-text-muted);
  margin-bottom: 20px;
}

.editar-perfil__row {
  display: flex;
  gap: var(--gap-sm);

  & > div {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

.editar-perfil__opciones {
  display: flex;
  gap: var(--gap-sm);
  margin-bottom: var(--gap-md);
}

.editar-perfil__opcion {
  flex: 1;
  padding: 10px;
  border-radius: var(--radius-input);
  border: 1px solid var(--color-border);
  background-color: var(--color-white);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.85rem;

  &--active {
    border-color: var(--color-accent);
    background-color: var(--color-accent-bg);
    font-weight: bold;
  }
}

.editar-perfil__checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: normal;
  margin-bottom: var(--gap-sm);

  & input {
    width: auto;
    margin: 0;
  }
}

.editar-perfil__error {
  background-color: #fdecea;
  border: 1px solid #f5c6c0;
  color: #c0392b;
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: -4px 0 16px;
}

.editar-perfil__guardado {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: -4px 0 16px;
  font-weight: bold;
}

.editar-perfil__sidebar {
  flex: 1;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
  text-align: center;

  & h2 {
    font-size: 1rem;
    margin-bottom: 12px;
  }
}

.editar-perfil__valoracion {
  font-size: 1.4rem;
  margin: 0;
}

.editar-perfil__resenas {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .editar-perfil {
    padding: 24px 20px;
  }

  .editar-perfil__grid {
    flex-direction: column;
  }

  .editar-perfil__row {
    flex-direction: column;
  }
}
</style>
