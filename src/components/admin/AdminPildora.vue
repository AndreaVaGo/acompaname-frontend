<script setup>
// Píldora de color del panel de administración (estado, tipo de cuidado, rol...).
// El texto va dentro (en el slot). color puede ser: naranja, verde, azul, gris o rojo.
// Con punto = true sale un puntito delante, como en los estados.
defineProps({
  color: { type: String, default: "gris" },
  punto: { type: Boolean, default: false },
});
</script>

<template>
  <span
    class="admin-pildora"
    :class="['admin-pildora--' + color, { 'admin-pildora--punto': punto }]"
  >
    <slot />
  </span>
</template>

<style scoped>
.admin-pildora {
  --fondo: var(--color-neutral-bg);
  --letra: var(--color-text-muted);

  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  background-color: var(--fondo);
  color: var(--letra);
  font-size: 0.8rem;
  font-weight: bold;
}

/* Con punto: puntito del mismo color que la letra */
.admin-pildora--punto {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.admin-pildora--punto::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
}

/* El gris es el color por defecto */
.admin-pildora--naranja {
  --fondo: var(--color-accent-bg);
  --letra: var(--color-accent-dark);
}

.admin-pildora--verde {
  --fondo: var(--color-secondary-bg);
  --letra: var(--color-secondary);
}

.admin-pildora--azul {
  --fondo: var(--color-info-bg);
  --letra: var(--color-info);
}

.admin-pildora--rojo {
  --fondo: var(--color-error-bg);
  --letra: var(--color-error);
}
</style>
