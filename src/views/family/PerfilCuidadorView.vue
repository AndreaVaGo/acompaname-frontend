<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { RouterLink } from "vue-router";
import CuidadorRepository from "@/repositories/CuidadorRepository";
import ValoracionRepository from "@/repositories/ValoracionRepository";
import FotoCuidador from "@/components/FotoCuidador.vue";
import { nombreCuidado } from "@/utils/catalogoCuidados";
import { formatearFecha } from "@/utils/formatearFecha";

const route = useRoute();
const cuidadorId = route.params.id;
const authStore = useAuthStore();
const cuidadorRepository = new CuidadorRepository();
const valoracionRepository = new ValoracionRepository();

const cuidador = ref(null);
const cargando = ref(true);
const error = ref("");

const valoraciones = ref([]);
const mostrarValoraciones = ref(false);
const cargandoValoraciones = ref(false);
const errorValoraciones = ref("");

onMounted(async () => {
  try {
    cuidador.value = await cuidadorRepository.getById(cuidadorId);
    // Si llegan desde el enlace de las tarjetas (?valoraciones=1), se abre la lista
    if (route.query.valoraciones) {
      abrirValoraciones();
    }
  } catch (err) {
    error.value = "No se pudo cargar el perfil del cuidador.";
  } finally {
    cargando.value = false;
  }
});

async function abrirValoraciones() {
  mostrarValoraciones.value = true;
  cargandoValoraciones.value = true;
  errorValoraciones.value = "";
  try {
    valoraciones.value = await valoracionRepository.getPorCuidador(cuidadorId);
  } catch (err) {
    errorValoraciones.value = "No se pudieron cargar las valoraciones.";
  } finally {
    cargandoValoraciones.value = false;
  }
}

function cerrarValoraciones() {
  mostrarValoraciones.value = false;
}

function estrellas(puntuacion) {
  return "⭐".repeat(puntuacion);
}
</script>

<template>
  <div class="perfil" v-if="cuidador">
    <RouterLink to="/buscar" class="perfil__back">← Volver</RouterLink>

    <div class="perfil__main">
      <div
        class="perfil__info"
        :class="
          cuidador.disponibleAhora
            ? 'perfil__info--disponible'
            : 'perfil__info--ocupado'
        "
      >
        <div class="perfil__cabecera">
          <FotoCuidador
            :foto="cuidador.foto"
            :nombre="cuidador.usuarioNombre"
            :tamano="96"
          />
          <div>
            <h1>{{ cuidador.usuarioNombre }}</h1>
            <span class="perfil__tag">{{ cuidador.especialidad }}</span>
            <p v-if="cuidador.ciudad" class="perfil__ciudad">
              📍 {{ cuidador.ciudad }}
            </p>
          </div>
        </div>

        <p class="perfil__valoracion">
          <template v-if="cuidador.valoracionMedia">
            <button
              type="button"
              class="perfil__valoracion-boton"
              @click="abrirValoraciones"
            >
              <span>⭐</span>
              <span class="perfil__valoracion-texto"
                >{{ cuidador.valoracionMedia }} ({{ cuidador.numValoraciones }}
                {{
                  cuidador.numValoraciones === 1 ? "valoración" : "valoraciones"
                }})</span
              >
            </button>
          </template>
          <template v-else>Sin valoraciones todavía</template>
        </p>

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

        <div
          class="perfil__servicios"
          v-if="cuidador.servicios && cuidador.servicios.length > 0"
        >
          <h2>Servicios</h2>
          <div class="perfil__servicios-lista">
            <span
              class="perfil__servicio"
              v-for="codigo in cuidador.servicios"
              :key="codigo"
            >
              {{ nombreCuidado(codigo) }}
            </span>
          </div>
        </div>

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

    <div
      class="perfil__fondo"
      v-if="mostrarValoraciones"
      @click.self="cerrarValoraciones"
    >
      <div class="perfil__modal">
        <button
          type="button"
          class="perfil__cerrar"
          aria-label="Cerrar"
          @click="cerrarValoraciones"
        >
          ✕
        </button>
        <h2>Valoraciones de {{ cuidador.usuarioNombre }}</h2>

        <p v-if="cargandoValoraciones">Cargando valoraciones...</p>
        <p v-else-if="errorValoraciones" class="perfil__error">
          {{ errorValoraciones }}
        </p>
        <p v-else-if="valoraciones.length === 0">
          Todavía no hay valoraciones.
        </p>
        <div v-else class="perfil__resenas">
          <article
            class="perfil__resena"
            v-for="(valoracion, indice) in valoraciones"
            :key="indice"
          >
            <div class="perfil__resena-top">
              <span class="perfil__resena-estrellas">{{
                estrellas(valoracion.puntuacion)
              }}</span>
              <span class="perfil__resena-fecha">{{
                formatearFecha(valoracion.fecha)
              }}</span>
            </div>
            <p
              class="perfil__resena-comentario"
              v-if="valoracion.comentario"
            >
              {{ valoracion.comentario }}
            </p>
          </article>
        </div>

        <button
          type="button"
          class="btn btn--secondary"
          @click="cerrarValoraciones"
        >
          Cerrar
        </button>
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
  border-top: 4px solid var(--color-border);
  padding: 28px;
  box-shadow: var(--shadow-card);
  overflow: hidden;

  & h2 {
    margin-top: 24px;
    margin-bottom: 10px;
    font-size: 1.1rem;
  }
}

