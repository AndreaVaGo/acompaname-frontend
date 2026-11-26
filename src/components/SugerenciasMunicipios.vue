<script setup>
import { ref, onMounted } from "vue";

// Lista de sugerencias de municipios de España para un campo de ciudad.
// Se usa así: el campo lleva list="lista-municipios" y en algún sitio de la pantalla
// se pone <SugerenciasMunicipios />
const municipios = ref([]);

// La lista es grande: se carga cuando aparece el campo, no al abrir la web
onMounted(async () => {
  const catalogo = await import("@/utils/catalogoMunicipios");
  municipios.value = catalogo.MUNICIPIOS;
});
</script>

<template>
  <datalist id="lista-municipios">
    <option
      v-for="municipio in municipios"
      :key="municipio[0] + municipio[1]"
      :value="municipio[0]"
      :label="'(' + municipio[1] + ')'"
    ></option>
  </datalist>
</template>
