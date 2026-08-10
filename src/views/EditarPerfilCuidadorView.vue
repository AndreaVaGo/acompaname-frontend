<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";

const nombre = ref("Lucía Ferrer");
const especialidad = ref("Auxiliar de enfermería geriátrica");
const experiencia = ref(8);
const tarifa = ref(14);
const tipoCuidado = ref("ambos");
const disponibilidad = ref("Lunes a viernes, mañanas y noches");
const disponibleAhora = ref(true);
const tieneVehiculo = ref(true);
const bio = ref(
  "Acompaño a personas mayores en hospital y en casa desde hace 8 años. Me tomo el tiempo de conocer a cada familia y de explicarlo todo con calma.",
);
const error = ref("");
const guardado = ref(false);

function guardarCambios() {
  if (!nombre.value || !especialidad.value || !disponibilidad.value) {
    error.value = "Por favor, rellena todos los campos obligatorios.";
    guardado.value = false;
    return;
  }
  error.value = "";
  guardado.value = true;
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

        <label for="nombre">Nombre completo</label>
        <input type="text" id="nombre" v-model="nombre" />

        <label for="especialidad">Especialidad</label>
        <input type="text" id="especialidad" v-model="especialidad" />

        <div class="editar-perfil__row">
          <div>
            <label for="experiencia">Años de experiencia</label>
            <input type="number" id="experiencia" v-model="experiencia" />
          </div>
          <div>
            <label for="tarifa">Tarifa por hora (€)</label>
            <input type="number" id="tarifa" v-model="tarifa" />
          </div>
        </div>

        <label>Tipo de cuidado que ofrezco</label>
        <div class="editar-perfil__opciones">
          <button
            type="button"
            class="editar-perfil__opcion"
            :class="{
              'editar-perfil__opcion--active': tipoCuidado === 'hospitalario',
            }"
            @click="tipoCuidado = 'hospitalario'"
          >
            Hospitalario
          </button>
          <button
            type="button"
            class="editar-perfil__opcion"
            :class="{
              'editar-perfil__opcion--active': tipoCuidado === 'domicilio',
            }"
            @click="tipoCuidado = 'domicilio'"
          >
            A domicilio
          </button>
          <button
            type="button"
            class="editar-perfil__opcion"
            :class="{
              'editar-perfil__opcion--active': tipoCuidado === 'ambos',
            }"
            @click="tipoCuidado = 'ambos'"
          >
            Hospital y domicilio
          </button>
        </div>

        <label for="disponibilidad">Disponibilidad</label>
        <input type="text" id="disponibilidad" v-model="disponibilidad" />

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
        <p v-if="guardado" class="editar-perfil__guardado">Cambios guardados ✓</p>

        <button type="submit" class="btn btn--primary">Guardar cambios</button>
      </form>

      <aside class="editar-perfil__sidebar">
        <h2>Tu valoración</h2>
        <p class="editar-perfil__valoracion">⭐ 4.7</p>
        <p class="editar-perfil__resenas">3 reseñas recibidas</p>
        <RouterLink to="/cuidador/1" class="btn btn--secondary">Ver mi perfil público</RouterLink>
      </aside>
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
