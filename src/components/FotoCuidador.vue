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

const inicial = computed(() => props.nombre.charAt(0).toUpperCase());

const medidas = computed(() => ({
  width: props.tamano + "px",
  height: props.tamano + "px",
  fontSize: props.tamano / 2.5 + "px",
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
  <span v-else class="foto-cuidador foto-cuidador--inicial" :style="medidas">
    {{ inicial }}
  </span>
</template>

<style scoped>
.foto-cuidador {
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
}

.foto-cuidador--inicial {
  background-color: var(--color-accent-bg);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
</style>