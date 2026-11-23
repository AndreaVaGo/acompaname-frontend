<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import SolicitudRepository from "@/repositories/SolicitudRepository";
import ValoracionRepository from "@/repositories/ValoracionRepository";
import { mensajeDeError } from "@/utils/mensajeDeError";

const route = useRoute();
const router = useRouter();
const solicitudRepository = new SolicitudRepository();
const valoracionRepository = new ValoracionRepository();

const solicitudId = route.params.id;
const cuidadorNombre = ref("");
const puntuacion = ref(0);
const comentario = ref("");
const error = ref("");

// Texto que se muestra debajo de las estrellas según la puntuación elegida
const textosPuntuacion = ["Muy mala", "Mala", "Normal", "Buena", "Excelente"];

onMounted(async () => {
  try {
    const solicitud = await solicitudRepository.getById(solicitudId);
    cuidadorNombre.value = solicitud.cuidadorNombre;
  } catch (err) {
    error.value = mensajeDeError(err, "No se pudo cargar la solicitud.");
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
      solicitudId: Number(solicitudId),
    });
    router.push({ name: "historial" });
  } catch (err) {
    error.value = mensajeDeError(err, "No se pudo enviar la valoración.");
  }
}
</script>

<template>
  <div class="valorar pantalla">
    <div class="valorar__wrapper">
      <h1>Valorar a {{ cuidadorNombre }}</h1>
      <p class="valorar__subtitle">
        Tu opinión ayuda a otras familias a decidir.
      </p>

      <div class="valorar__box tarjeta-cristal">
        <div class="valorar__cabecera">
          <span class="valorar__icono">💬</span>
          <span class="valorar__aviso">
            Cuéntanos cómo fue la experiencia con la persona cuidadora.
          </span>
        </div>

        <form class="formulario valorar__form" @submit.prevent="enviarValoracion">
          <p class="formulario__nota">Los campos marcados con <span aria-hidden="true">*</span> son obligatorios.</p>
          <h2 class="titulo-seccion obligatorio" data-icono="⭐">Tu puntuación</h2>

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
          <p class="valorar__texto">
            {{
              puntuacion === 0
                ? "Elige de 1 a 5 estrellas"
                : textosPuntuacion[puntuacion - 1]
            }}
          </p>

          <h2 class="titulo-seccion" data-icono="📝">Tu comentario</h2>

          <label for="comentario">Comentario</label>
          <textarea
            id="comentario"
            v-model="comentario"
            placeholder="Cuéntanos cómo fue tu experiencia..."
          ></textarea>

          <p role="alert" v-if="error" class="valorar__error">{{ error }}</p>

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
  </div>
</template>

<style scoped>
.valorar {
  min-height: 100vh;
  font-family: var(--font-base);
  color: var(--color-text);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 24px 20px 32px;
}

.valorar__wrapper {
  max-width: 520px;
  width: 100%;
}

.valorar h1 {
  font-size: 1.8rem;
  margin: 0 0 6px;
}

.valorar__subtitle {
  color: var(--color-text);
  font-size: 1.05rem;
  margin: 0 0 24px;
}

/* El cristal, la sombra y la entrada vienen de la clase global tarjeta-cristal */
.valorar__box {
  --borde-tarjeta: var(--color-accent);
  padding: 0;
}

/* Franja de color con un icono y un aviso corto */
.valorar__cabecera {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background:
    radial-gradient(circle at 10% 20%, rgba(242, 137, 107, 0.35), transparent 60%),
    radial-gradient(circle at 90% 80%, rgba(46, 125, 91, 0.25), transparent 60%),
    var(--color-accent-bg);
}

.valorar__icono {
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

.valorar__aviso {
  font-weight: bold;
}

/* Etiquetas, campos y títulos de sección vienen de base.css (clases "formulario" y "titulo-seccion") */
.valorar__form {
  padding: 28px 32px 32px;

  & .titulo-seccion:first-child {
    margin-top: 0;
  }

  & .btn {
    padding: 14px;
  }

  & .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.valorar__estrellas {
  display: flex;
  gap: 8px;
  font-size: 2.2rem;
}

.valorar__estrella {
  cursor: pointer;
  filter: grayscale(100%);
  opacity: 0.4;
  transition:
    transform var(--dur-fast) var(--ease-out),
    opacity var(--dur-fast) var(--ease-out),
    filter var(--dur-fast) var(--ease-out);
}

.valorar__estrella--active {
  filter: grayscale(0%);
  opacity: 1;
}

.valorar__texto {
  color: var(--color-text-muted);
  font-weight: bold;
  margin: 8px 0 12px;
}

.valorar__error {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: -4px 0 16px;
}

@media (hover: hover) {
  .valorar__estrella:hover {
    opacity: 1;
    transform: scale(1.25) rotate(-8deg);
  }
}

@media (max-width: 768px) {
  .valorar {
    padding: 16px 16px 24px;
  }

  .valorar__cabecera {
    padding: 20px;
  }

  .valorar__form {
    padding: 24px 20px 28px;
  }
}
</style>