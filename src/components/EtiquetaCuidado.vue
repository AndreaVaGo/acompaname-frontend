<script setup>
import { computed } from "vue";
import { buscarCuidado } from "@/utils/catalogoCuidados";
import { buscarTitulacion } from "@/utils/catalogoTitulaciones";
import { buscarGrupo } from "@/utils/catalogoGrupos";
import { buscarModalidad, buscarExtra } from "@/utils/catalogoModalidades";
import { coloresDe } from "@/utils/paletaEtiquetas";

// Etiqueta con icono y color fijos: la misma en todas las pantallas y en todos los perfiles.
// Según "tipo" busca el código en un catálogo u otro:
//  - "cuidado": servicio o necesidad (medicación, higiene...)
//  - "titulacion": enfermería, TCAE... (se destaca: fondo lleno y letra blanca)
//  - "grupo": a quién cuida (bebés, personas mayores...)
//  - "modalidad": dónde cuida (hospital, domicilio)
//  - "extra": disponible ahora, vehículo propio
// El icono se pinta con CSS (data-icono), así que el texto de la etiqueta es solo el nombre.
const props = defineProps({
  codigo: { type: String, required: true },
  tipo: { type: String, default: "cuidado" },
  // Solo para titulaciones: el nombre corto (el de las tarjetas) en vez del completo
  corto: { type: Boolean, default: false },
});

const BUSCADORES = {
  cuidado: buscarCuidado,
  titulacion: buscarTitulacion,
  grupo: buscarGrupo,
  modalidad: buscarModalidad,
  extra: buscarExtra,
};

const esTitulacion = computed(() => props.tipo === "titulacion");

// Los datos del catálogo (o undefined si el código no existe)
const datos = computed(() => {
  const buscar = BUSCADORES[props.tipo] || buscarCuidado;
  return buscar(props.codigo);
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
