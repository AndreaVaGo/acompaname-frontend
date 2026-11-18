<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  foto: { type: String, default: "" },
  nombre: { type: String, default: "" },
  tamano: { type: Number, default: 64 },
});

// Si la imagen no carga, se enseña la inicial como si no hubiera foto
const falloAlCargar = ref(false);

watch(
  () => props.foto,
  () => {
    falloAlCargar.value = false;
  },
);

const mostrarFoto = computed(() => props.foto && !falloAlCargar.value);

// Sin foto se enseña la inicial del nombre en mayúscula (Ana -> A).
// Si no hay nombre, se queda el monigote de siempre
const inicial = computed(() => (props.nombre ? props.nombre.trim().charAt(0).toUpperCase() : ""));

// La letra mide algo menos de la mitad del círculo, para que quede centrada y bien visible
const estiloInicial = computed(() => ({
  fontSize: Math.round(props.tamano * 0.45) + "px",
}));

const medidas = computed(() => ({
  width: props.tamano + "px",
  height: props.tamano + "px",
}));
</script>

<template>
  <img
    v-if="mostrarFoto"
    class="foto-cuidador"
    :src="foto"
    :alt="'Foto de ' + nombre"
    :style="medidas"
    @error="falloAlCargar = true"
  />
  <span
    v-else
    class="foto-cuidador foto-cuidador--sin-foto"
    :style="medidas"
    role="img"
    :aria-label="nombre ? 'Sin foto de ' + nombre : 'Sin foto'"
  >
    <span v-if="inicial" class="foto-cuidador__inicial" :style="estiloInicial" aria-hidden="true">{{
      inicial
    }}</span>
    <svg v-else viewBox="0 0.5 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8z" />
    </svg>
  </span>
</template>

<style scoped>
.foto-cuidador {
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
}

.foto-cuidador--sin-foto {
  background-color: var(--color-accent-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.foto-cuidador__inicial {
  color: var(--color-accent-dark);
  font-weight: bold;
  line-height: 1;
  user-select: none;
}

.foto-cuidador--sin-foto svg {
  width: 70%;
  height: 70%;
  fill: var(--color-accent);
}
</style>