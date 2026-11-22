<script setup>
// Sello pequeño que se enseña en las tarjetas y en el perfil de una persona cuidadora.
// Solo aparece lo que un administrador ha comprobado: no se enseña ninguna referencia.
defineProps({
  titulacion: { type: Boolean, default: false },
  antecedentes: { type: Boolean, default: false },
});
</script>

<template>
  <span class="insignias" v-if="titulacion || antecedentes">
    <span class="insignia" data-testid="insignia-titulacion" v-if="titulacion">
      <span aria-hidden="true">✓</span> Titulación verificada
    </span>
    <span class="insignia" data-testid="insignia-antecedentes" v-if="antecedentes">
      <span aria-hidden="true">✓</span> Antecedentes verificados
    </span>
  </span>
</template>

<style scoped>
.insignias {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
}

.insignia {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  font-family: var(--font-base);
  font-size: 0.8rem;
  font-weight: bold;
  background-color: var(--color-secondary-bg);
  color: var(--color-secondary);
  border: 1px solid var(--color-secondary);
}
</style>
