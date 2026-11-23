<script setup>
import { computed } from "vue";
import { buscarCuidado } from "@/utils/catalogoCuidados";
import { buscarTitulacion } from "@/utils/catalogoTitulaciones";
import { coloresDe } from "@/utils/paletaEtiquetas";

// Etiqueta de un servicio (medicación, higiene...) o de una titulación (enfermería, TCAE...).
// Cada una lleva siempre el mismo icono y el mismo color, en todas las pantallas.
// Las titulaciones se destacan: fondo lleno de color y letra blanca.
// El icono se pinta con CSS (data-icono), así que el texto de la etiqueta es solo el nombre.
const props = defineProps({
  codigo: { type: String, required: true },
  // "cuidado" (servicio o necesidad) o "titulacion"
  tipo: { type: String, default: "cuidado" },
  // Solo para titulaciones: el nombre corto (el de las tarjetas) en vez del completo
  corto: { type: Boolean, default: false },
});

const esTitulacion = computed(() => props.tipo === "titulacion");

// Los datos del catálogo (o undefined si el código no existe)
const datos = computed(() => {
  return esTitulacion.value ? buscarTitulacion(props.codigo) : buscarCuidado(props.codigo);
});

const nombre = computed(() => {
  if (!datos.value) {
    return props.codigo;
  }
  if (esTitulacion.value && props.corto) {
    return datos.value.corto;
  }
  return datos.value.nombre;
});

// Con el estilo en línea, el color es siempre el mismo aunque la pantalla tenga sus propias reglas
const estilo = computed(() => {
  const colores = coloresDe(datos.value ? datos.value.color : "");
  if (esTitulacion.value) {
    return { backgroundColor: colores.solido, color: "#ffffff" };
  }
  return { backgroundColor: colores.fondo, color: colores.texto };
});
</script>

<template>
  <span
    class="etiqueta"
    :class="{ 'etiqueta--titulacion': esTitulacion }"
    :style="estilo"
    :data-icono="datos ? datos.icono : ''"
    >{{ nombre }}</span
  >
</template>

<style scoped>
.etiqueta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-family: var(--font-base);
  font-size: 0.85rem;
}

/* El icono va antes del nombre. La segunda línea lo marca como decoración para los lectores de pantalla */
.etiqueta::before {
  content: attr(data-icono);
  content: attr(data-icono) / "";
  font-size: 0.95em;
}

.etiqueta[data-icono=""]::before {
  display: none;
}

/* Las titulaciones destacan: fondo lleno, letra en negrita y una sombra suave */
.etiqueta--titulacion {
  font-weight: bold;
  padding: 5px 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
}
</style>
