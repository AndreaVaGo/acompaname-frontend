<script setup>
import { ref, computed } from "vue";

// Segundo paso del login: la persona escribe el código de 6 cifras que le llegó al correo.
// No habla con el servidor: avisa a la vista con "verificar" (con el código) o "volver".
defineProps({
  correo: { type: String, default: "" },
  error: { type: String, default: "" },
});
const emit = defineEmits(["verificar", "volver"]);

const LONGITUD = 6;
const codigo = ref("");
const errorLocal = ref("");
const enfocado = ref(false);

// Las seis casillas que se ven: cada una con su cifra (o vacía)
const casillas = computed(() =>
  Array.from({ length: LONGITUD }, (_, i) => codigo.value[i] || "")
);

// Solo se aceptan cifras (así también vale si pegan "123 456"), y como mucho 6
function alEscribir(evento) {
  codigo.value = evento.target.value.replace(/\D/g, "").slice(0, LONGITUD);
  evento.target.value = codigo.value;
  errorLocal.value = "";
}

function enviar() {
  if (codigo.value.length !== LONGITUD) {
    errorLocal.value = "Escribe los 6 números del código.";
    return;
  }
  errorLocal.value = "";
  emit("verificar", codigo.value);
}
</script>

<template>
  <form class="formulario codigo" @submit.prevent="enviar">
    <span class="codigo__sobre" aria-hidden="true">✉️</span>
    <h2 class="titulo-seccion" data-icono="🔐">Revisa tu correo</h2>
    <p class="codigo__texto">
      Te hemos enviado un código de 6 cifras<span v-if="correo"> a <strong>{{ correo }}</strong></span>.
      Caduca en unos minutos.
    </p>

    <label for="codigo">Código</label>
    <div class="codigo__casillas" :class="{ 'codigo__casillas--foco': enfocado }">
      <span
        v-for="(cifra, i) in casillas"
        :key="i"
        class="codigo__casilla"
        :class="{
          'codigo__casilla--llena': cifra,
          'codigo__casilla--activa': enfocado && i === Math.min(codigo.length, LONGITUD - 1),
        }"
        aria-hidden="true"
      >{{ cifra }}</span>
      <!-- El campo de verdad va encima de las casillas, invisible, para que funcione el teclado y el pegado -->
      <input
        id="codigo"
        class="codigo__campo"
        type="text"
        inputmode="numeric"
        autocomplete="one-time-code"
        maxlength="6"
        :value="codigo"
        @input="alEscribir"
        @focus="enfocado = true"
        @blur="enfocado = false"
      />
    </div>

    <p role="alert" v-if="errorLocal || error" class="codigo__error">
      {{ errorLocal || error }}
    </p>

    <button type="submit" class="btn btn--primary">Comprobar código</button>
    <button type="button" class="codigo__volver" @click="emit('volver')">
      ← Volver
    </button>
  </form>
</template>

<style scoped>
.codigo {
  text-align: center;
}

/* El sobre llega desde arriba con un pequeño rebote y luego flota despacio */
.codigo__sobre {
  display: inline-block;
  font-size: 2.6rem;
  animation:
    sobre-llega 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) backwards,
    sobre-flota 3s ease-in-out 0.7s infinite;
}

@keyframes sobre-llega {
  from {
    opacity: 0;
    translate: 0 -40px;
    rotate: -12deg;
  }
}

@keyframes sobre-flota {
  50% {
    translate: 0 -5px;
  }
}

.codigo__texto {
  margin: 0 0 18px;
  font-size: 0.95rem;
  color: var(--color-text-muted);
  overflow-wrap: anywhere;
}

.codigo__casillas {
  position: relative;
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.codigo__casilla {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 56px;
  background-color: var(--color-white);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-input);
  font-size: 1.6rem;
  font-weight: bold;
  transition:
    border-color var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-fast) var(--ease-out);
}

/* Al escribir una cifra, la casilla "salta" un poco y se tiñe de verde */
.codigo__casilla--llena {
  border-color: var(--color-secondary);
  background-color: var(--color-secondary-bg);
  animation: casilla-pop 0.25s var(--ease-out);
}

@keyframes casilla-pop {
  from {
    scale: 0.85;
  }
  60% {
    scale: 1.08;
  }
}

/* La casilla donde se escribirá la siguiente cifra, con el aro de foco de la marca */
.codigo__casilla--activa {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-bg);
}

.codigo__campo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  opacity: 0;
  /* 16px como mínimo para que el móvil no haga zoom al tocar el campo */
  font-size: 16px;
  cursor: text;
}

.codigo__error {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  margin: 0 0 16px;
}

.codigo .btn {
  width: 100%;
  padding: 14px;
}

.codigo__volver {
  margin-top: 12px;
  background: none;
  border: none;
  color: var(--color-accent-dark);
  font: inherit;
  font-size: 0.95rem;
  cursor: pointer;
}

@media (hover: hover) {
  .codigo__volver:hover {
    text-decoration: underline;
  }
}

@media (max-width: 400px) {
  .codigo__casillas {
    gap: 5px;
  }

  .codigo__casilla {
    width: 40px;
    height: 50px;
  }
}
</style>
