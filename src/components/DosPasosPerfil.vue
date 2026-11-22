<script setup>
import { ref, onMounted } from "vue";
import DosPasosRepository from "@/repositories/DosPasosRepository";
import CampoPassword from "@/components/CampoPassword.vue";
import { mensajeDeError } from "@/utils/mensajeDeError";

// Bloque de "Mi perfil" para activar o desactivar el inicio de sesión en dos pasos.
// Para cambiarlo hay que escribir la contraseña, así que no lo puede tocar alguien que
// se encuentre la sesión abierta.
const repository = new DosPasosRepository();

// null mientras no se sabe (o si no se ha podido consultar: entonces el bloque no se enseña)
const activo = ref(null);
const abierto = ref(false);
const password = ref("");
const error = ref("");
const aviso = ref("");
const enviando = ref(false);

onMounted(async () => {
  try {
    const estado = await repository.getEstado();
    activo.value = estado.activo;
  } catch {
    // Sin el estado no se puede cambiar nada: se deja el bloque oculto
    activo.value = null;
  }
});

function abrir() {
  abierto.value = true;
  aviso.value = "";
  error.value = "";
}

function cancelar() {
  abierto.value = false;
  password.value = "";
  error.value = "";
}

async function confirmar() {
  if (!password.value) {
    error.value = "Escribe tu contraseña para confirmar.";
    return;
  }
  error.value = "";
  enviando.value = true;
  try {
    const estado = await repository.cambiar(!activo.value, password.value);
    activo.value = estado.activo;
    aviso.value = estado.activo
      ? "Listo: a partir de ahora te pediremos un código al iniciar sesión."
      : "Listo: has desactivado el inicio de sesión en dos pasos.";
    cancelar();
  } catch (err) {
    // 400: la contraseña no es correcta
    if (err.status === 400) {
      error.value = "La contraseña no es correcta.";
    } else {
      error.value = mensajeDeError(err, "No se pudo hacer el cambio.");
    }
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <section class="dos-pasos" v-if="activo !== null">
    <h3 class="dos-pasos__seccion">Seguridad</h3>
    <div class="dos-pasos__cabecera">
      <span class="dos-pasos__escudo" :class="{ 'dos-pasos__escudo--activo': activo }" aria-hidden="true">
        {{ activo ? "🛡️" : "🔓" }}
      </span>
      <div class="dos-pasos__textos">
        <h2>Inicio de sesión en dos pasos</h2>
        <p>
          Además de tu contraseña, te pediremos un código de 6 cifras que te
          mandamos al correo.
        </p>
      </div>
      <span
        class="dos-pasos__estado"
        :class="{ 'dos-pasos__estado--activo': activo }"
        data-testid="estado-dos-pasos"
      >
        {{ activo ? "Activado" : "Desactivado" }}
      </span>
    </div>

    <p v-if="aviso" role="status" class="dos-pasos__aviso">{{ aviso }}</p>

    <button
      v-if="!abierto"
      type="button"
      class="btn btn--secondary dos-pasos__boton"
      :class="{ 'dos-pasos__boton--desactivar': activo }"
      @click="abrir"
    >
      {{ activo ? "Desactivar" : "Activar" }}
    </button>

    <Transition name="dos-pasos-abre">
      <form v-if="abierto" class="formulario dos-pasos__form" @submit.prevent="confirmar">
        <label for="dos-pasos-password">
          Escribe tu contraseña para {{ activo ? "desactivarlo" : "activarlo" }}
        </label>
        <CampoPassword
          id="dos-pasos-password"
          placeholder="••••••"
          v-model="password"
        />

        <p role="alert" v-if="error" class="dos-pasos__error">{{ error }}</p>

        <div class="dos-pasos__botones">
          <button type="submit" class="btn btn--primary" :disabled="enviando">
            Confirmar
          </button>
          <button type="button" class="btn btn--secondary" @click="cancelar">
            Cancelar
          </button>
        </div>
      </form>
    </Transition>
  </section>
</template>

<style scoped>
.dos-pasos {
  padding: 18px 28px 8px;
}

/* Mismo título pequeño que "Tus datos" en Mi perfil */
.dos-pasos__seccion {
  margin: 0 0 10px;
  font-family: var(--font-base);
  font-size: 0.78rem;
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.dos-pasos__cabecera {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  /* Blanca y con sombra: se distingue de las filas grises de datos, es una tarjeta propia */
  background-color: var(--color-white);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-secondary);
  border-radius: var(--radius-input);
  box-shadow: var(--shadow-card);
}

.dos-pasos__escudo {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-neutral-bg);
  font-size: 1.5rem;
}

/* Con el segundo paso activado, el escudo late despacio para que se note que protege la cuenta */
.dos-pasos__escudo--activo {
  animation: escudo-late 2.6s ease-in-out infinite;
}

@keyframes escudo-late {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(46, 125, 91, 0.35);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(46, 125, 91, 0);
  }
}

