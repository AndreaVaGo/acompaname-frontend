<script setup>
import { ref, computed } from "vue";
import { RouterLink } from "vue-router";
import SugerenciaRepository from "@/repositories/SugerenciaRepository";
import { mensajeDeError } from "@/utils/mensajeDeError";

const sugerenciaRepository = new SugerenciaRepository();

// Lo mismo que acepta el servidor: hasta 1000 caracteres
const MAXIMO = 1000;

const texto = ref("");
const enviando = ref(false);
const enviada = ref(false);
const error = ref("");

// El botón solo se puede pulsar si hay algo escrito (aparte de espacios) y no se está enviando
const puedeEnviar = computed(() => texto.value.trim() !== "" && !enviando.value);

async function enviarSugerencia() {
  if (!puedeEnviar.value) {
    return;
  }
  error.value = "";
  enviada.value = false;
  enviando.value = true;
  try {
    await sugerenciaRepository.create(texto.value.trim());
    enviada.value = true;
    texto.value = "";
  } catch (err) {
    error.value = mensajeDeError(err, "No se pudo enviar la sugerencia.");
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <div class="sugerencia pantalla">
    <div class="sugerencia__wrapper">
      <h1>Enviar una sugerencia</h1>
      <p class="sugerencia__subtitle">
        Cuéntanos qué cambiarías o qué te gustaría encontrar en Acompáñame.
      </p>

      <div class="sugerencia__box tarjeta-cristal">
        <div class="sugerencia__cabecera">
          <span class="sugerencia__icono">💡</span>
          <span class="sugerencia__aviso">
            Leemos todas las sugerencias para mejorar la web.
          </span>
        </div>

        <form class="formulario sugerencia__form" @submit.prevent="enviarSugerencia">
          <h2 class="titulo-seccion" data-icono="📝">Tu sugerencia</h2>

          <label for="sugerencia">Sugerencia</label>
          <textarea
            id="sugerencia"
            v-model="texto"
            :maxlength="MAXIMO"
            placeholder="Escribe aquí tu idea o el cambio que propones..."
          ></textarea>
          <p class="sugerencia__contador">{{ texto.length }}/{{ MAXIMO }}</p>

          <p v-if="enviada" class="sugerencia__ok" role="status">
            ¡Gracias! Hemos recibido tu sugerencia.
          </p>
          <p v-if="error" class="sugerencia__error" role="alert">{{ error }}</p>

          <button type="submit" class="btn btn--primary" :disabled="!puedeEnviar">
            Enviar sugerencia
          </button>
          <RouterLink to="/" class="sugerencia__volver">Volver al inicio</RouterLink>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sugerencia {
  min-height: 100vh;
  font-family: var(--font-base);
  color: var(--color-text);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 24px 20px 32px;
}

.sugerencia__wrapper {
  max-width: 520px;
  width: 100%;
}

.sugerencia h1 {
  font-size: 1.8rem;
  margin: 0 0 6px;
}

.sugerencia__subtitle {
  font-size: 1.05rem;
  margin: 0 0 24px;
}

/* El cristal, la sombra y la entrada vienen de la clase global tarjeta-cristal */
.sugerencia__box {
  --borde-tarjeta: var(--color-accent);
  padding: 0;
}

/* Dentro hay un formulario: la tarjeta no se levanta ni brilla al pasar el ratón */
.sugerencia__box:hover {
  transform: none;
  box-shadow: var(--shadow-card);
}

.sugerencia__box::after {
  display: none;
}

/* Franja de color con un icono y un aviso corto */
.sugerencia__cabecera {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background:
    radial-gradient(circle at 10% 20%, rgba(242, 137, 107, 0.35), transparent 60%),
    radial-gradient(circle at 90% 80%, rgba(46, 125, 91, 0.25), transparent 60%),
    var(--color-accent-bg);
}

.sugerencia__icono {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--color-white);
  font-size: 1.8rem;
}

.sugerencia__aviso {
  font-weight: bold;
}

/* Etiquetas, campos y títulos de sección vienen de base.css (clases "formulario" y "titulo-seccion") */
.sugerencia__form {
  padding: 28px 32px 32px;

  & .titulo-seccion:first-child {
    margin-top: 0;
  }

  & textarea {
    min-height: 160px;
    resize: vertical;
  }

  & .btn {
    padding: 14px;
  }

  & .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.sugerencia__contador {
  margin: 4px 0 16px;
  text-align: right;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.sugerencia__ok {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
  font-size: 0.9rem;
  font-weight: bold;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: 0 0 16px;
}

.sugerencia__error {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: 0 0 16px;
}

.sugerencia__volver {
  display: block;
  margin-top: 16px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .sugerencia {
    padding: 16px 16px 24px;
  }

  .sugerencia__cabecera {
    padding: 20px;
  }

  .sugerencia__form {
    padding: 24px 20px 28px;
  }
}
</style>
