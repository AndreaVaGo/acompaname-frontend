<script setup>
import { ref } from "vue";

// Campo de contraseña con un ojo para verla u ocultarla.
// Se usa igual que un input: <CampoPassword id="password" v-model="password" />
defineProps({
  modelValue: { type: String, default: "" },
  id: { type: String, required: true },
  placeholder: { type: String, default: "" },
  // Si hay un error en el campo: se marca como inválido y se une a su mensaje (por su id)
  invalido: { type: Boolean, default: false },
  descritoPor: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

// Empieza oculta: así nadie ve la contraseña por encima del hombro sin querer
const visible = ref(false);

function alternar() {
  visible.value = !visible.value;
}
</script>

<template>
  <div class="campo-password">
    <input
      class="campo-password__input"
      :id="id"
      :type="visible ? 'text' : 'password'"
      :placeholder="placeholder"
      :aria-invalid="invalido ? 'true' : undefined"
      :aria-describedby="invalido && descritoPor ? descritoPor : undefined"
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
    />
    <!-- type="button" para que no envíe el formulario al pulsarlo -->
    <button
      type="button"
      class="campo-password__ojo"
      :aria-label="visible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
      :aria-pressed="visible"
      @click="alternar"
    >
      <!-- Ojo tachado cuando se está viendo; ojo abierto cuando está oculta -->
      <svg
        v-if="visible"
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
        />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
      <svg
        v-else
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.campo-password {
  position: relative;
}

.campo-password__input {
  width: 100%;
  box-sizing: border-box;
  /* Deja sitio al ojo. Lleva !important porque el estilo común de los
     formularios (base.css) es más específico y pisaría este espacio */
  padding-right: 48px !important;
}

/* El ojo ocupa la altura del campo, sin contar el margen de debajo */
.campo-password__ojo {
  position: absolute;
  top: 0;
  bottom: var(--gap-md);
  right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
}

.campo-password__ojo svg {
  width: 20px;
  height: 20px;
}

.campo-password__ojo:focus-visible {
  outline: 2px solid var(--color-accent);
  border-radius: var(--radius-input);
}

@media (hover: hover) {
  .campo-password__ojo:hover {
    color: var(--color-accent-dark);
  }
}
</style>
