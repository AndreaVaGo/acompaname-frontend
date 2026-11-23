<script setup>
import { ref, computed } from "vue";
import { formatearFecha } from "@/utils/formatearFecha";
import { nombreTipo, colorTipo, iconoTipo } from "@/utils/nombreTipo";
import AdminFiltros from "@/components/admin/AdminFiltros.vue";
import AdminPildora from "@/components/admin/AdminPildora.vue";
import AdminCabeceraOrden from "@/components/admin/AdminCabeceraOrden.vue";
import AdminOrdenar from "@/components/admin/AdminOrdenar.vue";
import { ordenarFilas } from "@/utils/ordenarTabla";

// Tabla de solicitudes con botones de estado (cada uno con el mismo color que su píldora).
// estado es lo que está elegido en el filtro ("" = todas).
const props = defineProps({
  solicitudes: { type: Array, required: true },
  estado: { type: String, default: "" },
});

const emit = defineEmits(["cambiarEstado"]);

// Cada estado lleva el color de su píldora
const ESTADOS = [
  { valor: "", nombre: "Todos", color: "neutro" },
  { valor: "PENDIENTE", nombre: "Pendiente", color: "naranja" },
  { valor: "ACEPTADA", nombre: "Aceptada", color: "verde" },
  { valor: "COMPLETADA", nombre: "Completada", color: "azul" },
  { valor: "RECHAZADA", nombre: "Rechazada", color: "gris" },
];

// Color de la píldora del estado (el mismo que el de su botón del filtro)
function colorEstado(estado) {
  for (const opcion of ESTADOS) {
    if (opcion.valor === estado) {
      return opcion.color;
    }
  }
  return "gris";
}

function nombreEstado(estado) {
  for (const opcion of ESTADOS) {
    if (opcion.valor === estado) {
      return opcion.nombre;
    }
  }
  return estado;
}

// Orden de la tabla: por qué columna y en qué sentido ("" = como llegan del servidor)
const orden = ref({ clave: "", direccion: "asc" });

// Las columnas por las que se puede ordenar (también las usa el desplegable del móvil)
const COLUMNAS = [
  { clave: "tipo", nombre: "Tipo" },
  { clave: "familia", nombre: "Familia" },
  { clave: "cuidador", nombre: "Persona cuidadora" },
  { clave: "fecha", nombre: "Fecha" },
  { clave: "estado", nombre: "Estado" },
];

// Cómo sacar de una solicitud el valor de cada columna
// (el estado se ordena como el flujo: pendiente, aceptada, completada, rechazada)
const VALORES = {
  tipo: (solicitud) => nombreTipo(solicitud.tipoCuidado),
  familia: (solicitud) => solicitud.nombreFamilia,
  cuidador: (solicitud) => solicitud.nombreCuidador,
  fecha: (solicitud) => solicitud.fechaCuidado,
  estado: (solicitud) => ESTADOS.findIndex((opcion) => opcion.valor === solicitud.estado),
};

const solicitudesOrdenadas = computed(() => ordenarFilas(props.solicitudes, VALORES, orden.value));

// Las flechas de la cabecera y el desplegable del móvil mandan el orden ya decidido
function cambiarOrden(nuevoOrden) {
  orden.value = nuevoOrden;
}
</script>

<template>
  <section class="admin-solicitudes admin-panel" id="solicitudes">
    <div class="admin-solicitudes__cabecera">
      <h2 class="admin-solicitudes__titulo">Solicitudes</h2>
    </div>

    <AdminFiltros
      :opciones="ESTADOS"
      :elegido="estado"
      etiqueta="Filtrar por estado"
      @elegir="emit('cambiarEstado', $event)"
    />

    <p v-if="solicitudes.length === 0" class="admin-solicitudes__vacio">
      No hay solicitudes con este estado.
    </p>

    <template v-else>
    <AdminOrdenar :columnas="COLUMNAS" :orden="orden" @ordenar="cambiarOrden" />

    <div class="admin-tabla">
      <table>
        <thead>
          <tr>
            <AdminCabeceraOrden
              v-for="columna in COLUMNAS"
              :key="columna.clave"
              :etiqueta="columna.nombre"
              :clave="columna.clave"
              :orden="orden"
              @ordenar="cambiarOrden"
            />
          </tr>
        </thead>
        <tbody>
          <tr v-for="solicitud in solicitudesOrdenadas" :key="solicitud.id">
            <td data-label="Tipo">
              <AdminPildora
                :color="colorTipo(solicitud.tipoCuidado)"
                :data-icono="iconoTipo(solicitud.tipoCuidado)"
              >
                {{ nombreTipo(solicitud.tipoCuidado) }}
              </AdminPildora>
            </td>
            <td data-label="Familia">{{ solicitud.nombreFamilia }}</td>
            <td data-label="Persona cuidadora">{{ solicitud.nombreCuidador }}</td>
            <td data-label="Fecha">
              <span class="admin-solicitudes__fecha">
                {{ formatearFecha(solicitud.fechaCuidado) }}
              </span>
            </td>
            <td data-label="Estado">
              <AdminPildora :color="colorEstado(solicitud.estado)" punto>
                {{ nombreEstado(solicitud.estado) }}
              </AdminPildora>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </template>
  </section>
</template>

<style scoped>
.admin-solicitudes {
  padding: 24px;
  /* El cristal viene de la clase global admin-panel; aquí solo el color de la sección */
  --admin-color: var(--color-accent);
}

.admin-solicitudes__cabecera {
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-accent-bg);
}

.admin-solicitudes__titulo {
  margin: 0;
  font-size: 1.15rem;
  color: var(--color-accent-dark);
}


.admin-solicitudes__vacio {
  margin: 0;
  color: var(--color-text-muted);
}

/* Fecha en una pastilla suave y en negrita */
.admin-solicitudes__fecha {
  display: inline-block;
  padding: 4px 10px;
  border-radius: var(--radius-input);
  background-color: color-mix(in srgb, var(--admin-color) 12%, white);
  font-weight: bold;
}
</style>