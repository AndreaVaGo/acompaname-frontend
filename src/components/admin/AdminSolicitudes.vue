<script setup>
import { formatearFecha } from "@/utils/formatearFecha";
import { nombreTipo, colorTipo } from "@/utils/nombreTipo";
import AdminFiltros from "@/components/admin/AdminFiltros.vue";
import AdminPildora from "@/components/admin/AdminPildora.vue";

// Tabla de solicitudes con botones de estado (cada uno con el mismo color que su píldora).
// estado es lo que está elegido en el filtro ("" = todas).
defineProps({
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
</script>

<template>
  <section class="admin-solicitudes" id="solicitudes">
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

    <div v-else class="admin-tabla">
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Familia</th>
            <th>Persona cuidadora</th>
            <th>Fecha</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="solicitud in solicitudes" :key="solicitud.id">
            <td data-label="Tipo">
              <AdminPildora :color="colorTipo(solicitud.tipoCuidado)">
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
  </section>
</template>

<style scoped>
.admin-solicitudes {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: var(--shadow-card);
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
  background-color: var(--color-neutral-bg);
  font-weight: bold;
}
</style>