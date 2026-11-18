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
    <!-- Al cambiar de página, la antigua se desvanece y la nueva entra suavemente (estilos en base.css) -->
    <RouterView v-slot="{ Component, route }">
      <Transition name="pagina" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </main>
  <AppFooter />
</template>

