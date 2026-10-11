<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  foto: { type: String, default: "" },
  nombre: { type: String, default: "" },
  tamano: { type: Number, default: 64 },
});

// Si la imagen no carga, se enseña el monigote como si no hubiera foto
const falloAlCargar = ref(false);

watch(
  () => props.foto,
  () => {
    falloAlCargar.value = false;
  },
);

const mostrarFoto = computed(() => props.foto && !falloAlCargar.value);

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
  <span v-else class="foto-cuidador foto-cuidador--sin-foto" :style="medidas">
    <svg viewBox="0 0 24 24" aria-hidden="true">
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
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
}

.foto-cuidador--sin-foto svg {
  width: 80%;
  height: 80%;
  fill: var(--color-accent);
}
</style>