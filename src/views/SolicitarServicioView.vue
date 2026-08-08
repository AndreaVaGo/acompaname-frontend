<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const cuidadorNombre = 'Lucía Ferrer'

const tipoCuidado = ref('')
const fechaInicio = ref('')
const nombrePaciente = ref('')
const edadPaciente = ref('')
const notas = ref('')

function enviarSolicitud() {
  router.push({ name: 'confirmacion' })
}
</script>

<template>
  <div class="solicitar">
    <a href="#" class="solicitar__back">← Volver al perfil</a>

    <div class="solicitar__box">
      <h1>Solicitar a {{ cuidadorNombre }}</h1>
      <p class="solicitar__subtitle">
        Cinco datos y listo. Puedes cambiarlos después hablando con el cuidador.
      </p>

      <form class="solicitar__form" @submit.prevent="enviarSolicitud">
        <label>Tipo de cuidado</label>
        <div class="solicitar__opciones">
          <button
            type="button"
            class="solicitar__opcion"
            :class="{ 'solicitar__opcion--active': tipoCuidado === 'hospitalario' }"
            @click="tipoCuidado = 'hospitalario'"
          >
            Hospitalario
          </button>
          <button
            type="button"
            class="solicitar__opcion"
            :class="{ 'solicitar__opcion--active': tipoCuidado === 'domicilio' }"
            @click="tipoCuidado = 'domicilio'"
          >
            A domicilio
          </button>
        </div>

        <label for="fecha">Fecha de inicio</label>
        <input type="date" id="fecha" v-model="fechaInicio" />

        <label for="paciente">Nombre del paciente</label>
        <input type="text" id="paciente" v-model="nombrePaciente" placeholder="Antonio Serrano" />

        <label for="edad">Edad del paciente</label>
        <input type="number" id="edad" v-model="edadPaciente" placeholder="81" />

        <label for="notas">Información sobre el paciente</label>
        <textarea
          id="notas"
          v-model="notas"
          placeholder="Horario de medicación, alergias, rutinas diarias, movilidad, cualquier detalle que el cuidador deba conocer..."
        ></textarea>

        <button type="submit" class="btn btn--primary">Enviar solicitud</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.solicitar {
  min-height: 100vh;
  background-color: var(--color-bg);
  font-family: var(--font-base);
  color: var(--color-text);
  padding: var(--gap-lg) 60px;
  max-width: 600px;
  margin: 0 auto;
}

.solicitar__back {
  display: inline-block;
  margin-bottom: 20px;
  color: var(--color-text);
  text-decoration: none;
}

.solicitar__box {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 32px;
  box-shadow: var(--shadow-card);
}

.solicitar h1 {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.solicitar__subtitle {
  color: var(--color-text-muted);
  margin-bottom: 24px;
}

.solicitar__form {
  display: flex;
  flex-direction: column;

  & label {
    font-weight: bold;
    margin-bottom: 6px;
    font-size: 0.9rem;
  }

  & input,
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

.solicitar__opciones {
  display: flex;
  gap: var(--gap-sm);
  margin-bottom: var(--gap-md);
}

.solicitar__opcion {
  flex: 1;
  padding: 10px;
  border-radius: var(--radius-input);
  border: 1px solid var(--color-border);
  background-color: var(--color-white);
  cursor: pointer;
  font-family: inherit;

  &--active {
    border-color: var(--color-accent);
    background-color: var(--color-accent-bg);
    font-weight: bold;
  }
}
</style>