<script setup>
// Tres personas dibujadas en círculos que se solapan (solo decoración, no hay fotos de personas reales)
</script>

<template>
  <svg
    class="avatares"
    viewBox="0 0 84 36"
    width="84"
    height="36"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <!-- Recorte en círculo: cada persona se ve solo dentro de su círculo -->
      <clipPath id="avatares-recorte">
        <circle r="16" />
      </clipPath>
    </defs>

    <g transform="translate(18 18)">
      <circle r="16" fill="var(--color-accent-bg)" />
      <g clip-path="url(#avatares-recorte)" fill="var(--color-accent)">
        <circle cy="-4" r="6" />
        <ellipse cy="16" rx="11" ry="9" />
      </g>
      <circle r="16" fill="none" stroke="var(--color-bg)" stroke-width="2" />
    </g>

    <g transform="translate(42 18)">
      <circle r="16" fill="var(--color-secondary-bg)" />
      <g clip-path="url(#avatares-recorte)" fill="var(--color-secondary)">
        <circle cy="-4" r="6" />
        <ellipse cy="16" rx="11" ry="9" />
      </g>
      <circle r="16" fill="none" stroke="var(--color-bg)" stroke-width="2" />
    </g>

    <g transform="translate(66 18)">
      <circle r="16" fill="var(--color-accent-bg)" />
      <g clip-path="url(#avatares-recorte)" fill="var(--color-accent-dark)">
        <circle cy="-4" r="6" />
        <ellipse cy="16" rx="11" ry="9" />
      </g>
      <circle r="16" fill="none" stroke="var(--color-bg)" stroke-width="2" />
    </g>
  </svg>
</template>