.dos-pasos__textos {
  flex: 1;
  min-width: 0;

  & h2 {
    margin: 0 0 4px;
    font-size: 1.05rem;
  }

  & p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-text-muted);
  }
}

.dos-pasos__estado {
  flex-shrink: 0;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  background-color: var(--color-neutral-bg);
  border: 1px solid var(--color-border);
  font-size: 0.78rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dos-pasos__estado--activo {
  background-color: var(--color-secondary-bg);
  border-color: var(--color-secondary);
  color: var(--color-secondary);
}

.dos-pasos__aviso {
  margin: 12px 0 0;
  padding: 10px 14px;
  background-color: var(--color-secondary-bg);
  border-radius: var(--radius-input);
  color: var(--color-secondary);
  font-size: 0.9rem;
  animation: entra-sube var(--dur-med) var(--ease-out);
}

.dos-pasos__boton {
  width: 100%;
  margin-top: 12px;
}

/* Botones del bloque: ya vienen con su color de relleno (no solo al pasar el ratón).
   Activar en verde y Desactivar en coral oscuro, porque quita protección */
.dos-pasos__boton {
  background-color: var(--color-secondary);
  border: 2px solid var(--color-secondary);
  color: var(--color-white);
  font-weight: bold;
  transition: filter var(--dur-fast) var(--ease-out);
}

.dos-pasos__boton--desactivar {
  background-color: var(--color-accent-dark);
  border-color: var(--color-accent-dark);
}

/* Cancelar: gris suave, para que Confirmar destaque */
.dos-pasos__botones .btn--secondary {
  background-color: var(--color-neutral-bg);
  border: 2px solid var(--color-border);
  color: var(--color-text);
  font-weight: bold;
  transition: filter var(--dur-fast) var(--ease-out);
}

/* Al pasar el ratón se oscurecen un poco */
@media (hover: hover) {
  .dos-pasos__boton:hover,
  .dos-pasos__botones .btn--secondary:hover {
    filter: brightness(0.92);
  }
}

.dos-pasos__form {
  margin-top: 12px;
}

.dos-pasos__error {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: 0 0 12px;
}

.dos-pasos__botones {
  display: flex;
  gap: 10px;

  & .btn {
    flex: 1;
  }
}

/* El formulario se despliega suavemente al pulsar Activar o Desactivar */
.dos-pasos-abre-enter-active,
.dos-pasos-abre-leave-active {
  transition:
    opacity var(--dur-med) var(--ease-out),
    translate var(--dur-med) var(--ease-out);
}

.dos-pasos-abre-enter-from,
.dos-pasos-abre-leave-to {
  opacity: 0;
  translate: 0 -10px;
}

@media (max-width: 768px) {
  .dos-pasos {
    padding: 16px 20px 8px;
  }

  .dos-pasos__cabecera {
    flex-wrap: wrap;
  }
}
</style>
