<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<template>
  <!-- Enlace para quien navega con teclado: salta la barra y va al contenido -->
  <a href="#contenido" class="saltar-contenido">Saltar al contenido</a>
  <NavBar />
  <main id="contenido" tabindex="-1">
    <RouterView />
  </main>
  <AppFooter />
</template>