/* La línea de arriba indica la disponibilidad: verde si está disponible, roja si no */
.perfil__info--disponible {
  border-top-color: var(--color-secondary);
}

.perfil__info--ocupado {
  border-top-color: var(--color-error);
}

/* Franja de color con la foto y el nombre, hasta los bordes de la tarjeta */
.perfil__cabecera {
  display: flex;
  align-items: center;
  gap: 20px;
  margin: -28px -28px 20px;
  padding: 28px;
  background-color: var(--color-accent-bg);

  & h1 {
    margin: 0 0 8px;
    font-size: 2rem;
  }
}

.perfil__ciudad {
  color: var(--color-text-muted);
  margin: 8px 0 0;
}

.perfil__tag {
  display: inline-block;
  background-color: var(--color-white);
  color: var(--color-accent-dark);
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.85rem;
  font-weight: bold;
}

.perfil__valoracion {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 20px;
}

.perfil__valoracion-boton {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: var(--color-accent);
  text-decoration: none;
  cursor: pointer;
}

/* Solo el texto va subrayado, la estrella no */
.perfil__valoracion-texto {
  text-decoration: underline;
}

.perfil__datos {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  /* Cada dato va en su propio recuadro, uno debajo de otro */
  & li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 16px;
    background-color: var(--color-bg);
    border-radius: var(--radius-input);
  }

  & strong {
    white-space: nowrap;
  }
}

.perfil__badge {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--color-error);
  display: inline-block;
}

.perfil__badge--activo {
  background-color: var(--color-secondary);
}

.perfil__servicios-lista {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.perfil__servicio {
  background-color: var(--color-accent-bg);
  color: var(--color-accent-dark);
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  font-size: 0.85rem;
}

/* Las etiquetas alternan coral, verde y azul, igual que en las solicitudes */
.perfil__servicio:nth-child(3n + 2) {
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
}

.perfil__servicio:nth-child(3n + 3) {
  background-color: var(--color-info-bg);
  color: var(--color-info);
}

.perfil__bio {
  color: var(--color-text);
  line-height: 1.6;
  font-style: italic;
  background-color: var(--color-bg);
  border-left: 4px solid var(--color-accent);
  border-radius: var(--radius-input);
  padding: 14px 16px;
}

.perfil__sidebar {
  flex: 1;
  position: sticky;
  top: 20px;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  border-top: 4px solid var(--color-accent);
  padding: 28px;
  box-shadow: var(--shadow-card);
  height: fit-content;
}

.perfil__precio {
  font-size: 2.2rem;
  font-weight: bold;
  margin: 0 0 16px;

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

/* Ventana con la lista de valoraciones */
.perfil__fondo {
  position: fixed;
  inset: 0;
  background-color: var(--color-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 100;
}

.perfil__modal {
  position: relative;
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 28px;
  box-shadow: var(--shadow-card);
  width: 100%;
  max-width: 560px;
  max-height: 85vh;
  overflow-y: auto;

  & h2 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 1.2rem;
  }
}

.perfil__cerrar {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 1.1rem;
  color: var(--color-text-muted);
  cursor: pointer;
}

.perfil__error {
  color: var(--color-error);
}

.perfil__resenas {
  margin-bottom: 16px;
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
}

.perfil__resena-fecha {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.perfil__resena-estrellas {
  margin: 0;
}

.perfil__resena-comentario {
  margin: 6px 0 0;
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

  .perfil__cabecera {
    margin: -20px -20px 20px;
    padding: 20px;
  }
  

  .perfil__sidebar {
    position: static;
  }
}
</style>